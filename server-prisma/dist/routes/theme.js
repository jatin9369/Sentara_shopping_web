"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
// GET active theme config
router.get('/', async (req, res) => {
    try {
        let theme = await prisma_1.prisma.themeConfig.findFirst({
            where: { isActive: true }
        });
        // Fallback default theme configuration if database is unseeded
        if (!theme) {
            theme = {
                id: 'default',
                name: 'Summer Default',
                primaryColor: '#2874f0',
                secondaryColor: '#2874f0',
                accentColor: '#ff9f00',
                backgroundColor: '#f1f3f6',
                surfaceColor: '#ffffff',
                borderColor: '#e0e0e0',
                textColor: '#212121',
                fontFamily: 'Inter',
                borderRadius: '8px',
                isActive: true
            };
        }
        return res.status(200).json({ success: true, theme });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to fetch theme configuration' });
    }
});
// PUT update or switch active theme
router.put('/', async (req, res) => {
    try {
        const { primaryColor, secondaryColor, accentColor, backgroundColor, surfaceColor, borderColor, textColor, fontFamily, borderRadius, name } = req.body;
        // Set all other themes to inactive
        await prisma_1.prisma.themeConfig.updateMany({
            data: { isActive: false }
        });
        const theme = await prisma_1.prisma.themeConfig.upsert({
            where: { name: name || 'Custom Theme' },
            update: {
                primaryColor,
                secondaryColor,
                accentColor,
                backgroundColor,
                surfaceColor,
                borderColor,
                textColor,
                fontFamily,
                borderRadius,
                isActive: true
            },
            create: {
                name: name || 'Custom Theme',
                primaryColor: primaryColor || '#2874f0',
                secondaryColor: secondaryColor || '#2874f0',
                accentColor: accentColor || '#ff9f00',
                backgroundColor: backgroundColor || '#f1f3f6',
                surfaceColor: surfaceColor || '#ffffff',
                borderColor: borderColor || '#e0e0e0',
                textColor: textColor || '#212121',
                fontFamily: fontFamily || 'Inter',
                borderRadius: borderRadius || '8px',
                isActive: true
            }
        });
        return res.status(200).json({ success: true, theme });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to update theme configuration' });
    }
});
exports.default = router;
