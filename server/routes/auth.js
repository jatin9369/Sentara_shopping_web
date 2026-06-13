const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { authenticate, JWT_SECRET } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limit OTP requests to max 5 per 5 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many OTP requests from this IP. Please wait 5 minutes.'
  }
});

const USERS_FILE = path.join(__dirname, '../data/users.json');

// In-memory OTP store: mobile -> { otp, expiresAt, name }
const otpStore = new Map();

// Helper: read users from file
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: write users to file
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Helper: generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Sends SMS via Twilio or Fast2SMS based on configured environment variables
 */
async function sendSMS(mobile, message, otp) {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM;
  const fast2smsKey = process.env.FAST2SMS_API_KEY;

  if (twilioSid && twilioToken && twilioFrom) {
    console.log(`[SMS] Sending OTP to ${mobile} via Twilio...`);
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: `+91${mobile}`, // assuming Indian mobile number context, customize if needed
          From: twilioFrom,
          Body: message
        })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[SMS Error] Twilio error response:', data);
      } else {
        console.log('[SMS Success] Sent via Twilio:', data.sid);
        return true;
      }
    } catch (err) {
      console.error('[SMS Error] Failed to send via Twilio:', err);
    }
  }

  if (fast2smsKey) {
    console.log(`[SMS] Sending OTP to ${mobile} via Fast2SMS...`);
    try {
      const res = await fetch(`https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}&route=otp&variables_values=${otp}&numbers=${mobile}`);
      const data = await res.json();
      if (data.return) {
        console.log('[SMS Success] Sent via Fast2SMS:', data.message);
        return true;
      } else {
        console.error('[SMS Error] Fast2SMS error response:', data);
      }
    } catch (err) {
      console.error('[SMS Error] Failed to send via Fast2SMS:', err);
    }
  }

  console.log(`[SMS Mock] OTP not sent via SMS gateway (no API credentials found in environment). Code for ${mobile} is: ${otp}`);
  return false;
}

/**
 * POST /api/auth/send-otp
 * Body: { mobile, name? }
 * Returns: { success, otp, isNewUser }
 */
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { mobile, name } = req.body;

    // Validate mobile
    if (!mobile || !/^\d{10}$/.test(mobile.toString())) {
      return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required' });
    }

    const users = readUsers();
    const existingUser = users.find(u => u.mobile === mobile.toString());
    const isNewUser = !existingUser;

    // New user requires name
    if (isNewUser && (!name || name.trim().length < 2)) {
      return res.status(400).json({ success: false, error: 'Name is required for new users (minimum 2 characters)' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in memory
    otpStore.set(mobile.toString(), {
      otp,
      expiresAt,
      name: isNewUser ? name.trim() : (existingUser ? existingUser.name : name)
    });

    // Send SMS asynchronously
    const messageText = `Your SENTARA verification OTP is ${otp}. Valid for 5 minutes. Do not share this with anyone.`;
    sendSMS(mobile.toString(), messageText, otp);

    const isMock = !process.env.TWILIO_ACCOUNT_SID && !process.env.FAST2SMS_API_KEY;

    return res.status(200).json({
      success: true,
      // Only expose OTP in response if no SMS gateway config exists
      ...(isMock ? { otp } : {}),
      isNewUser,
      message: isNewUser
        ? `OTP sent to ${mobile}. Welcome, ${name}!`
        : `OTP sent to ${mobile}. Welcome back!`
    });
  } catch (err) {
    console.error('send-otp error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify-otp
 * Body: { mobile, otp }
 * Returns: { success, token, user }
 */
router.post('/verify-otp', (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, error: 'Mobile and OTP are required' });
    }

    const mobileStr = mobile.toString();
    const otpStr = otp.toString();

    const stored = otpStore.get(mobileStr);

    if (!stored) {
      return res.status(400).json({ success: false, error: 'OTP not found. Please request a new OTP.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(mobileStr);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    if (stored.otp !== otpStr) {
      return res.status(400).json({ success: false, error: 'Invalid OTP. Please try again.' });
    }

    // OTP verified — clear from store
    otpStore.delete(mobileStr);

    let users = readUsers();
    let user = users.find(u => u.mobile === mobileStr);

    if (!user) {
      // Create new user
      user = {
        id: uuidv4(),
        name: stored.name,
        mobile: mobileStr,
        email: null,
        createdAt: new Date().toISOString(),
        cart: [],
        addresses: []
      };
      users.push(user);
      writeUsers(users);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, mobile: user.mobile, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        points: user.points || 0,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Requires: authenticate middleware
 * Returns: current user data
 */
router.get('/me', authenticate, (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        points: user.points || 0,
        createdAt: user.createdAt,
        addresses: user.addresses || []
      }
    });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/register
 * Body: { name, email, address, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters long' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
    }
    if (!address || address.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please enter a valid address (minimum 5 characters)' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const users = readUsers();
    const emailLower = email.trim().toLowerCase();
    const existingUser = users.find(u => u.email && u.email.toLowerCase() === emailLower);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const newUser = {
      id: uuidv4(),
      name: name.trim(),
      email: emailLower,
      password: password,
      mobile: "",
      points: 0,
      createdAt: new Date().toISOString(),
      cart: [],
      addresses: [
        {
          id: uuidv4(),
          label: 'Default Address',
          name: name.trim(),
          mobile: "",
          line1: address.trim(),
          line2: "",
          city: "",
          state: "",
          pincode: "",
          isDefault: true,
          createdAt: new Date().toISOString()
        }
      ]
    };

    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        points: newUser.points || 0,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const emailLower = email.trim().toLowerCase();
    const users = readUsers();
    const user = users.find(u => u.email && u.email.toLowerCase() === emailLower && u.password === password);

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points || 0,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
