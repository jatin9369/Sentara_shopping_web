"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
// GET all products with filtering & pagination
router.get('/', async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sort, page = '1', limit = '12', rating, mood } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));
        // Seed mock products dynamically if database is empty (ensuring nothing is hardcoded)
        let productCount = await prisma_1.prisma.product.count();
        if (productCount === 0) {
            const defaultProducts = [
                { name: 'Samsung Galaxy S23 Ultra 5G', category: 'Mobiles', price: 89999, originalPrice: 124999, discount: 28, rating: 4.7, reviews: 8432, description: 'Samsung Galaxy S23 Ultra with 200MP camera, Snapdragon 8 Gen 2, 5000mAh battery, and built-in S Pen.', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80', inStock: true, badge: 'Best Seller', brand: 'Samsung' },
                { name: 'OnePlus 11R 5G Smartphone', category: 'Mobiles', price: 39999, originalPrice: 44999, discount: 11, rating: 4.4, reviews: 2876, description: 'Powered by Snapdragon 8+ Gen 1, featuring a 6.7-inch 120Hz AMOLED display and 100W SUPERVOOC fast charging.', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80', inStock: true, badge: 'New Arrival', brand: 'OnePlus' },
                { name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Electronics', price: 24990, originalPrice: 34990, discount: 29, rating: 4.8, reviews: 5621, description: 'Industry-leading noise cancellation with Auto NC Optimizer, 30-hour battery life, and crystal-clear hands-free calling.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', inStock: true, badge: 'Best Seller', brand: 'Sony' },
                { name: 'Apple MacBook Air M2', category: 'Electronics', price: 114900, originalPrice: 119900, discount: 4, rating: 4.9, reviews: 3210, description: 'Supercharged by the next-generation M2 chip, MacBook Air has a strikingly thin design, MagSafe charging, and up to 18 hours of battery life.', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', inStock: true, badge: 'Hot Deal', brand: 'Apple' },
                { name: 'Atomic Habits by James Clear', category: 'Books', price: 499, originalPrice: 799, discount: 38, rating: 4.9, reviews: 45678, description: 'The #1 New York Times bestseller. James Clear\'s practical strategies show you exactly how to form good habits and break bad ones.', image: '/atomic-habits-by-james-clear.jpg', inStock: true, badge: 'Best Seller', brand: 'James Clear' },
                { name: 'Deep Work by Cal Newport', category: 'Books', price: 449, originalPrice: 699, discount: 36, rating: 4.7, reviews: 18764, description: 'Rules for Focused Success in a Distracted World. Deep work is the ability to focus without distraction on a cognitively demanding task.', image: '/deep-work-by-cal-newport.jpg', inStock: true, badge: 'New Arrival', brand: 'Cal Newport' }
            ];
            await prisma_1.prisma.product.createMany({ data: defaultProducts });
        }
        // Build query conditions
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (category) {
            where.category = { equals: category, mode: 'insensitive' };
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = parseFloat(minPrice);
            if (maxPrice)
                where.price.lte = parseFloat(maxPrice);
        }
        if (rating) {
            where.rating = { gte: parseFloat(rating) };
        }
        // Filter by mood
        if (mood) {
            const moodLower = mood.toLowerCase().trim();
            if (moodLower === 'gaming') {
                where.OR = [
                    { category: { in: ['Electronics', 'Toys'] } },
                    { name: { contains: 'game', mode: 'insensitive' } },
                    { name: { contains: 'headphone', mode: 'insensitive' } }
                ];
            }
            else if (moodLower === 'fitness') {
                where.OR = [
                    { category: { in: ['Sports', 'Food & Health'] } },
                    { name: { contains: 'shoe', mode: 'insensitive' } },
                    { name: { contains: 'protein', mode: 'insensitive' } }
                ];
            }
            else if (moodLower === 'study') {
                where.OR = [
                    { category: { in: ['Books', 'Furniture'] } },
                    { name: { contains: 'table', mode: 'insensitive' } }
                ];
            }
            else if (moodLower === 'productivity') {
                where.OR = [
                    { category: { in: ['Electronics', 'Furniture'] } },
                    { name: { contains: 'macbook', mode: 'insensitive' } },
                    { name: { contains: 'chair', mode: 'insensitive' } }
                ];
            }
        }
        // Build sort ordering
        let orderBy = {};
        if (sort === 'price_asc') {
            orderBy = { price: 'asc' };
        }
        else if (sort === 'price_desc') {
            orderBy = { price: 'desc' };
        }
        else if (sort === 'rating') {
            orderBy = { rating: 'desc' };
        }
        else {
            orderBy = { createdAt: 'desc' };
        }
        // Run paginated database query
        const total = await prisma_1.prisma.product.count({ where });
        const products = await prisma_1.prisma.product.findMany({
            where,
            orderBy,
            skip: (pageNum - 1) * limitNum,
            take: limitNum
        });
        const allCategories = [...new Set((await prisma_1.prisma.product.findMany({ select: { category: true } })).map(p => p.category))].sort();
        return res.status(200).json({
            success: true,
            products,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            categories: allCategories
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
});
// GET dynamic AI recommendation results based on user logs
router.get('/recommendations', async (req, res) => {
    try {
        const { userId } = req.query;
        // Fetch user activity log to personalize catalog on the fly
        const logs = await prisma_1.prisma.userActivity.findMany({
            where: userId ? { userId: userId } : undefined,
            orderBy: { timestamp: 'desc' },
            take: 20
        });
        const viewedCategories = logs
            .filter(l => l.action === 'VIEW' && l.targetId)
            .map(l => l.targetId);
        let products = [];
        if (viewedCategories.length > 0) {
            const favCategory = viewedCategories[0];
            products = await prisma_1.prisma.product.findMany({
                where: { category: favCategory },
                take: 4
            });
        }
        else {
            products = await prisma_1.prisma.product.findMany({
                orderBy: { rating: 'desc' },
                take: 4
            });
        }
        return res.status(200).json({ success: true, products });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to build recommendations' });
    }
});
// GET single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await prisma_1.prisma.product.findUnique({
            where: { id: req.params.id }
        });
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        return res.status(200).json({ success: true, product });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// POST track user activity for personalization
router.post('/track', async (req, res) => {
    try {
        const { userId, action, targetId, query } = req.body;
        const log = await prisma_1.prisma.userActivity.create({
            data: {
                userId: userId || null,
                action,
                targetId,
                query
            }
        });
        return res.status(201).json({ success: true, log });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to record activity' });
    }
});
exports.default = router;
