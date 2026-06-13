import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../api';
import { resolvePincode } from '../utils/pincodeResolver';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Package, 
  Search, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Heart,
  Bell,
  CheckCircle2,
  Tag,
  Truck,
  Mic,
  Camera,
  Award,
  Sparkles
} from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode, onSearch }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [searchVal, setSearchVal] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [shoppingScore, setShoppingScore] = useState(250); // Default score

  // Ref for clicking outside notification dropdown
  const notifRef = useRef(null);
  const fileInputRef = useRef(null);

  // Poll for Shopping Score points from localStorage
  useEffect(() => {
    const fetchScore = () => {
      const savedScore = localStorage.getItem('sentara_points');
      if (savedScore !== null) {
        setShoppingScore(parseInt(savedScore, 10));
      } else {
        localStorage.setItem('sentara_points', '250');
      }
    };
    fetchScore();
    const interval = setInterval(fetchScore, 2000);
    return () => clearInterval(interval);
  }, []);

  // Web Speech API Voice Search
  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("❌ Voice recognition is not supported in this browser. Try Chrome/Edge.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-IN';
    rec.interimResults = false;

    rec.onstart = () => {
      setIsListening(true);
    };

    rec.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setSearchVal(voiceText);
      if (onSearch) {
        onSearch(voiceText);
      }
      navigate('/');
    };

    rec.start();
  };

  // Simulated Image Search
  const handleImageSearchClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulate looking up item details/categories
    const mockCategories = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Beauty'];
    // Random matching categories just for simulation
    const matchedCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
    
    alert(`📷 Image uploaded successfully!\nAI detected item class matching: "${matchedCategory}" category.`);
    setSearchVal(matchedCategory);
    if (onSearch) {
      onSearch(matchedCategory);
    }
    navigate('/');
  };

  // Mock Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome Discount unlocked!',
      desc: 'Use promo code SAVE10 for 10% off your first purchase above ₹1,000.',
      icon: <Tag size={16} className="text-primary" />,
      time: 'Just now',
      unread: true
    },
    {
      id: 2,
      title: 'Order Status Update',
      desc: 'Your mock order was confirmed and is preparing to ship.',
      icon: <Truck size={16} className="text-success" />,
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      title: 'SENTARA Super Sale is Live!',
      desc: 'Exclusive offers on Smart TVs and wireless headphones. Shop now!',
      icon: <CheckCircle2 size={16} className="text-accent" />,
      time: '3 hours ago',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const [deliveryLocation, setDeliveryLocation] = useState(() => localStorage.getItem('deliveryLocation') || 'Select delivery location');

  const handleLocationClick = () => {
    const loc = prompt('Enter your delivery PIN code or City name:', deliveryLocation === 'Select delivery location' ? '' : deliveryLocation);
    if (loc !== null) {
      const cleanLoc = loc.trim();
      if (!cleanLoc) {
        setDeliveryLocation('Select delivery location');
        localStorage.setItem('deliveryLocation', 'Select delivery location');
        return;
      }
      
      if (/^\d{6}$/.test(cleanLoc)) {
        const resolvedAddress = resolvePincode(cleanLoc);
        setDeliveryLocation(cleanLoc);
        localStorage.setItem('deliveryLocation', cleanLoc);
        
        if (user) {
          api.user.addAddress({
            label: 'Home',
            name: user.name || 'Valued Customer',
            mobile: user.mobile || '9999999999',
            line1: 'Main Area',
            line2: '',
            city: resolvedAddress.city,
            state: resolvedAddress.state,
            pincode: cleanLoc,
            isDefault: true
          }).then(() => {
            alert(`Address automatically added to your profile:\n${user.name}\nMain Area, ${resolvedAddress.city}, ${resolvedAddress.state} - ${cleanLoc}`);
          }).catch(err => {
            console.error('Failed to automatically add address:', err);
          });
        } else {
          localStorage.setItem('tempAddress', JSON.stringify({
            city: resolvedAddress.city,
            state: resolvedAddress.state,
            pincode: cleanLoc
          }));
          alert(`Delivery location set to: ${resolvedAddress.city}, ${resolvedAddress.state} - ${cleanLoc}.\nLog in to save this address to your profile!`);
        }
      } else {
        setDeliveryLocation(cleanLoc);
        localStorage.setItem('deliveryLocation', cleanLoc);
      }
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="w-full h-8 sm:h-9 bg-primary text-white text-[12px] font-medium flex items-center overflow-hidden relative z-50 shadow-sm border-b border-slate-800/20 select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8 pl-4 pr-4">
          <span>⚡ SENTARA Super Sale Live: Flat 10% Off with code <span className="underline font-bold">SAVE10</span></span>
          <span>•</span>
          <span>🚚 Free Delivery on orders over ₹499!</span>
          <span>•</span>
          <span>⚡ Fast & Secure Checkout</span>
          <span>•</span>
          <span>🎁 Special Referral Bonuses inside!</span>
          
          {/* Duplicate for seamless looping */}
          <span className="ml-8">⚡ SENTARA Super Sale Live: Flat 10% Off with code <span className="underline font-bold">SAVE10</span></span>
          <span>•</span>
          <span>🚚 Free Delivery on orders over ₹499!</span>
          <span>•</span>
          <span>⚡ Fast & Secure Checkout</span>
          <span>•</span>
          <span>🎁 Special Referral Bonuses inside!</span>
        </div>
      </div>

      <nav className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300 shadow-lg select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-3">
          
          {/* --- MOBILE NAVBAR LAYOUT (md:hidden) --- */}
          <div className="flex flex-col md:hidden space-y-2">
            {/* Row 1: Logo & Icons */}
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center font-extrabold tracking-tight text-slate-900 dark:text-white hover:opacity-85 transition-opacity py-1">
                <span className="text-sm font-black tracking-wider uppercase">SENTARA</span>
              </Link>
              
              {/* Icons Group */}
              <div className="flex items-center gap-5">
                {/* Profile / Account (Icon Only) */}
                <Link 
                  to={user ? "/profile" : "/login"} 
                  className="text-slate-700 dark:text-slate-300 p-1 hover:text-primary transition-colors flex items-center justify-center"
                  title="Profile"
                >
                  <User size={18} />
                </Link>

                {/* Cart (Icon Only with Badge Top-Right) */}
                <Link 
                  to="/cart" 
                  className="relative text-slate-700 dark:text-slate-300 p-1 hover:text-primary transition-colors flex items-center justify-center"
                  title="Cart"
                >
                  <ShoppingCart size={18} />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[7.5px] font-black text-white shadow-sm ring-1 ring-white dark:ring-slate-900">
                      {itemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Row 2: Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Search size={13} />
              </span>
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search products, brands, student kits..."
                className="w-full pl-8 pr-16 py-1.5 rounded-lg border border-slate-205 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs shadow-inner placeholder-slate-450"
              />
              {/* Voice & Image Search triggers */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={startVoiceRecognition}
                  className={`p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${isListening ? 'text-red-500 bg-red-50' : 'text-slate-450'}`}
                  title="Search with Voice"
                >
                  <Mic size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleImageSearchClick}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                  title="Search with Image"
                >
                  <Camera size={13} />
                </button>
              </div>
            </form>

            {/* Row 3: Deliver Location & Actions */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/40 gap-2">
              {/* Delivery location pill */}
              <div 
                onClick={handleLocationClick}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/60 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-650 dark:text-slate-300 max-w-[55%] truncate font-bold"
              >
                <span>📍</span>
                <span className="text-primary dark:text-primary-light font-black truncate">{deliveryLocation}</span>
              </div>
              
              {/* Right actions (Points & Theme) */}
              <div className="flex items-center gap-2">
                {/* Shopping Score Reward Points / Greeting */}
                <div 
                  onClick={() => navigate(user ? '/profile' : '/login')}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center gap-0.5 px-2 py-1 rounded-full font-black text-[9px] shadow-sm hover:scale-105 transition-transform cursor-pointer"
                  title="SENTARA Loyalty Points"
                >
                  <Award size={10} />
                  <span>{user ? `${user.name.split(' ')[0]}: ${user.points || 0} Pts` : `0 Pts`}</span>
                </div>

                {/* Theme Toggle */}
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="text-slate-500 dark:text-slate-400 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-full hover:text-primary transition-colors flex items-center justify-center"
                  title="Toggle Theme"
                >
                  {darkMode ? <Sun size={12} /> : <Moon size={12} />}
                </button>
              </div>
            </div>
          </div>

          {/* --- DESKTOP NAVBAR LAYOUT (hidden md:block) --- */}
          <div className="hidden md:block">
            {/* Row 1: Logo & Location */}
            <div className="flex items-center justify-between gap-4 mb-2.5">
              {/* Logo Group */}
              <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center font-extrabold tracking-wider text-slate-950 dark:text-white select-none hover:opacity-85 transition-opacity py-1.5">
                  <span className="text-base font-black uppercase">SENTARA</span>
                </Link>

                {/* Shopping Score Reward points display */}
                <div 
                  onClick={() => navigate(user ? '/profile' : '/login')}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center gap-1 px-3 py-1 rounded-full font-black text-[10px] select-none shadow-sm hover:scale-105 transition-transform cursor-pointer" 
                  title="SENTARA Loyalty Points Balance"
                >
                  <Award size={13} className="text-white" />
                  <span>{user ? `${user.points || 0} Pts` : `0 Pts`}</span>
                </div>
              </div>

              {/* Location Estimator */}
              <div 
                onClick={handleLocationClick}
                className="flex items-center gap-1 cursor-pointer text-slate-655 dark:text-slate-350 hover:text-primary dark:hover:text-primary-light transition-colors text-xs select-none"
              >
                <span className="text-black dark:text-white">📍</span>
                <span className="font-bold text-slate-500 dark:text-slate-400">Deliver to</span>
                <span className="text-primary dark:text-primary-light font-black hover:underline ml-1">{deliveryLocation} &gt;</span>
              </div>
            </div>

            {/* Row 2: Search Bar & Actions */}
            <div className="flex items-center justify-between gap-6">
              {/* Search Input Box */}
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="Search for Products, Brands, Student Kits and More..."
                  className="w-full pl-9 pr-20 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-xs shadow-inner placeholder-slate-450"
                />
                
                {/* Voice & Image Search triggers */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={startVoiceRecognition}
                    className={`p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-slate-450'}`}
                    title="Search with Voice"
                  >
                    <Mic size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleImageSearchClick}
                    className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-450 transition-colors"
                    title="Search with Image"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                {/* Hidden file input for image search simulation */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </form>

              {/* Actions Bar */}
              <div className="flex items-center gap-6">
                {/* Profile / Login */}
                {user ? (
                  <div className="relative group">
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors py-2 select-none"
                    >
                      <User size={15} />
                      <span>{user.name.split(' ')[0]}</span>
                      <span className="text-[9px] ml-0.5">▼</span>
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full hidden group-hover:block w-48 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-sm shadow-premium border border-slate-200/50 dark:border-slate-800 p-2 z-50 mt-1">
                      <Link to="/profile" className="block px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-left">My Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-left">Orders</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs font-bold text-error hover:bg-slate-50 dark:hover:bg-slate-800">Logout</button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <Link
                      to="/login"
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors py-2 select-none"
                    >
                      <User size={15} />
                      <span>Login</span>
                      <span className="text-[9px] ml-0.5">▼</span>
                    </Link>
                    <div className="absolute right-0 top-full hidden group-hover:block w-48 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-sm shadow-premium border border-slate-200/50 dark:border-slate-800 p-2 z-50 mt-1">
                      <Link to="/login" className="block px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 text-left">Sign In / Register</Link>
                    </div>
                  </div>
                )}

                {/* Theme toggle & options */}
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="text-slate-700 dark:text-slate-200 hover:text-primary transition-colors py-2"
                  title="Toggle Theme"
                >
                  {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                {/* Cart */}
                {user && (
                  <Link
                    to="/cart"
                    className="relative flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors py-2 select-none"
                  >
                    <ShoppingCart size={15} />
                    <span>Cart</span>
                    {itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8.5px] font-black text-white shadow-sm ring-1 ring-white">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            </div>
          </div>

        </div>
      </nav>
    </>
  );
}
