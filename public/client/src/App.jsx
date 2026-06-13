import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import FloatingAssistant from './components/FloatingAssistant';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';

function AppContent({ darkMode, setDarkMode, searchKeyword, setSearchKeyword }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-800 dark:text-text-dark transition-colors duration-300">
      {/* Slim Space-Saving Coupon Announcement Bar */}
      <div className="bg-[#1d1d1f] dark:bg-slate-950 text-white py-2 px-4 text-center select-none text-[10px] sm:text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border-b border-white/5 uppercase tracking-wider">
        <span>🎉 Coupon code <strong className="text-yellow-450 font-black text-amber-400">SAVE10</strong> automatically applied!</span>
        <span className="h-1 w-1 rounded-full bg-white/40"></span>
        <span className="text-emerald-400 font-bold">You save up to ₹100 on checkout ✓</span>
      </div>

      {/* Header / Nav */}
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        onSearch={setSearchKeyword} 
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home searchKeyword={searchKeyword} />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login" state={{ from: location }} replace />} />
          <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/login" state={{ from: location }} replace />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" state={{ from: location }} replace />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" state={{ from: location }} replace />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Flipkart-style rich footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 py-10 mt-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top footer grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-white font-extrabold text-lg tracking-tight">SENTARA</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                India's trusted e-commerce platform for premium electronics, fashion, books & more.
              </p>
              <div className="flex gap-3 pt-1">
                {['FB', 'TW', 'IG', 'YT'].map(s => (
                  <button key={s} className="h-7 w-7 rounded-full bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white text-[9px] font-bold flex items-center justify-center transition-all duration-200">{s}</button>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div className="space-y-3">
              <h6 className="text-white font-extrabold text-xs uppercase tracking-wider">Shop</h6>
              <ul className="space-y-2">
                {['Electronics', 'Fashion', 'Books', 'Home & Kitchen', 'Sports', 'Beauty'].map(c => (
                  <li key={c}><a href="#" className="text-slate-400 hover:text-white text-xs font-medium transition-colors">{c}</a></li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div className="space-y-3">
              <h6 className="text-white font-extrabold text-xs uppercase tracking-wider">Help</h6>
              <ul className="space-y-2">
                {['My Orders', 'Returns & Refunds', 'Track Package', 'FAQs', 'Support Chat', 'Report Issue'].map(l => (
                  <li key={l}><a href="#" className="text-slate-400 hover:text-white text-xs font-medium transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div className="space-y-3">
              <h6 className="text-white font-extrabold text-xs uppercase tracking-wider">Policies</h6>
              <ul className="space-y-2">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Seller Policy', 'Sitemap'].map(p => (
                  <li key={p}><a href="#" className="text-slate-400 hover:text-white text-xs font-medium transition-colors">{p}</a></li>
                ))}
              </ul>
              <div className="pt-2 space-y-1.5">
                <div className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">We Accept</div>
                <div className="flex gap-1.5 flex-wrap">
                  {['VISA', 'MC', 'UPI', 'EMI', 'COD'].map(m => (
                    <span key={m} className="text-[8px] font-black text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-6 text-[10px] font-semibold text-slate-500">
            <span>© {new Date().getFullYear()} SENTARA E-Commerce Pvt. Ltd. All rights reserved.</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600">🔒 100% Secure Payments</span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-600">✅ Original Products</span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-600">🚚 Fast Delivery</span>
            </div>
          </div>
        </div>
      </footer>
      <FloatingAssistant />
    </div>
  );
}

function App() {
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Dark mode toggle state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('sentara_dark') === 'true';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('sentara_dark', 'true');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('sentara_dark', 'false');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <AppContent 
              darkMode={darkMode} 
              setDarkMode={setDarkMode} 
              searchKeyword={searchKeyword} 
              setSearchKeyword={setSearchKeyword} 
            />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default App;
