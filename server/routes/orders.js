const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const ORDERS_FILE = path.join(__dirname, '../data/orders.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper: read JSON file
function readFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: write JSON file
function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// All orders routes require authentication
router.use(authenticate);

/**
 * POST /api/orders
 * Body: { items, address, paymentMethod, couponCode, subtotal, discount, deliveryFee, total }
 * Creates new order, clears cart, returns order
 */
router.post('/', (req, res) => {
  try {
    const {
      items,
      address,
      paymentMethod,
      couponCode,
      subtotal,
      discount,
      deliveryFee,
      total,
      pointsRedeemed
    } = req.body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Order must contain at least one item' });
    }
    if (!address) {
      return res.status(400).json({ success: false, error: 'Delivery address is required' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ success: false, error: 'Payment method is required' });
    }

    const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');
    const products = readFile(PRODUCTS_FILE);

    // Recalculate totals dynamically from server database
    let computedSubtotal = 0;
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product with ID ${item.productId} not found` });
      }
      if (!product.inStock) {
        return res.status(400).json({ success: false, error: `Product "${product.name}" is currently out of stock` });
      }
      
      // Enforce server values to prevent tamper overrides
      item.price = product.price;
      item.name = product.name;
      computedSubtotal += product.price * item.quantity;
    }

    const computedDeliveryFee = computedSubtotal >= 499 ? 0 : 40; // matches client threshold
    let computedDiscount = 0;

    if (couponCode) {
      const COUPONS_FILE = path.join(__dirname, '../data/coupons.json');
      const coupons = readFile(COUPONS_FILE);
      const coupon = coupons.find(c => c.code === couponCode.trim().toUpperCase());
      if (coupon && computedSubtotal >= (coupon.minOrder || coupon.minSubtotal || 0)) {
        if (coupon.type === 'percent' || coupon.type === 'percentage') {
          computedDiscount = Math.round((computedSubtotal * coupon.value) / 100);
        } else if (coupon.type === 'flat') {
          computedDiscount = coupon.value;
        }
      }
    }

    let pointsDiscount = 0;
    if (pointsRedeemed) {
      const users = readFile(USERS_FILE);
      const user = users.find(u => u.id === req.user.id);
      const availablePoints = user ? (user.points || 0) : 0;
      const pointsToRedeem = Math.min(Number(pointsRedeemed), availablePoints);
      pointsDiscount = pointsToRedeem * 0.1; // 50 points = 5 Rupees, 10 points = 1 Rupee
    }

    const computedTotal = computedSubtotal - computedDiscount - pointsDiscount + computedDeliveryFee;

    // Prevent client price tampering
    if (Math.abs(computedTotal - total) > 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'Security alert: Order total calculation mismatch. Please refresh your cart.' 
      });
    }

    // Calculate estimated delivery (5 business days)
    const orderedAt = new Date();
    const estimatedDelivery = new Date(orderedAt);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    // Create order object
    const order = {
      id: uuidv4(),
      userId: req.user.id,
      items,
      address,
      paymentMethod,
      couponCode: couponCode || null,
      subtotal: subtotal || 0,
      discount: discount || 0,
      deliveryFee: deliveryFee || 0,
      total: total || 0,
      status: 'confirmed',
      orderedAt: orderedAt.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      statusHistory: [
        {
          status: 'confirmed',
          timestamp: orderedAt.toISOString(),
          message: 'Order confirmed successfully'
        }
      ]
    };

    // Save order to orders.json
    const orders = readFile(ORDERS_FILE);
    orders.push(order);
    writeFile(ORDERS_FILE, orders);

    // Clear user's cart and award 50 SENTARA points (deducting redeemed points)
    const users = readFile(USERS_FILE);
    const userIndex = users.findIndex(u => u.id === req.user.id);
    let newPoints = 0;
    if (userIndex !== -1) {
      users[userIndex].cart = [];
      const currentPoints = users[userIndex].points || 0;
      const pointsToDeduct = pointsRedeemed ? Math.min(Number(pointsRedeemed), currentPoints) : 0;
      users[userIndex].points = currentPoints - pointsToDeduct + 50;
      newPoints = users[userIndex].points;
      writeFile(USERS_FILE, users);
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
      newPoints
    });
  } catch (err) {
    console.error('POST /orders error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/orders
 * Returns all orders for current user (newest first)
 */
router.get('/', (req, res) => {
  try {
    const orders = readFile(ORDERS_FILE);

    // Filter orders by current user and sort newest first
    const userOrders = orders
      .filter(o => o.userId === req.user.id)
      .sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

    return res.status(200).json({
      success: true,
      orders: userOrders,
      total: userOrders.length
    });
  } catch (err) {
    console.error('GET /orders error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/orders/:id
 * Returns single order by id (must belong to current user)
 */
router.get('/:id', (req, res) => {
  try {
    const orders = readFile(ORDERS_FILE);
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Security: ensure order belongs to requesting user
    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('GET /orders/:id error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
