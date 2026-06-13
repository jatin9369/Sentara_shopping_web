"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const theme_1 = __importDefault(require("./routes/theme"));
const homepage_1 = __importDefault(require("./routes/homepage"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/theme', theme_1.default);
app.use('/api/homepage', homepage_1.default);
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 SENTARA Postgres API Server running on http://localhost:${PORT}`);
});
