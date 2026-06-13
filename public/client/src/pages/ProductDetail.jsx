import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { DetailSkeleton } from '../components/SkeletonLoader';
import { getProductImage, getColorVariantImages } from '../utils/imageMapper';
import { 
  Star, 
  ShoppingCart, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Check, 
  Truck, 
  ShieldCheck, 
  RefreshCcw, 
  Heart,
  MessageSquare,
  FileText,
  Info,
  TrendingDown,
  Bell
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Tab control state
  const [activeTab, setActiveTab] = useState('description'); // description, specs, reviews
  const [selectedColor, setSelectedColor] = useState('Teal');
  const [selectedSize, setSelectedSize] = useState('55 cm (Small)');
  const [selectedPack, setSelectedPack] = useState('1');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [priceAlertSet, setPriceAlertSet] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);

  // Get color-specific images
  const colorImages = product && product.image
    ? [product.image, ...getColorVariantImages(selectedColor, product.name).slice(1)]
    : getColorVariantImages(selectedColor, product ? product.name : '');

  // Reset image index when color changes
  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedImageIndex(0);
  };

  const getHexColor = (color) => {
    switch(color) {
      case 'Teal': return '#00a896';
      case 'Pink': return '#ff85a2';
      case 'Grey': return '#8d99ae';
      case 'Yellow': return '#ffd166';
      case 'Rose': return '#e56b6f';
      default: return '#00a896';
    }
  };

  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeData, setPincodeData] = useState(null); // { area, city, state }

  const handlePincodeCheck = async (e) => {
    e.preventDefault();
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      setPincodeMsg('❌ Enter a valid 6-digit PIN code');
      return;
    }
    setPincodeLoading(true);
    setPincodeMsg('');
    setPincodeData(null);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const json = await res.json();
      if (json && json[0] && json[0].Status === 'Success' && json[0].PostOffice?.length > 0) {
        const po = json[0].PostOffice[0];
        const area = po.Name;
        const city = po.District;
        const state = po.State;
        setPincodeData({ area, city, state });
        // Calculate delivery date (3-5 business days)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 4);
        const formatted = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
        setPincodeMsg(`✅ Delivery to ${area}, ${city}, ${state} by ${formatted} | FREE`);
        // Save pincode + location to localStorage for checkout auto-fill
        localStorage.setItem('sentara_pincode', pincode);
        localStorage.setItem('sentara_pincode_city', city);
        localStorage.setItem('sentara_pincode_state', state);
        localStorage.setItem('sentara_pincode_area', area);
      } else {
        setPincodeMsg('❌ Invalid PIN code. Please check and try again.');
      }
    } catch (err) {
      setPincodeMsg('⚠️ Unable to verify PIN code. Check your internet connection.');
    } finally {
      setPincodeLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await api.products.getById(id);
        if (data.success) {
          setProduct(data.product);
          setQty(1);

          // Track in recently viewed
          if (user) {
            await api.user.addRecentlyViewed(data.product.id);
          }

          // Fetch related products
          const related = await api.products.list({ category: data.product.category, limit: 4 });
          if (related.success) {
            setRelatedProducts(related.products.filter(p => p.id !== data.product.id).slice(0, 3));
          }

          // Fetch price history
          const historyRes = await api.products.priceHistory(id);
          if (historyRes.success) {
            setPriceHistory(historyRes.history);
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
        showToast('Error loading product details');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      const quantityToAdd = parseInt(selectedPack) || 1;
      await addToCart(product.id, quantityToAdd, selectedColor, selectedSize);
      showToast(`Added ${quantityToAdd} ${quantityToAdd > 1 ? 'items' : 'item'} to cart! 🛒`);
    } catch (err) {
      showToast(err.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const added = toggleWishlist(product.id);
      showToast(added ? 'Added to Wishlist! ❤️' : 'Removed from Wishlist.');
    } catch (err) {
      showToast(err.message || 'Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
        <DetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h3 className="text-xl font-bold text-slate-800 dark:text-text-dark">Product not found</h3>
        <button
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 text-left"
    >
      {/* Breadcrumbs */}
      <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1 select-none">
        <span>Home</span> / <span>{product.category}</span> / <span className="text-slate-600 dark:text-slate-355">{product.name}</span>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-sm shadow-lg border border-slate-700/50 dark:border-slate-100 text-xs font-semibold flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Media Gallery */}
        <div className="md:col-span-5 space-y-4">
          {/* Main Image Display */}
          <div className="flex items-center justify-center bg-white dark:bg-slate-900/10 rounded-sm overflow-hidden border border-slate-200 dark:border-slate-800 p-4 aspect-square relative select-none">
            <span className="absolute top-3 left-3 z-10 text-[9px] font-black uppercase tracking-wider text-white bg-purple-600 px-2.5 py-1 rounded-sm shadow-sm">
              BESTSELLER
            </span>
            
            {user && (
              <button
                onClick={handleWishlistToggle}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full border shadow-sm backdrop-blur-md transition-colors ${
                  isInWishlist(product.id)
                    ? 'bg-red-50/90 dark:bg-red-950/80 border-red-200/50 text-red-500'
                    : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/30 text-slate-400 hover:text-red-550'
                }`}
              >
                <Heart size={14} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
              </button>
            )}

            <motion.img
              key={`${selectedColor}-${selectedImageIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={colorImages[selectedImageIndex]}
              alt={`${product.name} - ${selectedColor} - View ${selectedImageIndex + 1}`}
              className="max-h-[85%] max-w-[85%] object-contain hover:scale-103 transition-transform duration-300"
              onError={(e) => {
                e.target.src = getProductImage(product.name, product.category, null, true);
              }}
            />
          </div>

          {/* Thumbnail Strip */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {colorImages.map((img, index) => (
              <button
                key={`${selectedColor}-thumb-${index}`}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border-2 transition-all duration-200 ${
                  selectedImageIndex === index
                    ? 'border-primary shadow-md ring-1 ring-primary/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} - ${selectedColor} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getProductImage(product.name, product.category, null, true);
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Meta & Details Selectors */}
        <div className="md:col-span-7 space-y-6">
          <div className="space-y-2">
            {/* Category */}
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-accent bg-accent/10 px-2.5 py-1 rounded-sm">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-slate-850 dark:text-text-dark tracking-tight leading-tight pt-1">
              {product.name}
            </h1>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 mt-2 select-none">
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-white bg-[#388e3c] px-2 py-0.5 rounded-sm">
                {product.rating} <Star size={10} fill="currentColor" className="text-white" />
              </span>
              <span className="text-xs text-slate-500 font-bold">
                {product.reviews.toLocaleString()} Ratings & {(product.reviews * 0.12).toFixed(0)} Reviews
              </span>
              
              <span className="inline-flex items-center ml-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm italic tracking-tight leading-none">
                f-Assured<span className="text-yellow-400 ml-0.5 not-italic">★</span>
              </span>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="border-t border-b border-slate-100 dark:border-slate-800 py-4 space-y-1">
            <span className="text-xs font-bold text-[#388e3c]">Special Price</span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-sm text-slate-450 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-[#388e3c]">
                    {product.discount}% off
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Selected Color: <strong className="text-slate-800 dark:text-white font-extrabold ml-1">{selectedColor}</strong></span>
            <div className="flex gap-3 select-none">
              {['Teal', 'Pink', 'Grey', 'Yellow', 'Rose'].map(c => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  className={`w-11 h-11 border-2 rounded-sm overflow-hidden flex items-center justify-center p-0.5 transition-all ${
                    selectedColor === c ? 'border-primary shadow-sm bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-slate-350'
                  }`}
                >
                  <div className="w-full h-full rounded-sm" style={{ backgroundColor: getHexColor(c) }} />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center max-w-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Selected Size: <strong className="text-slate-800 dark:text-white font-extrabold ml-1">{selectedSize}</strong></span>
              <button className="text-xs font-bold text-primary dark:text-primary-light hover:underline uppercase tracking-wider">Size Chart</button>
            </div>
            <div className="flex gap-2.5 select-none">
              {['55 cm (Small)', '67 cm (Medium)', '76 cm (Large)'].map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 border text-xs font-bold rounded-sm transition-all ${
                    selectedSize === s
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-305 dark:border-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Pack Selector */}
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Selected Pack of: <strong className="text-slate-800 dark:text-white font-extrabold ml-1">{selectedPack}</strong></span>
            <div className="flex gap-2.5 select-none">
              {['1', '2', '3'].map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPack(p)}
                  className={`w-9 h-9 border text-xs font-bold rounded-sm flex items-center justify-center transition-all ${
                    selectedPack === p
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-305 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Pincode Estimator */}
          <div className="space-y-2 max-w-md bg-slate-50 dark:bg-slate-900/30 p-4 border border-slate-200/50 dark:border-slate-800 rounded-sm">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              📍 Check Delivery
            </label>
            <form onSubmit={handlePincodeCheck} className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <button
                type="submit"
                disabled={pincodeLoading}
                className="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-sm transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                {pincodeLoading ? (
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Check'}
              </button>
            </form>
            {pincodeMsg && (
              <p className={`text-[11px] font-bold mt-2 leading-relaxed ${pincodeMsg.startsWith('✅') ? 'text-[#388e3c]' : 'text-red-500'}`}>
                {pincodeMsg}
              </p>
            )}
            {pincodeData && (
              <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 border-t border-slate-200 dark:border-slate-700 pt-2">
                <p><span className="font-bold text-slate-700 dark:text-slate-300">Area:</span> {pincodeData.area}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-300">District:</span> {pincodeData.city}</p>
                <p><span className="font-bold text-slate-700 dark:text-slate-300">State:</span> {pincodeData.state}</p>
              </div>
            )}
          </div>

          {/* Available Offers section */}
          <div className="space-y-3 p-4 border border-slate-200/60 dark:border-slate-800 rounded-sm bg-white dark:bg-card-dark text-xs">
            <h4 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Available Offers</h4>
            <ul className="space-y-2.5 text-slate-650 dark:text-slate-400 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-[#388e3c] font-black">🏷️</span>
                <span><strong>Bank Offer:</strong> 5% Unlimited Cashback on Flipkart Axis Bank Credit Card. <button className="text-primary font-bold hover:underline">T&C</button></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#388e3c] font-black">🏷️</span>
                <span><strong>Bank Offer:</strong> Flat ₹1,000 Off on HDFC Bank Credit Card Transactions. <button className="text-primary font-bold hover:underline">T&C</button></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#388e3c] font-black">🏷️</span>
                <span><strong>Special Price:</strong> Get extra 10% off (price inclusive of cashback/coupon). <button className="text-primary font-bold hover:underline">T&C</button></span>
              </li>
            </ul>
          </div>

          {/* Price Drop Predictor (USP #8) */}
          <div className="space-y-4 p-4 border border-slate-200/60 dark:border-slate-800 rounded-sm bg-slate-50/50 dark:bg-slate-900/10 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-1">
                <TrendingDown size={13} /> AI Price Predictor
              </span>
              <span className="text-[9px] font-black text-slate-400 bg-slate-200/40 px-2 py-0.5 rounded-sm">Active Forecast</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-snug">
                  {product.discount > 25 
                    ? "🔥 Recommendation: BUY NOW (Lowest Price Guarantee)" 
                    : "⏳ Recommendation: WAIT FOR SALE (Price Drop Expected)"}
                </p>
                <p className="text-[10.5px] text-slate-450 mt-1 leading-normal">
                  {product.discount > 25 
                    ? `This item is currently at a high ${product.discount}% discount. The price is unlikely to drop further in the next 14 days.`
                    : `Our AI model predicts an 85% probability of a 5% to 10% price drop during the upcoming weekend flash sale.`}
                </p>
              </div>

              {/* Price forecast values */}
              <div className="flex-shrink-0 text-right space-y-0.5">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Expected Price</span>
                <span className="block text-sm font-black text-slate-900 dark:text-white">
                  ₹{Math.floor(product.price * (product.discount > 25 ? 1 : 0.93)).toLocaleString('en-IN')}
                </span>
                <span className="block text-[8.5px] text-[#388e3c] font-bold">
                  {product.discount > 25 ? "Current price is lowest" : "Save up to ₹1,200"}
                </span>
              </div>
            </div>

            {/* Historical price chart */}
            <div className="space-y-1">
              <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider block">30-Day Price Trend</span>
              <div className="flex items-end justify-between gap-1 h-12 pt-2 bg-white dark:bg-slate-950 p-2 rounded-sm border border-slate-100 dark:border-slate-900 select-none">
                {priceHistory.length > 0 ? priceHistory.filter((_, idx) => idx % 6 === 0).map((bar, idx) => {
                  const maxPrice = Math.max(...priceHistory.map(h => h.price));
                  const hPercent = `${Math.max(10, (bar.price / maxPrice) * 100)}%`;
                  return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow z-30">
                      ₹{bar.price.toLocaleString('en-IN')}
                    </div>
                    {/* Bar Container - explicit height for percentage scale */}
                    <div className="w-full h-8 flex items-end">
                      <div 
                        className={`w-full rounded-t-xs transition-all ${
                          idx === 4 || idx === 5 
                            ? 'bg-accent' 
                            : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                        }`} 
                        style={{ height: hPercent }} 
                      />
                    </div>
                    <span className="text-[7.5px] text-slate-400 font-bold mt-1 scale-90">{bar.day === 0 ? 'Today' : `-${bar.day}d`}</span>
                  </div>
                )}) : <span className="text-xs text-slate-400">Loading chart...</span>}
              </div>
            </div>

            {/* Price drop Alert subscribe */}
            <button
              onClick={() => {
                setPriceAlertSet(!priceAlertSet);
                showToast(priceAlertSet ? "Price alert cancelled." : "🔔 Price Drop Alert set! We will notify you when the price drops.");
              }}
              className={`w-full py-2 border rounded-sm flex items-center justify-center gap-1.5 font-bold transition-all text-[10.5px] uppercase ${
                priceAlertSet
                  ? 'bg-accent/5 dark:bg-accent/20 text-accent border-accent'
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-350'
              }`}
            >
              <Bell size={12} fill={priceAlertSet ? 'currentColor' : 'none'} />
              <span>{priceAlertSet ? "Price Alert Enabled (Cancel)" : "Track Price / Set Alert"}</span>
            </button>
          </div>

          {/* Action triggers stacked under options */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 select-none">
            {/* Cart Icon */}
            <button 
              onClick={handleAddToCart}
              disabled={!product.inStock || adding}
              className={`w-12 h-12 border rounded-sm flex items-center justify-center transition-colors ${
                product.inStock
                  ? 'border-slate-205 hover:border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-305 hover:bg-slate-50 dark:hover:bg-slate-800'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
              title="Add to Cart"
            >
              <ShoppingCart size={16} />
            </button>

            {/* Buy with EMI */}
            {product.inStock && (
              <button
                onClick={async () => {
                  showToast('EMI Plan selected! Proceeding to checkout...');
                  await handleAddToCart();
                  navigate('/checkout');
                }}
                className="flex-1 py-3 px-4 border border-slate-800 dark:border-white rounded-sm text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase text-center"
              >
                Buy with EMI <span className="block text-[8px] text-slate-500 font-semibold normal-case">From ₹110/m</span>
              </button>
            )}

            {/* Buy Button */}
            <button
              onClick={async () => {
                if (product.inStock) {
                  await handleAddToCart();
                  navigate('/checkout');
                }
              }}
              disabled={!product.inStock}
              className={`flex-1 py-3 px-6 rounded-sm text-xs font-black uppercase tracking-wide transition-all shadow-sm text-center ${
                product.inStock 
                  ? 'bg-accent hover:bg-accent-dark text-white' 
                  : 'bg-slate-100 dark:bg-slate-850 text-slate-400 cursor-not-allowed'
              }`}
            >
              {product.inStock ? `Buy at ₹${(product.price * parseInt(selectedPack)).toLocaleString('en-IN')}` : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs description / reviews section */}
      <div className="mt-16 border-b border-slate-200 dark:border-slate-800/80 flex gap-6 text-sm font-bold text-slate-400 dark:text-slate-500">
        {[
          { id: 'description', label: 'Description', icon: <FileText size={15} /> },
          { id: 'specs', label: 'Specifications', icon: <Info size={15} /> },
          { id: 'reviews', label: 'Reviews', icon: <MessageSquare size={15} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-primary text-primary dark:text-primary-light'
                : 'border-transparent hover:text-slate-700 dark:hover:text-slate-350'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="py-6 min-h-[120px] text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
        {activeTab === 'description' && (
          <p>{product.description}</p>
        )}

        {activeTab === 'specs' && (
          <div className="max-w-md border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden bg-white dark:bg-card-dark">
            <div className="grid grid-cols-2 p-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 dark:text-slate-500">Product Code</span>
              <span className="font-semibold text-slate-800 dark:text-text-dark">{product.id}</span>
            </div>
            <div className="grid grid-cols-2 p-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-400 dark:text-slate-500">Category</span>
              <span className="font-semibold text-slate-800 dark:text-text-dark">{product.category}</span>
            </div>
            <div className="grid grid-cols-2 p-3">
              <span className="font-bold text-slate-400 dark:text-slate-500">Inventory Status</span>
              <span className={`font-semibold ${product.inStock ? 'text-success' : 'text-error'}`}>
                {product.inStock ? 'Available (In Stock)' : 'Out of Stock'}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-text-dark">User Reviews Summary</h4>
            <p>
              Average rating is <strong>{product.rating} / 5</strong> based on <strong>{product.reviews.toLocaleString()}</strong> customer reviews. 100% of reviews are collected from verified buyers.
            </p>
          </div>
        )}
      </div>

      {/* Related items */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800/60">
          <h2 className="text-lg font-bold text-slate-850 dark:text-text-dark mb-6">
            Frequently Viewed Together
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="group flex gap-4 bg-white dark:bg-card-dark rounded-xl border border-slate-200/50 dark:border-slate-800/50 p-3 shadow-soft cursor-pointer hover:border-primary/20 transition-all duration-300"
              >
                <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900/20 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                  <img
                    src={getProductImage(p.name, p.category, p.image)}
                    alt={p.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain transition-transform duration-305 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = getProductImage(p.name, p.category, null, true);
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-text-dark line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {p.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-text-dark">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    {p.discount > 0 && (
                      <span className="text-[9px] font-bold text-success">
                        {p.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
