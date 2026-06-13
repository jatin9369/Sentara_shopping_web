require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const userRoutes = require('./routes/user');
const couponsRoutes = require('./routes/coupons');
const paymentRoutes = require('./routes/payment');
const referralsRoutes = require('./routes/referrals');
const chatRoutes = require('./routes/chat');
const groupsRoutes = require('./routes/groups');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers with CSP configuration for font/image/payment content
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS restrictions
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy block: Origin not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/user', userRoutes);
app.use('/api/coupons', couponsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback: serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ SENTARA server running on http://localhost:${PORT}`);
  console.log(`📦 API available at http://localhost:${PORT}/api`);
});

// Handle unhandled exceptions & rejections gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
});

module.exports = app;
