const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper: read users
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: write users
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// All user routes require authentication
router.use(authenticate);

/**
 * GET /api/user/profile
 * Returns user profile (exclude cart for brevity)
 */
router.get('/profile', (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Return profile without cart data
    const { cart, ...profile } = user;

    return res.status(200).json({ success: true, user: profile });
  } catch (err) {
    console.error('GET /user/profile error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PUT /api/user/profile
 * Body: { name, email }
 * Updates user name/email, returns updated user + new JWT
 */
router.put('/profile', (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters' });
    }

    if (email && email.trim()) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, error: 'Invalid email address' });
      }
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update fields
    users[userIndex].name = name.trim();
    users[userIndex].email = email ? email.trim() : users[userIndex].email;
    users[userIndex].updatedAt = new Date().toISOString();

    writeUsers(users);

    const updatedUser = users[userIndex];

    // Issue new JWT with updated name
    const newToken = jwt.sign(
      { id: updatedUser.id, mobile: updatedUser.mobile, name: updatedUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { cart, ...profile } = updatedUser;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: profile,
      token: newToken
    });
  } catch (err) {
    console.error('PUT /user/profile error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/user/recently-viewed
 */
router.get('/recently-viewed', (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    return res.status(200).json({ success: true, recentlyViewed: user.recentlyViewed || [] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/user/recently-viewed
 * Body: { productId }
 */
router.post('/recently-viewed', (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, error: 'productId required' });
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) return res.status(404).json({ success: false, error: 'User not found' });
    
    let viewed = users[userIndex].recentlyViewed || [];
    viewed = [productId, ...viewed.filter(id => id !== productId)].slice(0, 6);
    users[userIndex].recentlyViewed = viewed;
    
    writeUsers(users);
    return res.status(200).json({ success: true, recentlyViewed: viewed });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/user/addresses
 * Returns user's addresses array
 */
router.get('/addresses', (req, res) => {
  try {
    const users = readUsers();
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      addresses: user.addresses || []
    });
  } catch (err) {
    console.error('GET /user/addresses error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/user/addresses
 * Body: { label, name, mobile, line1, line2, city, state, pincode, isDefault }
 * Adds new address with uuid. If isDefault, unsets other defaults.
 */
router.post('/addresses', (req, res) => {
  try {
    const { label, name, mobile, line1, line2, city, state, pincode, isDefault } = req.body;

    // Validate required fields
    if (!name || !mobile || !line1 || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        error: 'name, mobile, line1, city, state, and pincode are required'
      });
    }

    if (!/^\d{10}$/.test(mobile.toString())) {
      return res.status(400).json({ success: false, error: 'Mobile must be a 10-digit number' });
    }

    if (!/^\d{6}$/.test(pincode.toString())) {
      return res.status(400).json({ success: false, error: 'Pincode must be a 6-digit number' });
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!users[userIndex].addresses) {
      users[userIndex].addresses = [];
    }

    // If setting as default, unset all existing defaults
    if (isDefault) {
      users[userIndex].addresses = users[userIndex].addresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
    }

    const newAddress = {
      id: uuidv4(),
      label: label || 'Home',
      name: name.trim(),
      mobile: mobile.toString(),
      line1: line1.trim(),
      line2: line2 ? line2.trim() : '',
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.toString(),
      isDefault: !!isDefault,
      createdAt: new Date().toISOString()
    };

    users[userIndex].addresses.push(newAddress);
    writeUsers(users);

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: newAddress,
      addresses: users[userIndex].addresses
    });
  } catch (err) {
    console.error('POST /user/addresses error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PUT /api/user/addresses/:id
 * Body: { label, name, mobile, line1, line2, city, state, pincode, isDefault }
 * Updates existing address
 */
router.put('/addresses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { label, name, mobile, line1, line2, city, state, pincode, isDefault } = req.body;

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const addresses = users[userIndex].addresses || [];
    const addrIndex = addresses.findIndex(a => a.id === id);

    if (addrIndex === -1) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    // If setting as default, unset all existing defaults
    if (isDefault) {
      users[userIndex].addresses = addresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
    }

    const existingAddr = users[userIndex].addresses[addrIndex];
    users[userIndex].addresses[addrIndex] = {
      ...existingAddr,
      label: label !== undefined ? label : existingAddr.label,
      name: name !== undefined ? name.trim() : existingAddr.name,
      mobile: mobile !== undefined ? mobile.toString() : existingAddr.mobile,
      line1: line1 !== undefined ? line1.trim() : existingAddr.line1,
      line2: line2 !== undefined ? line2.trim() : existingAddr.line2,
      city: city !== undefined ? city.trim() : existingAddr.city,
      state: state !== undefined ? state.trim() : existingAddr.state,
      pincode: pincode !== undefined ? pincode.toString() : existingAddr.pincode,
      isDefault: isDefault !== undefined ? !!isDefault : existingAddr.isDefault,
      updatedAt: new Date().toISOString()
    };

    writeUsers(users);

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address: users[userIndex].addresses[addrIndex],
      addresses: users[userIndex].addresses
    });
  } catch (err) {
    console.error('PUT /user/addresses/:id error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/user/addresses/:id
 * Deletes address by id
 */
router.delete('/addresses/:id', (req, res) => {
  try {
    const { id } = req.params;

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const addresses = users[userIndex].addresses || [];
    const initialLength = addresses.length;
    users[userIndex].addresses = addresses.filter(a => a.id !== id);

    if (users[userIndex].addresses.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    writeUsers(users);

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: users[userIndex].addresses
    });
  } catch (err) {
    console.error('DELETE /user/addresses/:id error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
