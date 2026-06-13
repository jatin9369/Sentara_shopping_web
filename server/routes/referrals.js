const express = require('express');
const { authenticate } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper: read users
function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

// Helper: write users
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

/**
 * POST /api/referral/claim
 * Body: { referralCode }
 * Returns: { success, pointsAwarded, newBalance }
 */
router.post('/claim', authenticate, (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode || referralCode.trim().length < 4) {
      return res.status(400).json({ success: false, error: 'Please enter a valid referral code' });
    }

    const codeUpper = referralCode.trim().toUpperCase();
    
    // For demo, assume any code starting with "SENTARA" or "REFF" is valid
    const isValid = codeUpper.startsWith('SENTARA') || codeUpper.startsWith('REFF') || codeUpper.length > 5;
    
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid or expired referral code' });
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Allocate 100 points
    const pointsAwarded = 100;
    
    // In database users.json, initialize/update points
    if (users[userIndex].points === undefined) {
      users[userIndex].points = 0;
    }
    users[userIndex].points += pointsAwarded;
    
    writeUsers(users);

    return res.status(200).json({
      success: true,
      message: `🎉 Referral code applied successfully!`,
      pointsAwarded,
      newBalance: users[userIndex].points
    });
  } catch (err) {
    console.error('Referral claim error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
