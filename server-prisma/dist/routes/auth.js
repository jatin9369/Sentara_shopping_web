"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'sentara-enterprise-secret-key-100';
const otpStore = new Map();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ success: false, error: 'Unauthorized Access' });
    jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
        if (err)
            return res.status(403).json({ success: false, error: 'Forbidden' });
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// POST Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { mobile, name } = req.body;
        if (!mobile)
            return res.status(400).json({ success: false, error: 'Mobile number is required' });
        const otp = '123456';
        otpStore.set(mobile, otp);
        await prisma_1.prisma.user.upsert({
            where: { mobile },
            update: { name: name || undefined },
            create: { mobile, name: name || 'Shopper' }
        });
        console.log(`[OTP Engine] Sent OTP 123456 to ${mobile}`);
        return res.status(200).json({ success: true, message: 'OTP sent successfully' });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
// POST Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { mobile, otp } = req.body;
        if (!mobile || !otp)
            return res.status(400).json({ success: false, error: 'Mobile and OTP are required' });
        const savedOtp = otpStore.get(mobile);
        if (otp !== '123456' && savedOtp !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid verification OTP code' });
        }
        const user = await prisma_1.prisma.user.findUnique({ where: { mobile } });
        if (!user)
            return res.status(404).json({ success: false, error: 'User profile not found' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, mobile: user.mobile, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        otpStore.delete(mobile);
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                role: user.role,
                points: user.points
            }
        });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Failed to verify verification code' });
    }
});
// GET profile info
router.get('/me', exports.authenticateToken, async (req, res) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ success: false, error: 'Profile not found' });
        return res.status(200).json({ success: true, user });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});
exports.default = router;
