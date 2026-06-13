const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const GROUPS_FILE = path.join(__dirname, '../data/groups.json');
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

// Helper: read groups
function readGroups() {
  try {
    return JSON.parse(fs.readFileSync(GROUPS_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

// Helper: write groups
function writeGroups(groups) {
  fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2), 'utf8');
}

// Helper: read products
function readProducts() {
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

/**
 * POST /api/groups/create
 * Creates a new group session
 * Returns: { success, groupId, group }
 */
router.post('/create', (req, res) => {
  try {
    const groups = readGroups();
    const products = readProducts();
    
    // Pick 2 random products for initial group cart
    const p1 = products[Math.floor(Math.random() * products.length)];
    const p2 = products[Math.floor(Math.random() * products.length)];
    
    const newGroup = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      items: [
        { id: p1.id, name: p1.name, price: p1.price, votes: { up: 0, down: 0 } },
        { id: p2.id, name: p2.name, price: p2.price, votes: { up: 0, down: 0 } }
      ]
    };

    groups.push(newGroup);
    writeGroups(groups);

    return res.status(201).json({ success: true, groupId: newGroup.id, group: newGroup });
  } catch (err) {
    console.error('Group create error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/groups/:id
 * Fetch group details
 */
router.get('/:id', (req, res) => {
  try {
    const groups = readGroups();
    const group = groups.find(g => g.id === req.params.id);
    
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    return res.status(200).json({ success: true, group });
  } catch (err) {
    console.error('Group fetch error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/groups/:id/vote
 * Body: { productId, type: 'up' | 'down' }
 */
router.post('/:id/vote', (req, res) => {
  try {
    const { productId, type } = req.body;
    if (type !== 'up' && type !== 'down') {
      return res.status(400).json({ success: false, error: 'Invalid vote type' });
    }

    const groups = readGroups();
    const groupIndex = groups.findIndex(g => g.id === req.params.id);
    
    if (groupIndex === -1) {
      return res.status(404).json({ success: false, error: 'Group not found' });
    }

    const itemIndex = groups[groupIndex].items.findIndex(i => i.id === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Product not found in group' });
    }

    // Process vote
    groups[groupIndex].items[itemIndex].votes[type] += 1;
    
    writeGroups(groups);

    return res.status(200).json({ success: true, group: groups[groupIndex] });
  } catch (err) {
    console.error('Group vote error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
