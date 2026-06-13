"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
// GET all homepage config (Layout Sections & Hero Banners)
router.get('/layout', async (req, res) => {
    try {
        // 1. Fetch homepage sections ordering
        let sections = await prisma_1.prisma.homepageLayout.findMany({
            orderBy: { order: 'asc' }
        });
        // Seed default sections if database is empty
        if (sections.length === 0) {
            const defaultSections = [
                { sectionId: 'hero', label: 'Hero Carousel', order: 1 },
                { sectionId: 'categories', label: 'Category Navigator', order: 2 },
                { sectionId: 'trending', label: 'Trending Products', order: 3 },
                { sectionId: 'recommendations', label: 'AI Personal Recommendations', order: 4 },
                { sectionId: 'flash-sale', label: 'Flash Sale Deals', order: 5 },
                { sectionId: 'testimonials', label: 'Customer Reviews', order: 6 },
                { sectionId: 'recently-viewed', label: 'Recently Viewed', order: 7 }
            ];
            await prisma_1.prisma.homepageLayout.createMany({ data: defaultSections });
            sections = await prisma_1.prisma.homepageLayout.findMany({ orderBy: { order: 'asc' } });
        }
        // 2. Fetch Banners
        let banners = await prisma_1.prisma.banner.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        if (banners.length === 0) {
            const defaultBanners = [
                { title: 'Grand Electronics Sale', subtitle: 'Laptops, SmartTVs & Audio Devices', cta: 'Shop Electronics', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80', background: 'from-blue-600 to-indigo-800', order: 1 },
                { title: 'Premium Fashion Fest', subtitle: 'Levi\'s, Nike & Luxury Brands', cta: 'Grab Fashion Deals', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80', background: 'from-pink-600 to-rose-800', order: 2 }
            ];
            await prisma_1.prisma.banner.createMany({ data: defaultBanners });
            banners = await prisma_1.prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
        }
        // 3. Fetch Category Items
        let categories = await prisma_1.prisma.category.findMany();
        if (categories.length === 0) {
            const defaultCategories = [
                { name: 'Mobiles', label: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop&q=60' },
                { name: 'Electronics', label: 'Electronics', image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=80&auto=format&fit=crop&q=60' },
                { name: 'Clothing', label: 'Fashion Wear', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&auto=format&fit=crop&q=60' },
                { name: 'Books', label: 'Literature', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&auto=format&fit=crop&q=60' }
            ];
            await prisma_1.prisma.category.createMany({ data: defaultCategories });
            categories = await prisma_1.prisma.category.findMany();
        }
        return res.status(200).json({
            success: true,
            layout: {
                sections: sections.filter(s => s.isActive),
                banners,
                categories
            }
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to fetch layout configuration' });
    }
});
// POST save homepage order (Admin panel drag-and-drop config)
router.post('/layout/reorder', async (req, res) => {
    try {
        const { sectionOrders } = req.body; // Array of { sectionId, order, isActive }
        if (!Array.isArray(sectionOrders)) {
            return res.status(400).json({ success: false, error: 'Invalid sectionOrders array' });
        }
        for (const item of sectionOrders) {
            await prisma_1.prisma.homepageLayout.update({
                where: { sectionId: item.sectionId },
                data: {
                    order: item.order,
                    isActive: item.isActive !== undefined ? item.isActive : true
                }
            });
        }
        const updated = await prisma_1.prisma.homepageLayout.findMany({ orderBy: { order: 'asc' } });
        return res.status(200).json({ success: true, sections: updated });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to reorder layout' });
    }
});
exports.default = router;
