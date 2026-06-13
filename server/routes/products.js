const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

// Helper: read products
function readProducts() {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

/**
 * GET /api/products
 * Query params: search, category, minPrice, maxPrice, sort, page, limit
 * Returns: { products, total, page, totalPages, categories }
 */
router.get('/', (req, res) => {
  try {
    let products = readProducts();

    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      rating,
      inStock,
      brand,
      discount,
      mode,
      mood,
      discoveryTag
    } = req.query;

    // Extract all unique categories before filtering
    const allCategories = [...new Set(products.map(p => p.category))].sort();

    // Filter by search
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (category && category.trim()) {
      products = products.filter(p =>
        p.category.toLowerCase() === category.trim().toLowerCase()
      );
    }

    // Filter by price range
    if (minPrice !== undefined && minPrice !== '') {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        products = products.filter(p => p.price >= min);
      }
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        products = products.filter(p => p.price <= max);
      }
    }

    // Filter by rating (minimum rating)
    if (rating !== undefined && rating !== '') {
      const minRating = parseFloat(rating);
      if (!isNaN(minRating)) {
        products = products.filter(p => p.rating >= minRating);
      }
    }

    // Filter by stock status
    if (inStock === 'true') {
      products = products.filter(p => p.inStock);
    }

    // Filter by brand
    if (brand && brand.trim()) {
      const brandLower = brand.trim().toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(brandLower));
    }

    // Filter by discount (minimum discount)
    if (discount !== undefined && discount !== '') {
      const minDiscount = parseFloat(discount);
      if (!isNaN(minDiscount)) {
        products = products.filter(p => p.discount >= minDiscount);
      }
    }

    // Student Mode
    if (mode === 'student') {
      products = products.filter(p => p.category === 'Electronics' || p.category === 'Books');
      // Apply a dynamic 10% student discount to all prices on the fly
      products = products.map(p => ({
        ...p,
        originalPrice: p.price,
        price: Math.floor(p.price * 0.9),
        studentDiscount: true
      }));
    }

    // Filter by mood
    if (mood && mood.trim()) {
      const moodLower = mood.trim().toLowerCase();
      if (moodLower === 'gaming') {
        products = products.filter(p =>
          p.category === 'Electronics' ||
          p.category === 'Toys' ||
          p.name.toLowerCase().includes('game') ||
          p.name.toLowerCase().includes('headphone') ||
          p.name.toLowerCase().includes('earbud')
        );
      } else if (moodLower === 'fitness') {
        products = products.filter(p =>
          p.category === 'Sports' ||
          p.category === 'Food & Health' ||
          p.name.toLowerCase().includes('shoe') ||
          p.name.toLowerCase().includes('protein') ||
          p.name.toLowerCase().includes('yoga') ||
          p.name.toLowerCase().includes('dumbbell')
        );
      } else if (moodLower === 'travel') {
        products = products.filter(p =>
          p.category === 'Clothing' ||
          p.category === 'Auto' ||
          p.category === '2 Wheeler' ||
          p.name.toLowerCase().includes('glove') ||
          p.name.toLowerCase().includes('holder') ||
          p.name.toLowerCase().includes('helmet') ||
          p.name.toLowerCase().includes('bag')
        );
      } else if (moodLower === 'study') {
        products = products.filter(p =>
          p.category === 'Books' ||
          p.name.toLowerCase().includes('table') ||
          p.name.toLowerCase().includes('book')
        );
      } else if (moodLower === 'productivity') {
        products = products.filter(p =>
          p.category === 'Electronics' ||
          p.category === 'Furniture' ||
          p.name.toLowerCase().includes('macbook') ||
          p.name.toLowerCase().includes('chair') ||
          p.name.toLowerCase().includes('table')
        );
      }
    }

    // Filter by discoveryTag
    if (discoveryTag && discoveryTag.trim()) {
      const tag = discoveryTag.trim().toLowerCase();
      if (tag === 'under_500') {
        products = products.filter(p => p.price <= 500);
      } else if (tag === 'gaming_setup') {
        products = products.filter(p =>
          p.category.toLowerCase() === 'electronics' ||
          p.name.toLowerCase().includes('game') ||
          p.name.toLowerCase().includes('headphone') ||
          p.name.toLowerCase().includes('earbud') ||
          p.name.toLowerCase().includes('monitor')
        );
      } else if (tag === 'hostel_essentials') {
        products = products.filter(p =>
          p.category.toLowerCase() === 'home & kitchen' ||
          p.category.toLowerCase() === 'clothing' ||
          p.name.toLowerCase().includes('kettle') ||
          p.name.toLowerCase().includes('bag') ||
          p.name.toLowerCase().includes('bottle')
        );
      } else if (tag === 'exam_prep') {
        products = products.filter(p =>
          p.category.toLowerCase() === 'books' ||
          p.name.toLowerCase().includes('book') ||
          p.name.toLowerCase().includes('pen')
        );
      } else if (tag === 'home_office') {
        products = products.filter(p =>
          p.category.toLowerCase() === 'furniture' ||
          p.category.toLowerCase() === 'electronics' ||
          p.name.toLowerCase().includes('chair') ||
          p.name.toLowerCase().includes('table') ||
          p.name.toLowerCase().includes('lamp')
        );
      } else if (tag === 'travel_kit') {
        products = products.filter(p =>
          p.category.toLowerCase() === 'clothing' ||
          p.name.toLowerCase().includes('bag') ||
          p.name.toLowerCase().includes('bottle') ||
          p.name.toLowerCase().includes('holder')
        );
      }
    }

    // Sort
    if (sort) {
      switch (sort) {
        case 'price_asc':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
        case 'featured':
          products.sort((a, b) => b.rating - a.rating);
          break;
        case 'trending':
          products.sort((a, b) => (b.rating * (b.discount || 1)) - (a.rating * (a.discount || 1)));
          break;
        case 'bestseller':
          products.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
          break;
        case 'newest':
          products.reverse();
          break;
        default:
          break;
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));
    const total = products.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = products.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      products: paginated,
      total,
      page: pageNum,
      totalPages,
      categories: allCategories
    });
  } catch (err) {
    console.error('GET /products error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/products/copilot
 * Query: query
 */
router.get('/copilot', (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json({ success: true, products: [] });
    
    const products = readProducts();
    const q = query.toLowerCase();
    
    // Extract budget constraints
    const budgetMatch = q.match(/under\s+(\d+)/) || q.match(/budget\s+(\d+)/) || q.match(/less than\s+(\d+)/) || q.match(/<(\d+)/);
    let maxPrice = null;
    if (budgetMatch) {
       maxPrice = parseInt(budgetMatch[1], 10);
    }

    // Clean query of filler words to find keywords
    const cleanQ = q.replace(/under\s+\d+|budget\s+\d+|less than\s+\d+|<(\d+)|i need|show me|want|looking for|a|an|the|for|any/gi, ' ').trim();
    const keywords = cleanQ.split(/\s+/).filter(w => w.length > 2);

    let matched = products;

    // Filter by keywords FIRST
    if (keywords.length > 0) {
      matched = matched.filter(p => {
         const text = `${p.name} ${p.category} ${p.description} ${p.brand || ''}`.toLowerCase();
         // Require at least one keyword to match
         return keywords.some(k => text.includes(k));
      });
    }

    // Now try to apply price filter
    if (maxPrice) {
       const withinBudget = matched.filter(p => p.price <= maxPrice);
       if (withinBudget.length > 0) {
           matched = withinBudget;
       } else if (keywords.length > 0) {
           // No items match BOTH keyword and budget (e.g. no laptops under 300)
           // Fallback: return the cheapest items matching the keyword, ignoring budget constraint
           matched = matched.sort((a, b) => a.price - b.price);
       } else {
           // No keywords, just "under 300"
           matched = products.filter(p => p.price <= maxPrice);
       }
    } else if (keywords.length === 0 && maxPrice) {
       matched = products.filter(p => p.price <= maxPrice);
    }

    // Limit to top 4 results
    matched = matched.slice(0, 4);
    
    return res.status(200).json({ success: true, products: matched });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/products/mood
 * Query: type
 */
router.get('/mood', (req, res) => {
  try {
    const { type } = req.query;
    const products = readProducts();
    let matched = [];
    const t = type ? type.toLowerCase() : '';
    
    if (t === 'gaming') {
      matched = products.filter(p => p.category === 'Electronics' || p.category === 'Toys' || p.name.toLowerCase().includes('game') || p.name.toLowerCase().includes('headphone') || p.name.toLowerCase().includes('earbud')).slice(0, 4);
    } else if (t === 'fitness') {
      matched = products.filter(p => p.category === 'Sports' || p.category === 'Food & Health' || p.name.toLowerCase().includes('shoe') || p.name.toLowerCase().includes('protein') || p.name.toLowerCase().includes('yoga') || p.name.toLowerCase().includes('dumbbell')).slice(0, 4);
    } else if (t === 'travel') {
      matched = products.filter(p => p.category === 'Clothing' || p.category === 'Auto' || p.category === '2 Wheeler' || p.name.toLowerCase().includes('glove') || p.name.toLowerCase().includes('holder') || p.name.toLowerCase().includes('helmet') || p.name.toLowerCase().includes('bag')).slice(0, 4);
    } else if (t === 'study' || t === 'focus') {
      matched = products.filter(p => p.category === 'Books' || p.name.toLowerCase().includes('table') || p.name.toLowerCase().includes('book')).slice(0, 4);
    } else if (t === 'productivity') {
      matched = products.filter(p => p.category === 'Electronics' || p.category === 'Furniture' || p.name.toLowerCase().includes('macbook') || p.name.toLowerCase().includes('chair') || p.name.toLowerCase().includes('table')).slice(0, 4);
    } else if (t === 'chill') {
      matched = products.filter(p => p.name.toLowerCase().includes('tv') || p.name.toLowerCase().includes('headphone') || p.name.toLowerCase().includes('book')).slice(0, 4);
    } else if (t === 'happy') {
      matched = products.filter(p => p.category === 'Fashion' || p.category === 'Beauty' || p.category === 'Clothing').slice(0, 4);
    } else {
      matched = products.slice(0, 4);
    }
    return res.status(200).json({ success: true, products: matched });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/products/bundle
 * Query: budget
 */
router.get('/bundle', (req, res) => {
  try {
    const { budget } = req.query;
    const limit = parseFloat(budget);
    if (isNaN(limit) || limit <= 0) return res.status(200).json({ success: true, bundle: [], total: 0 });
    
    const products = readProducts().sort((a, b) => a.price - b.price);
    const bundle = [];
    let currentSum = 0;
    
    for (const p of products) {
      if (currentSum + p.price <= limit && p.inStock) {
        bundle.push(p);
        currentSum += p.price;
      }
    }
    return res.status(200).json({ success: true, bundle, total: currentSum });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/products/goal
 * Query: type
 */
router.get('/goal', (req, res) => {
  try {
    const { type } = req.query;
    const products = readProducts();
    let matched = [];
    if (type === 'college') {
      matched = products.filter(p => ['p003', 'p012', 'p002'].includes(p.id));
    } else if (type === 'gym') {
      matched = products.filter(p => ['p010', 'p028', 'p029'].includes(p.id));
    } else if (type === 'office') {
      matched = products.filter(p => ['p006', 'p024', 'p023'].includes(p.id));
    } else {
      matched = products.slice(0, 3);
    }
    return res.status(200).json({ success: true, products: matched });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/products/:id/price-history
 */
router.get('/:id/price-history', (req, res) => {
  try {
    // Generate simulated 30-day price history
    const products = readProducts();
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    
    const history = [];
    let currentPrice = product.price * 1.2; // Start 20% higher 30 days ago
    
    for (let i = 30; i >= 0; i--) {
      history.push({
        day: 30 - i,
        price: Math.floor(currentPrice)
      });
      // Random walk down to current price
      currentPrice = currentPrice - (currentPrice - product.price) * Math.random();
    }
    // ensure last is exactly current price
    history[history.length - 1].price = product.price;

    return res.status(200).json({ success: true, history });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/products/:id
 * Returns: single product object
 */
router.get('/:id', (req, res) => {
  try {
    const products = readProducts();
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (err) {
    console.error('GET /products/:id error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
