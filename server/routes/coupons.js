const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const COUPONS_FILE = path.join(__dirname, '../data/coupons.json');

// Helper: read coupons
function readCoupons() {
  try {
    const data = fs.readFileSync(COUPONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// All coupon routes require authentication
router.use(authenticate);

/**
 * GET /api/coupons
 * Returns list of all available coupons
 */
router.get('/', (req, res) => {
  try {
    const coupons = readCoupons();
    return res.status(200).json({ success: true, coupons });
  } catch (err) {
    console.error('GET /coupons error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/coupons/apply
 * Body: { code, subtotal }
 * Returns: { success, coupon, discountAmount, finalAmount }
 */
router.post('/apply', (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, error: 'Coupon code is required' });
    }

    if (subtotal === undefined || subtotal === null) {
      return res.status(400).json({ success: false, error: 'subtotal is required' });
    }

    const subtotalNum = parseFloat(subtotal);
    if (isNaN(subtotalNum) || subtotalNum < 0) {
      return res.status(400).json({ success: false, error: 'subtotal must be a valid positive number' });
    }

    const coupons = readCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid coupon code' });
    }

    // Check minimum order requirement
    if (subtotalNum < coupon.minOrder) {
      return res.status(400).json({
        success: false,
        error: `Minimum order amount of ₹${coupon.minOrder} required for this coupon`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.type === 'percent') {
      discountAmount = Math.floor((subtotalNum * coupon.value) / 100);
    } else if (coupon.type === 'flat') {
      discountAmount = coupon.value;
    }

    // Ensure discount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotalNum);

    const finalAmount = subtotalNum - discountAmount;

    return res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description
      },
      discountAmount,
      finalAmount,
      message: `Coupon applied! You save ₹${discountAmount}`
    });
  } catch (err) {
    console.error('POST /coupons/apply error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
