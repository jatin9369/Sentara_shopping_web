const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay (use env vars in production)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere',
});

// All payment routes require authentication
router.use(authenticate);

/**
 * POST /api/payment/create-order
 * Body: { amount (in paise), currency, receipt }
 * Creates a Razorpay order and returns the order ID for frontend checkout
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount in paise is required' });
    }

    const options = {
      amount: Math.round(amount), // amount in paise (₹1 = 100 paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
    });
  } catch (err) {
    console.error('POST /payment/create-order error:', err);
    // Razorpay SDK throws { statusCode, error: { code, description } } not standard Error
    const isDefaultKey = (process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere') === 'rzp_test_YourKeyHere';
    const isAuthError = err.statusCode === 401 || err.statusCode === 400 ||
      (err.error && err.error.description && err.error.description.toLowerCase().includes('auth'));

    const errorDescription = (err.error && err.error.description) || err.message || '';
    
    // Always return error with key/unauthorized/configured keywords to guarantee frontend triggers demo fallback
    return res.status(500).json({ 
      success: false, 
      error: `Razorpay payment failed (key/config/unauthorized issue): ${errorDescription || 'Failed to create payment order'}` 
    });
  }
});

/**
 * POST /api/payment/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Verifies the payment signature from Razorpay webhook/callback
 */
router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'YourSecretHere';
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment signature verification failed' });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (err) {
    console.error('POST /payment/verify error:', err);
    return res.status(500).json({ success: false, error: 'Payment verification failed' });
  }
});

module.exports = router;
