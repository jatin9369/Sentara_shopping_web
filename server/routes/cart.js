const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const USERS_FILE = path.join(__dirname, '../data/users.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

// Helper: read JSON file
function readFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper: write users file
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Helper: find user index by id
function findUserIndex(users, userId) {
  return users.findIndex(u => u.id === userId);
}

// All cart routes require authentication
router.use(authenticate);

/**
 * GET /api/cart
 * Returns user's cart with merged product details
 */
router.get('/', (req, res) => {
  try {
    const users = readFile(USERS_FILE);
    const products = readFile(PRODUCTS_FILE);

    const userIndex = findUserIndex(users, req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[userIndex];
    const cart = user.cart || [];

    // Merge cart items with product details
    const cartWithDetails = cart.map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      if (!product) return null;
      return {
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        color: cartItem.color || null,
        size: cartItem.size || null,
        product: {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating,
          image: product.image,
          inStock: product.inStock,
          badge: product.badge
        }
      };
    }).filter(item => item !== null);

    // Calculate totals
    const subtotal = cartWithDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = cartWithDetails.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      success: true,
      cart: cartWithDetails,
      subtotal,
      itemCount
    });
  } catch (err) {
    console.error('GET /cart error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/cart/add
 * Body: { productId, quantity }
 * Adds or increments item in cart
 */
router.post('/add', (req, res) => {
  try {
    const { productId, quantity = 1, color, size } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ success: false, error: 'quantity must be a positive integer' });
    }

    // Verify product exists
    const products = readFile(PRODUCTS_FILE);
    const product = products.find(p => p.id === productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    if (!product.inStock) {
      return res.status(400).json({ success: false, error: 'Product is out of stock' });
    }

    const users = readFile(USERS_FILE);
    const userIndex = findUserIndex(users, req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[userIndex];
    if (!user.cart) user.cart = [];

    const existingItemIndex = user.cart.findIndex(item => 
      item.productId === productId && 
      item.color === color && 
      item.size === size
    );

    if (existingItemIndex > -1) {
      // Increment quantity
      user.cart[existingItemIndex].quantity += qty;
    } else {
      // Add new item
      user.cart.push({ productId, quantity: qty, color, size });
    }

    users[userIndex] = user;
    writeUsers(users);

    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: user.cart
    });
  } catch (err) {
    console.error('POST /cart/add error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PUT /api/cart/update
 * Body: { productId, quantity }
 * Updates quantity; removes if quantity === 0
 */
router.put('/update', (req, res) => {
  try {
    const { productId, quantity, color, size } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, error: 'quantity must be a non-negative integer' });
    }

    const users = readFile(USERS_FILE);
    const userIndex = findUserIndex(users, req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[userIndex];
    if (!user.cart) user.cart = [];

    if (qty === 0) {
      // Remove item
      user.cart = user.cart.filter(item => 
        !(item.productId === productId && item.color === color && item.size === size)
      );
    } else {
      const existingIndex = user.cart.findIndex(item => 
        item.productId === productId && 
        item.color === color && 
        item.size === size
      );
      if (existingIndex === -1) {
        return res.status(404).json({ success: false, error: 'Item not found in cart' });
      }
      user.cart[existingIndex].quantity = qty;
    }

    users[userIndex] = user;
    writeUsers(users);

    return res.status(200).json({
      success: true,
      message: qty === 0 ? 'Item removed from cart' : 'Cart updated',
      cart: user.cart
    });
  } catch (err) {
    console.error('PUT /cart/update error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/cart/remove/:productId
 * Removes specific item from cart
 */
router.delete('/remove/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const { color, size } = req.query;

    const users = readFile(USERS_FILE);
    const userIndex = findUserIndex(users, req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = users[userIndex];
    if (!user.cart) user.cart = [];

    const initialLength = user.cart.length;
    user.cart = user.cart.filter(item => 
      !(item.productId === productId && item.color === color && item.size === size)
    );

    if (user.cart.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Item not found in cart' });
    }

    users[userIndex] = user;
    writeUsers(users);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: user.cart
    });
  } catch (err) {
    console.error('DELETE /cart/remove error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/cart/clear
 * Clears entire cart for the user
 */
router.delete('/clear', (req, res) => {
  try {
    const users = readFile(USERS_FILE);
    const userIndex = findUserIndex(users, req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    users[userIndex].cart = [];
    writeUsers(users);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: []
    });
  } catch (err) {
    console.error('DELETE /cart/clear error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
