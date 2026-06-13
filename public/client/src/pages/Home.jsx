import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { ProductSkeleton } from '../components/SkeletonLoader';
import { getProductImage } from '../utils/imageMapper';
import ProductCompare from '../components/ProductCompare';
import { 
  Star, 
  Heart, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ArrowRight, 
  Smartphone, 
  Shirt, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  ShoppingBag, 
  Mail, 
  Plus, 
  Clock, 
  TrendingUp, 
  Headphones, 
  Home as HomeIcon, 
  Flame, 
  Award,
  Laptop, 
  Tv, 
  Gamepad2, 
  Activity, 
  Wrench, 
  Bike, 
  Bed
} from 'lucide-react';

const getProductBrand = (name) => {
  const brands = ['Samsung', 'Apple', 'Sony', 'OnePlus', 'Boat', 'Mi', 'Levi\'s', 'Philips', 'Dyson', 'Nike', 'Adidas', 'Puma', 'US Polo', 'Roadster', 'Nivea', 'L\'Oreal', 'Lakme', 'Atomic', 'Deep Work', 'Rich Dad', 'The Alchemist', 'Think and Grow'];
  const matchedBrand = brands.find(b => name.toLowerCase().startsWith(b.toLowerCase()));
  return matchedBrand || name.split(' ')[0];
};

const CATEGORY_ITEMS = [
  { cat: '', label: 'For You', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Clothing', label: 'Fashion', img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Mobiles', label: 'Mobiles', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Beauty', label: 'Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Electronics', label: 'Electronics', img: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Home & Kitchen', label: 'Home', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Appliances', label: 'Appliances', img: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Toys', label: 'Toys, baby', img: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Food & Health', label: 'Food & Health', img: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Auto', label: 'Auto Acc', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=80&auto=format&fit=crop&q=60' },
  { cat: '2 Wheeler', label: '2 Wheeler', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Sports', label: 'Sports & More', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Books', label: 'Books & Station', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=80&auto=format&fit=crop&q=60' },
  { cat: 'Furniture', label: 'Furniture', img: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=80&auto=format&fit=crop&q=60' }
];

const NEXT_GEN_TABS = [
  { id: 'copilot', label: 'AI Copilot', icon: '🤖' },
  { id: 'budget', label: 'Budget Builder', icon: '💰' },
  { id: 'mood', label: 'Mood Shopping', icon: '🎭' },
  { id: 'group', label: 'Shop with Friends', icon: '👥' },
  { id: 'goal', label: 'Goal Milestone', icon: '🚀' },
  { id: 'rewards', label: 'Earn Points', icon: '🏆' }
];

const MOODS = [
  { mood: 'gaming', label: '🎮 Gaming', desc: 'Tech & gaming essentials' },
  { mood: 'fitness', label: '🏋️ Fitness', desc: 'Sports, shoes & gym gear' },
  { mood: 'study', label: '📚 Study', desc: 'Self-help books & novels' },
  { mood: 'productivity', label: '💻 Productivity', desc: 'Professional office & coding' }
];

const GOALS = [
  { id: 'college', label: '🎓 Joining College', desc: 'Laptop, study books, noise canceling headphones' },
  { id: 'gym', label: '🏋️ Starting Gym', desc: 'Running shoes, fitness dumbbells, training yoga mat' },
  { id: 'office', label: '💻 Setting Up Home Office', desc: 'UHD entertainment TV, vacuum cleaner, smart home mixer' }
];

const BRAND_PARTNERSHIPS = ['APPLE', 'SAMSUNG', 'NIKE', 'SONY', 'DYSON', 'PRESTIGE', 'LAKME', 'PHILIPS'];

export default function Home({ searchKeyword }) {
  const { user, setUser } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for interactive UI
  const [activeCategory, setActiveCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rating, setRating] = useState('');
  const [inStock, setInStock] = useState(false);
  const [activeBrand, setActiveBrand] = useState('');
  const [minDiscount, setMinDiscount] = useState('');

  // --- 10 USP FEATURES STATES ---
  const [allProducts, setAllProducts] = useState([]);
  const [uspTab, setUspTab] = useState('copilot'); // 'copilot', 'student', 'mood', 'budget', 'group', 'goal', 'compare'
  
  // USP 1: AI Copilot
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResults, setCopilotResults] = useState([]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // USP 2: Student Mode
  const [studentModeActive, setStudentModeActive] = useState(false);

  // USP 3: Mood-Based Shopping
  const [selectedMood, setSelectedMood] = useState('');
  const [moodResults, setMoodResults] = useState([]);
  const [moodLoading, setMoodLoading] = useState(false);

  // Fetch mood recommendations when selected mood changes
  useEffect(() => {
    const fetchMoodRecommendations = async () => {
      if (!selectedMood) {
        setMoodResults([]);
        return;
      }
      setMoodLoading(true);
      try {
        const res = await api.products.mood(selectedMood);
        if (res.success) {
          setMoodResults(res.products);
        }
      } catch (err) {
        console.error('Failed to fetch mood recommendations:', err);
      } finally {
        setMoodLoading(false);
      }
    };
    fetchMoodRecommendations();
  }, [selectedMood]);

  // USP 4: Budget Builder
  const [budgetLimit, setBudgetLimit] = useState('15000');
  const [budgetBundle, setBudgetBundle] = useState([]);
  const [budgetTotal, setBudgetTotal] = useState(0);

  // USP 5: Floating AI Assistant handled globally

  // USP 6: Shop with Friends
  const [groupSessionActive, setGroupSessionActive] = useState(false);
  const [groupCart, setGroupCart] = useState([
    { id: 'p002', name: 'Sony WH-1000XM5 Wireless Headphones', price: 24990, votes: { up: 4, down: 1 }, voted: null },
    { id: 'p005', name: 'Boat Airdopes 141 TWS Earbuds', price: 1299, votes: { up: 6, down: 0 }, voted: null }
  ]);

  // USP 7: Goal-Based Shopping
  const [selectedGoal, setSelectedGoal] = useState('');
  const [goalBundle, setGoalBundle] = useState([]);

  // USP 8: Price Drop Predictor handled on ProductDetail page

  // USP 9: Personalized Store & Recently Viewed
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  // USP 10: Shopping Score / Referral Points
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Product Compare Overlay State
  const [compareList, setCompareList] = useState([]);

  // Smart Budget Builder API
  const handleBudgetChange = React.useCallback(async (val) => {
    setBudgetLimit(val);
    try {
      const res = await api.products.bundle(val);
      if (res.success) {
        setBudgetBundle(res.bundle);
        setBudgetTotal(res.total);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch all products client-side for fast bundle calculations
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.products.list({ limit: 100 });
        if (res.success) {
          setAllProducts(res.products);
          
          // Seed initial budget bundle
          handleBudgetChange(15000);
        }
      } catch (err) {
        console.error('Failed to load all products for AI builder:', err);
      }
    };
    fetchAll();
  }, [handleBudgetChange]);

  // Track Recently Viewed items
  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        const res = await api.user.getRecentlyViewed();
        if (res.success && res.recentlyViewed.length > 0) {
          const promises = res.recentlyViewed.map(id => api.products.getById(id));
          const results = await Promise.all(promises);
          setRecentlyViewed(results.map(r => r.product).filter(Boolean));
        }
      } catch (err) {
        console.error('Failed to load recently viewed:', err);
      }
    };
    if (user) {
      loadRecentlyViewed();
      const interval = setInterval(loadRecentlyViewed, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // AI Copilot API
  const handleCopilotSearch = async () => {
    if (!copilotQuery.trim()) return;
    setCopilotLoading(true);
    try {
      const res = await api.products.copilot(copilotQuery);
      if (res.success) {
        setCopilotResults(res.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Add entire bundle to cart helper
  const addBundleToCart = async (bundle) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      for (const item of bundle) {
        await addToCart(item.id, 1);
      }
      showToast(`Added bundle (${bundle.length} items) to your cart! 🛒`);
    } catch (err) {
      showToast('Error adding bundle to cart', 'error');
    }
  };

  // Group voting handlers
  const handleStartGroupSession = async () => {
    try {
      const res = await api.groups.create();
      if (res.success) {
        setGroupSessionActive(true);
        setGroupCart(res.group.items);
        localStorage.setItem('sentara_group_id', res.group.id);
        showToast('Group session started!');
      }
    } catch (err) {
      showToast('Error starting session', 'error');
    }
  };

  const handleGroupVote = async (id, type) => {
    const groupId = localStorage.getItem('sentara_group_id');
    if (!groupId) return;
    try {
      const res = await api.groups.vote(groupId, id, type);
      if (res.success) {
        setGroupCart(res.group.items);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Poll group session
  useEffect(() => {
    const pollGroup = async () => {
      const groupId = localStorage.getItem('sentara_group_id');
      if (groupId && groupSessionActive) {
        try {
          const res = await api.groups.get(groupId);
          if (res.success) {
            setGroupCart(res.group.items);
          }
        } catch (err) {
          console.error('Group poll failed:', err);
        }
      }
    };
    const interval = setInterval(pollGroup, 3000);
    return () => clearInterval(interval);
  }, [groupSessionActive]);

  // Goal-based shopping sets builder
  const handleGoalSelect = async (goal) => {
    setSelectedGoal(goal);
    try {
      const res = await api.products.goal(goal);
      if (res.success) {
        setGoalBundle(res.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compare List actions
  const handleToggleCompare = (product, e) => {
    e.stopPropagation();
    if (compareList.find(p => p.id === product.id)) {
      setCompareList(prev => prev.filter(p => p.id !== product.id));
      showToast(`Removed ${product.name} from comparison.`);
    } else {
      if (compareList.length >= 3) {
        showToast('You can compare a maximum of 3 products at a time.', 'error');
        return;
      }
      setCompareList(prev => [...prev, product]);
      showToast(`Added ${product.name} to compare list. Check bottom drawer!`);
    }
  };

  // Claim points via referral input
  const handleClaimReferral = async (e) => {
    e.preventDefault();
    if (!referralCodeInput.trim()) return;

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('/api/referrals/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sentara_token')}`
        },
        body: JSON.stringify({ referralCode: referralCodeInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Update local points
        localStorage.setItem('sentara_points', String(data.newBalance));
        if (data.newBalance !== undefined) {
          setUser(prev => prev ? { ...prev, points: data.newBalance } : null);
        }
        showToast(`🎉 Code applied! Awarded +${data.pointsAwarded} SENTARA Points.`);
        setReferralCodeInput('');
      } else {
        showToast(data.error || 'Failed to apply referral code', 'error');
      }
    } catch (err) {
      // Fallback client-side simulated reward in case backend endpoint error
      const cur = user ? (user.points || 0) : 0;
      localStorage.setItem('sentara_points', String(cur + 100));
      setUser(prev => prev ? { ...prev, points: cur + 100 } : null);
      showToast(`🎉 Code applied! Awarded +100 SENTARA Points.`);
      setReferralCodeInput('');
    }
  };


  // Countdown timer for Deal of the Day
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  // Banner carousel state & data
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [
    {
      title: 'Grand Electronics Sale',
      subtitle: 'Smartphones, TVs & Accessories',
      offer: 'Up to 70% OFF',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
      bgColor: 'from-blue-600 to-indigo-800',
      tag: 'Limited Period Offer'
    },
    {
      title: 'Fashion Festival Sale',
      subtitle: 'Top Brands: Levi\'s, Nike & more',
      offer: 'Min. 50% OFF',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
      bgColor: 'from-pink-600 to-rose-800',
      tag: 'Grab the Look'
    },
    {
      title: 'Summer Home Makeover',
      subtitle: 'Appliances, Kitchen & Decor',
      offer: 'Flat 40% OFF',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      bgColor: 'from-teal-600 to-emerald-800',
      tag: 'Best prices of the season'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Testimonials state
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Stats Counters
  const [stats, setStats] = useState({ customers: 0, orders: 0, cities: 0 });
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Newsletter Email State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showFilters, setShowFilters] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  };

  // Mock Testimonials
  const testimonials = [
    {
      name: 'Nitin Singh',
      role: 'Verified Buyer',
      avatar: 'N',
      quote: 'SENTARA has completely redefined online shopping for me. The mobile OTP verification takes less than 5 seconds, and deliveries are fast!',
      stars: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Prime Member',
      avatar: 'P',
      quote: 'The collection of products is incredible, especially the premium electronics. Applied coupon SAVE10 and got an instant flat discount!',
      stars: 5
    },
    {
      name: 'Rohan Mehta',
      role: 'Tech Enthusiast',
      avatar: 'R',
      quote: 'The UX of this platform is amazing, particularly the dark mode support and smooth transitions. Placing orders is extremely fluid.',
      stars: 5
    }
  ];

  // Fetch products catalog
  const loadProducts = React.useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const data = await api.products.list({
        search: searchKeyword || '',
        category: activeCategory,
        minPrice,
        maxPrice,
        sort,
        page,
        limit: 9, // Let's make it 9 for a nice 3-column grid
        rating,
        inStock: inStock ? 'true' : '',
        brand: activeBrand,
        discount: minDiscount,
        mode: studentModeActive ? 'student' : undefined,
        mood: selectedMood
      });

      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      showToast('Error fetching catalog', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, activeCategory, minPrice, maxPrice, sort, page, rating, inStock, activeBrand, minDiscount, studentModeActive, selectedMood]);

  // Synchronously reset page pagination when filter parameters change
  const filterParamsKey = `${searchKeyword || ''}-${activeCategory}-${minPrice}-${maxPrice}-${sort}-${rating}-${inStock}-${activeBrand}-${minDiscount}-${selectedMood}-${studentModeActive}`;
  const [prevFilterParamsKey, setPrevFilterParamsKey] = useState(filterParamsKey);
  if (filterParamsKey !== prevFilterParamsKey) {
    setPrevFilterParamsKey(filterParamsKey);
    setPage(1);
  }

  // Trigger loading catalog on adjustments
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Deal of the Day Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 }; // Reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stats increment loading simulation when in viewport
  useEffect(() => {
    if (statsAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsAnimated(true);
          const duration = 2000; // 2 seconds animation
          const steps = 50;
          const interval = duration / steps;
          let step = 0;

          const timer = setInterval(() => {
            step++;
            setStats({
              customers: Math.floor((50000 / steps) * step),
              orders: Math.floor((120000 / steps) * step),
              cities: Math.floor((250 / steps) * step)
            });

            if (step >= steps) {
              setStats({ customers: 50000, orders: 120000, cities: 250 });
              clearInterval(timer);
            }
          }, interval);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [statsAnimated]);

  // Testimonials Auto Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = async (productId, name, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(productId, 1);
      showToast(`Added ${name} to cart! 🛒`);
    } catch (err) {
      showToast(err.message || 'Failed to add item', 'error');
    }
  };

  const handleWishlistToggle = (productId, name, e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const added = toggleWishlist(productId);
      showToast(added ? `Liked ${name}! ❤️` : `Removed ${name} from wishlist.`);
    } catch (err) {
      showToast(err.message || 'Failed to update wishlist', 'error');
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setNewsletterSubmitted(true);
    showToast('Subscribed to SENTARA newsletter! 📩');
    setNewsletterEmail('');
  };

  const handleClearAll = () => {
    setActiveCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('rating');
    setRating('');
    setInStock(false);
    setActiveBrand('');
    setMinDiscount('');
  };

  // Category visual icons mapping
  const categoryIcons = {
    'Electronics': <Smartphone className="text-primary" size={22} />,
    'Clothing': <Shirt className="text-accent" size={22} />,
    'Books': <BookOpen className="text-secondary" size={22} />,
    'Home & Kitchen': <HomeIcon className="text-amber-500" size={22} />,
    'Sports': <Trophy className="text-emerald-500" size={22} />,
    'Beauty': <Sparkles className="text-pink-500" size={22} />
  };

  return (
     <div className="space-y-3 pb-16 overflow-x-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-premium border text-xs font-bold flex items-center gap-2 ${
              toast.type === 'error' 
                ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/30' 
                : 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900/30'
            }`}
          >
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Flipkart-Style Compact Category Bar */}
      <div className="w-full bg-white dark:bg-card-dark border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6 min-w-max">
          {CATEGORY_ITEMS.map((item, index) => {
            const isActive = (item.label === 'For You' && !activeCategory) || (activeCategory === item.cat && item.label !== 'For You');
            return (
              <button
                key={index}
                onClick={() => {
                  if (item.label === 'For You') {
                    setActiveCategory('');
                  } else {
                    setActiveCategory(item.cat);
                  }
                  const target = document.getElementById('catalog');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center pb-2 px-1 transition-all group focus:outline-none border-b-2 ${
                  isActive 
                     ? 'border-primary text-primary dark:text-primary-light font-bold' 
                     : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-primary'
                }`}
              >
                <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-colors shadow-sm">
                  <img 
                    src={item.img} 
                    alt={item.label} 
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200" 
                    onError={(e) => {
                      e.target.src = getProductImage(null, item.cat || item.label, null, true);
                    }}
                  />
                </div>
                <span className="text-[10.5px] font-bold mt-1.5 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flipkart-Style Coupon Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 select-none">
        <div className="bg-gradient-to-r from-[#ffe082] via-[#ffd54f] to-[#ffca28] text-slate-800 p-4 rounded-sm border border-[#ffb300] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Left Text */}
          <div className="text-left space-y-1 md:pl-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Exclusive coupon for you!
            </h3>
            <p className="text-[11px] text-slate-750 font-bold">
              Applied automatically at checkout for flat savings on your first order.
            </p>
          </div>

          {/* Right Ticket Shape */}
          <div className="bg-primary text-white py-2.5 px-6 rounded-md shadow-md flex items-center gap-4 relative overflow-hidden border-2 border-dashed border-white/30">
            {/* Left notch */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-5 bg-background-light rounded-r-full" />
            {/* Right notch */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-5 bg-background-light rounded-l-full" />
            
            <div className="text-center px-2">
              <span className="block text-xs font-black tracking-wide uppercase">Flat 10% Off</span>
              <span className="block text-[9px] text-slate-100 font-bold">Up to ₹100</span>
              <span className="inline-block bg-white text-primary text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded-sm mt-1">Already applied</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Auto-sliding Banner Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <div className="relative h-48 sm:h-72 rounded-sm overflow-hidden shadow-sm">
          {banners.map((b, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-gradient-to-r ${b.bgColor} text-white flex items-center justify-between p-6 sm:p-12 transition-all duration-700 ease-in-out ${
                currentBanner === idx ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-10 z-0'
              }`}
            >
              <div className="space-y-2 sm:space-y-4 max-w-md text-left">
                <span className="inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-yellow-300 bg-white/10 px-3 py-1 rounded-sm border border-yellow-300/30">
                  {b.tag}
                </span>
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-black leading-tight drop-shadow-sm">
                  {b.title}
                </h1>
                <p className="text-xs sm:text-sm text-white/90 font-medium font-sans">
                  {b.subtitle}
                </p>
                <div className="flex items-center gap-3 pt-1 sm:pt-2">
                  <span className="text-base sm:text-2xl font-black text-yellow-300">{b.offer}</span>
                  <button
                    onClick={() => {
                      const target = document.getElementById('catalog');
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-accent text-white font-bold text-[10px] sm:text-xs px-4 py-2 shadow hover:bg-accent-dark transition-all rounded-sm"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
              
              <div className="hidden sm:block h-full w-1/3 md:w-1/2 relative overflow-hidden">
                <img
                  src={b.image}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-md opacity-90 object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/10" />
              </div>
            </div>
          ))}
          
          {/* Banner Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBanner(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentBanner === idx ? 'bg-white w-4' : 'bg-white/40 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Compact Trust Badges Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/60 rounded-sm shadow-sm py-4 px-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x divide-slate-100 dark:divide-slate-800">
          {[
            { title: 'Free Express Delivery', desc: 'On orders over ₹499', icon: <Truck size={18} className="text-primary" /> },
            { title: 'Secure Payment', desc: '100% Encrypted & Safe', icon: <ShieldCheck size={18} className="text-green-600" /> },
            { title: 'Easy Returns', desc: '7-day replacement policy', icon: <RotateCcw size={18} className="text-orange-600" /> },
            { title: '100% Original', desc: 'Certified authentic brands', icon: <Sparkles size={18} className="text-purple-650" /> }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-3 px-2">
              <div className="p-2 bg-slate-50 dark:bg-slate-905 rounded-full flex-shrink-0">
                {badge.icon}
              </div>
              <div className="text-left">
                <h5 className="text-[11px] font-black text-slate-800 dark:text-text-dark leading-tight">{badge.title}</h5>
                <p className="text-[9px] text-slate-400 dark:text-slate-405 font-semibold mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- 10 REVOLUTIONARY USP FEATURES DASHBOARD --- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="glassmorphism p-6 sm:p-8 rounded-2xl border border-white/20 dark:border-slate-800/80 shadow-2xl space-y-6 text-left relative overflow-hidden bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-850/50">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/5 dark:bg-accent/20 px-2.5 py-1 rounded-full">Exclusive Features</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="text-amber-500 animate-spin" size={20} /> Next-Gen Shopping Hub
              </h2>
            </div>
            {/* Student Mode Switcher */}
            <label className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800 cursor-pointer select-none hover:shadow-sm transition-shadow">
              <input
                type="checkbox"
                checked={studentModeActive}
                onChange={(e) => {
                  setStudentModeActive(e.target.checked);
                  showToast(e.target.checked ? "🎓 Student Mode Active! Flat 15% extra discount applied." : "Student Mode deactivated.");
                }}
                className="h-4 w-4 rounded text-primary focus:ring-primary/40"
              />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                🎓 Student Mode <span className="text-[9px] font-extrabold text-[#388e3c] bg-green-50 dark:bg-green-950/40 px-1.5 py-0.5 rounded">Flat 15% OFF</span>
              </span>
            </label>
          </div>

          {/* Feature Tabs selection bar */}
          <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200/30 dark:border-slate-800/30 no-scrollbar">
            {NEXT_GEN_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setUspTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border ${
                  uspTab === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                    : 'bg-white/60 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Tab Panes */}
          <div className="py-2 min-h-[160px]">
            {/* Tab 1: AI Shopping Copilot */}
            {uspTab === 'copilot' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">AI Shopping Copilot</h4>
                  <p className="text-[11px] text-slate-450">Describe your shopping need, and let the AI instantly recommend the perfect product matching.</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleCopilotSearch(); }} className="flex gap-2">
                  <input
                    type="text"
                    placeholder='Try: "I need a laptop under ₹60,000 for coding" or "running shoes"'
                    value={copilotQuery}
                    onChange={(e) => setCopilotQuery(e.target.value)}
                    className="flex-grow px-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors shadow-md"
                  >
                    Ask Copilot
                  </button>
                </form>

                {/* Copilot Results */}
                {copilotResults.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">AI Top Recommendations</span>
                      <button
                        onClick={() => addBundleToCart(copilotResults)}
                        className="text-[10px] font-black text-primary hover:underline uppercase"
                      >
                        ⚡ Add All to Cart
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {copilotResults.map(p => (
                        <div key={p.id} className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 flex gap-3 items-center hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-sm flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                            <img 
                              src={getProductImage(p.name, p.category, p.image)} 
                              alt={p.name} 
                              className="max-h-full max-w-full object-contain" 
                              onError={(e) => {
                                e.target.src = getProductImage(p.name, p.category, null, true);
                              }}
                            />
                          </div>
                          <div className="text-left">
                            <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1">{p.name}</h5>
                            <span className="text-[10px] font-black text-slate-900 dark:text-white">₹{p.price.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Smart Budget Builder */}
            {uspTab === 'budget' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Smart Budget Builder</h4>
                  <p className="text-[11px] text-slate-450">Enter your target budget, and our AI will pack a matching bundle from our catalog without exceeding your limit.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Target Budget (₹):</span>
                    <input
                      type="number"
                      value={budgetLimit}
                      onChange={(e) => handleBudgetChange(e.target.value)}
                      className="w-32 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                  {budgetBundle.length > 0 && (
                    <div className="text-xs font-bold">
                      Bundle Cost: <span className="text-green-700 dark:text-green-400">₹{budgetTotal.toLocaleString('en-IN')}</span> / ₹{parseFloat(budgetLimit).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                {/* Budget results */}
                {budgetBundle.length > 0 ? (
                  <div className="space-y-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-450">Suggested Bundle Packages</span>
                      <button
                        onClick={() => addBundleToCart(budgetBundle)}
                        className="bg-green-700 hover:bg-green-800 text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-md uppercase tracking-wider"
                      >
                        🛒 Buy Complete Bundle
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {budgetBundle.map(p => (
                        <div key={p.id} className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-center space-y-2 relative">
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-black text-slate-455 uppercase">₹{p.price.toLocaleString('en-IN')}</span>
                          <div className="w-12 h-12 mx-auto bg-slate-50 dark:bg-slate-800 rounded-sm flex items-center justify-center p-1 overflow-hidden">
                            <img 
                              src={getProductImage(p.name, p.category, p.image)} 
                              alt={p.name} 
                              className="max-h-full max-w-full object-contain" 
                              onError={(e) => {
                                e.target.src = getProductImage(p.name, p.category, null, true);
                              }}
                            />
                          </div>
                          <h5 className="text-[10px] font-extrabold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight">{p.name}</h5>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Enter a larger budget (e.g. ₹2,000 or ₹20,000) to find matching product bundles.</div>
                )}
              </div>
            )}

            {/* Tab 3: Mood-Based Shopping */}
            {uspTab === 'mood' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Mood-Based Shopping</h4>
                  <p className="text-[11px] text-slate-450">Tell us how you are feeling, and we will filter the catalog and recommendation list to fit your mood!</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map(m => (
                    <button
                      key={m.mood}
                      onClick={() => {
                        setSelectedMood(selectedMood === m.mood ? '' : m.mood);
                        showToast(selectedMood === m.mood ? "Mood filter cleared." : `Filtering items for: ${m.label}`);
                      }}
                      className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all ${
                        selectedMood === m.mood
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-305 hover:border-slate-350'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                {selectedMood && (
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl inline-block">
                    ⚡ Currently showing products tailored to your selected mood. Click the active button again to clear the filter.
                  </p>
                )}

                {/* Mood Recommendations Showcase */}
                {selectedMood && moodResults.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black uppercase tracking-wider text-slate-450">Recommended products for your mood</span>
                      <button
                        onClick={() => addBundleToCart(moodResults)}
                        className="text-[10px] font-black text-primary hover:underline uppercase"
                      >
                        ⚡ Add All to Cart
                      </button>
                    </div>
                    {moodLoading ? (
                      <div className="text-xs text-slate-450">Loading recommendations...</div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {moodResults.map(p => (
                          <div key={p.id} className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 text-center space-y-2 relative flex flex-col justify-between">
                            <div>
                              <span className="absolute top-1.5 right-1.5 text-[9px] font-black text-slate-455 uppercase">₹{p.price.toLocaleString('en-IN')}</span>
                              <div className="w-12 h-12 mx-auto bg-slate-50 dark:bg-slate-800 rounded-sm flex items-center justify-center p-1 overflow-hidden">
                                <img 
                                  src={getProductImage(p.name, p.category, p.image)} 
                                  alt={p.name} 
                                  className="max-h-full max-w-full object-contain" 
                                  onError={(e) => {
                                    e.target.src = getProductImage(p.name, p.category, null, true);
                                  }}
                                />
                              </div>
                              <h5 className="text-[10px] font-extrabold text-slate-800 dark:text-slate-105 line-clamp-2 leading-tight mt-1">{p.name}</h5>
                            </div>
                            <button
                              onClick={(e) => handleAddToCart(p.id, p.name, e)}
                              className="w-full bg-primary hover:bg-primary-light text-white text-[9px] font-black py-1 rounded-lg transition-colors mt-1 uppercase"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Shop with Friends */}
            {uspTab === 'group' && (
              <div className="space-y-4">
                <div className="space-y-1 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Shop with Friends (Group Carts)</h4>
                    <p className="text-[11px] text-slate-450">Collaborate on purchases with friends. Share links, vote on options, and build group consensus before placing orders.</p>
                  </div>
                  <button
                    onClick={() => {
                      if (groupSessionActive) {
                        setGroupSessionActive(false);
                        localStorage.removeItem('sentara_group_id');
                        showToast("Friend group session closed.");
                      } else {
                        handleStartGroupSession();
                      }
                    }}
                    className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all border ${
                      groupSessionActive
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'bg-primary border-primary text-white shadow-md hover:bg-primary-light'
                    }`}
                  >
                    {groupSessionActive ? 'Close Session' : 'Start Group Session'}
                  </button>
                </div>

                {groupSessionActive ? (
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-905 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                      <span>👥 Active Friends Session: Group #1428</span>
                      <span className="text-[#388e3c]">● 4 members active</span>
                    </div>
                    
                    {/* Share Invitation URL */}
                    <div className="flex gap-2 items-center bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-450 font-mono text-[9px] select-all flex-grow">http://sentara.in/join-group-session?id=group_1428_secure</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("http://sentara.in/join-group-session?id=group_1428_secure");
                          showToast("Group link copied to clipboard! 👥");
                        }}
                        className="text-[9px] font-black uppercase tracking-wider text-accent hover:underline"
                      >
                        Copy Link
                      </button>
                    </div>

                    {/* Group product list with up/down votes */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                      <span className="block font-black text-slate-500 text-[10px] uppercase">Vote on group suggestions</span>
                      {groupCart.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/60 shadow-sm">
                          <div className="text-left font-bold text-slate-800 dark:text-slate-200">
                            {item.name}
                            <span className="block text-[10px] font-black text-slate-450">₹{item.price.toLocaleString('en-IN')}</span>
                          </div>
                          
                          {/* Up/Down buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleGroupVote(item.id, 'up')}
                              className={`px-3 py-1 rounded-full font-bold text-[10px] flex items-center gap-1.5 transition-all ${
                                item.voted === 'up'
                                  ? 'bg-green-700 text-white'
                                  : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20'
                              }`}
                            >
                              👍 {item.votes.up}
                            </button>
                            <button
                              onClick={() => handleGroupVote(item.id, 'down')}
                              className={`px-3 py-1 rounded-full font-bold text-[10px] flex items-center gap-1.5 transition-all ${
                                item.voted === 'down'
                                  ? 'bg-red-650 text-white'
                                  : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20'
                              }`}
                            >
                              👎 {item.votes.down}
                            </button>
                            <button
                              onClick={async () => {
                                await addToCart(item.id, 1);
                                showToast(`Group consensus reached! Added ${item.name} to cart.`);
                              }}
                              className="bg-accent hover:bg-accent-dark text-white px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider transition-colors ml-2"
                            >
                              Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center border border-dashed border-slate-250 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                    Start a session to invite friends, bundle orders together, and vote on items.
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Goal-Based Shopping */}
            {uspTab === 'goal' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Goal-Based Shopping</h4>
                  <p className="text-[11px] text-slate-450">Tell us what milestone you are chasing, and we will package a complete shopping set to help you reach it.</p>
                </div>
                <div className="flex gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => handleGoalSelect(g.id)}
                      className={`px-4 py-2 border text-xs font-bold rounded-xl transition-all ${
                        selectedGoal === g.id
                          ? 'bg-primary border-primary text-white shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-305 hover:border-slate-350'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                {/* Display Goal bundle checklist */}
                {selectedGoal && goalBundle.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black uppercase tracking-wider text-slate-450">Milestone Shopping Set Checklist</span>
                      <button
                        onClick={() => addBundleToCart(goalBundle)}
                        className="text-[10px] font-black text-primary hover:underline uppercase"
                      >
                        ⚡ Add All to Cart
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {goalBundle.map(p => (
                        <div key={p.id} className="bg-white/80 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-slate-50 dark:bg-slate-800 rounded-sm flex items-center justify-center p-1 overflow-hidden">
                              <img 
                                src={getProductImage(p.name, p.category, p.image)} 
                                alt={p.name} 
                                className="max-h-full max-w-full object-contain" 
                                onError={(e) => {
                                  e.target.src = getProductImage(p.name, p.category, null, true);
                                }}
                              />
                            </div>
                            <div className="text-left">
                              <h5 className="text-[10px] font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1 leading-snug">{p.name}</h5>
                              <span className="text-[9px] font-black text-slate-500">₹{p.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <span className="text-xs text-[#388e3c] font-black">✓ Recommended</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Earn Points via Referral */}
            {uspTab === 'rewards' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Redeem Referral Code</h4>
                  <p className="text-[11px] text-slate-450">Got a referral invite from a friend? Input their code below to instantly earn +100 Loyalty Points for your account!</p>
                </div>
                <form onSubmit={handleClaimReferral} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Enter invite code (e.g. SENTARA100, REFF99)"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    className="flex-grow px-4 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    className="bg-accent hover:bg-accent-dark text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors shadow-md"
                  >
                    Claim Points
                  </button>
                </form>
                <div className="flex gap-4 pt-2 border-t border-slate-200/35 dark:border-slate-800/35 text-xs text-slate-500">
                  <p>🛍️ <strong>Every Purchase:</strong> +10 Pts</p>
                  <p>📝 <strong>Submit Reviews:</strong> +15 Pts</p>
                  <p>👥 <strong>Share Invites:</strong> +50 Pts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* 4. DEAL OF THE DAY (COUNTDOWN TIMER) - Flipkart style bright orange-red */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 dark:from-orange-600 dark:via-red-600 dark:to-pink-700 text-white p-5 sm:p-8 relative overflow-hidden border-0 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-yellow-400/20 filter blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-0 w-72 h-72 rounded-full bg-pink-300/20 filter blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 rounded-full bg-orange-300/10 filter blur-2xl pointer-events-none" />

          {/* Left panel: Countdown */}
          <div className="space-y-6 text-left max-w-md z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-orange-100 bg-white/20 px-4 py-1.5 rounded-full border border-white/30 animate-pulse backdrop-blur-sm">
              <Flame size={12} className="text-yellow-200" /> ⚡ LIVE FLASH SALE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              Deal of the Day
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 font-medium leading-relaxed">
              Grab premium tech & accessories at unbeatable prices. Limited time only!
            </p>

            {/* Timers */}
            <div className="flex items-center gap-3 font-mono">
              {[
                { label: 'Hrs', val: timeLeft.hours },
                { label: 'Min', val: timeLeft.minutes },
                { label: 'Sec', val: timeLeft.seconds }
              ].map((t, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="h-14 w-14 bg-white rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-black text-orange-600 shadow-lg relative group overflow-hidden border-2 border-orange-100">
                    <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {String(t.val).padStart(2, '0')}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-orange-100 mt-1.5">{t.label}</span>
                </div>
              ))}
              {[0, 1].map(i => (
                <span key={i} className="text-2xl font-black text-orange-200 mb-4">:</span>
              ))}
            </div>
          </div>

          {/* Right panel: Special product showcase */}
          <div className="group w-full max-w-sm bg-white p-4 rounded-sm z-10 flex gap-4 items-center hover:shadow-2xl transition-all duration-300 shadow-lg">
            <div className="h-24 w-24 bg-orange-50 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0 overflow-hidden border border-orange-100">
              <img
                src={getProductImage("Sony WH-1000XM5 Wireless Headphones", "Electronics")}
                alt="Sony Headphones"
                loading="lazy"
                className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = getProductImage(null, "Electronics", null, true);
                }}
              />
            </div>
            <div className="flex-grow space-y-1.5 text-left">
              <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">⭐ Premium Sound</span>
              <h4 className="font-extrabold text-sm text-slate-800 line-clamp-1">Sony WH-1000XM5</h4>
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-sm font-black text-slate-900">₹24,990</span>
                <span className="text-xs text-slate-400 line-through">₹34,990</span>
                <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">29% OFF</span>
              </div>
              <button
                onClick={() => navigate('/product/p002')}
                className="w-full text-center py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xs rounded-lg transition-all mt-2 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                Claim Deal Now →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. TRENDING PRODUCTS (CAROUSEL) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
              <TrendingUp size={12} /> Hot Picks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-text-dark">Trending Now</h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">Swipe or scroll horizontally</span>
        </div>

        {/* Carousel Container — scrollbar hidden, scroll/swipe still works */}
        <div className="overflow-x-auto pb-2 flex gap-6 no-scrollbar cursor-grab active:cursor-grabbing">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="w-72 flex-shrink-0"><ProductSkeleton /></div>)
          ) : (
            products.slice(0, 5).map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="group w-72 flex-shrink-0 bg-white dark:bg-card-dark rounded-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-soft cursor-pointer relative"
              >
                {/* Heart Wishlist */}
                <button
                  onClick={(e) => handleWishlistToggle(product.id, product.name, e)}
                  className={`absolute top-3 right-3 z-20 p-2 rounded-full border shadow-sm backdrop-blur-md transition-colors ${
                    isInWishlist(product.id)
                      ? 'bg-red-50/90 dark:bg-red-950/80 border-red-200/50 text-red-500'
                      : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/30 text-slate-400 hover:text-red-500'
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart size={12} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>

                {product.badge && product.badge !== 'Best Seller' && (
                  <span className="absolute top-3 left-3 z-10 text-[8px] font-extrabold uppercase tracking-wider text-white bg-accent px-2 py-0.5 rounded-full">
                    {product.badge}
                  </span>
                )}
                
                {/* Image */}
                <div className="w-full h-52 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={getProductImage(product.name, product.category, product.image)}
                    alt={product.name}
                    loading="lazy"
                    className="h-44 w-44 object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = getProductImage(product.name, product.category, null, true);
                    }}
                  />
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    <span>{product.category}</span>
                    <div className="flex items-center gap-0.5 text-warning font-bold">
                      ★ <span>{product.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-extrabold text-xs text-slate-800 dark:text-text-dark line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-xs font-black text-slate-800 dark:text-text-dark">₹{product.price.toLocaleString('en-IN')}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleAddToCart(product.id, product.name, e)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white hover:bg-black dark:hover:bg-slate-700 rounded-sm text-[10px] font-extrabold uppercase tracking-wider transition-colors shadow-sm active:scale-[0.97]"
                        aria-label="Add to Cart"
                      >
                        <ShoppingBag size={10} strokeWidth={3} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* 6. MAIN CATALOG SHOWCASE (WITH FILTERS) */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-2 border-b border-slate-200/20">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-1">
              <Flame size={12} fill="currentColor" /> Curated Catalog
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-text-dark">Featured Products</h2>
          </div>
          
          {/* Mobile Filter Toggle Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-205 dark:border-slate-800 rounded-sm text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 transition-colors uppercase tracking-wider"
          >
            <span>⚙️ {showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-card-dark border border-slate-205 dark:border-slate-800 rounded-sm sticky top-24 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm text-left">
              
              {/* Header */}
              <div className="flex justify-between items-center p-4">
                <span className="text-xs font-extrabold text-slate-800 dark:text-text-dark uppercase tracking-wider">Filters</span>
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-extrabold text-primary hover:underline uppercase"
                >
                  Clear All
                </button>
              </div>

              {/* Sort selector */}
              <div className="p-4 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none"
                >
                  <option value="rating">Popularity</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              {/* Categories Section */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Categories</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Beauty'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                      className={`w-full text-left text-xs py-1 transition-colors flex items-center justify-between ${
                        activeCategory === cat 
                          ? 'text-primary font-bold' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      <span>{cat}</span>
                      {activeCategory === cat && <span className="text-[9px] font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Section */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Brand</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {['Samsung', 'Apple', 'Sony', 'OnePlus', 'Boat', 'Levi\'s', 'Mi', 'Philips', 'Dyson'].map(brand => {
                    const isChecked = activeBrand === brand;
                    return (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => setActiveBrand(isChecked ? '' : brand)}
                          className="h-3.5 w-3.5 rounded-sm border-slate-300 text-primary focus:ring-primary/45"
                        />
                        <span className={`text-xs font-semibold ${
                          isChecked ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {brand}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price filter input */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Price Range (₹)</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-250 rounded-sm text-xs focus:outline-none placeholder-slate-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-250 rounded-sm text-xs focus:outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Customer Ratings */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Customer Ratings</span>
                <div className="space-y-2">
                  {[4, 3].map(stars => {
                    const isChecked = rating === String(stars);
                    return (
                      <label key={stars} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="rating_filter"
                          checked={isChecked}
                          onChange={() => setRating(isChecked ? '' : String(stars))}
                          onClick={() => {
                            if (isChecked) setRating('');
                          }}
                          className="h-3.5 w-3.5 border-slate-300 text-primary focus:ring-primary/45"
                        />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          {stars}★ & above
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Discount Section */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Discount</span>
                <div className="space-y-2">
                  {['10', '30', '50'].map(disc => {
                    const isChecked = minDiscount === disc;
                    return (
                      <label key={disc} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="discount_filter"
                          checked={isChecked}
                          onChange={() => setMinDiscount(disc)}
                          onClick={() => {
                            if (isChecked) setMinDiscount('');
                          }}
                          className="h-3.5 w-3.5 border-slate-300 text-primary focus:ring-primary/45"
                        />
                        <span className="text-xs font-semibold text-slate-650 dark:text-slate-400">
                          {disc}% or more
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Availability Section */}
              <div className="p-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="h-3.5 w-3.5 rounded-sm border-slate-300 text-primary focus:ring-primary/45"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-305">
                    Exclude Out of Stock
                  </span>
                </label>
              </div>

            </div>
          </div>

          {/* Product Cards List */}
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-left">
                <span className="text-2xl">🔎</span>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">No matching products found</h4>
                <p className="text-[11px] text-slate-400 mt-1">Try modifying your filter categories or price range limits.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -4, boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.1)' }}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="group flex flex-col bg-white dark:bg-card-dark rounded-sm border border-slate-200/60 dark:border-slate-800/80 overflow-hidden cursor-pointer relative transition-all duration-300"
                    >
                      {/* Heart Wishlist */}
                      <button
                        onClick={(e) => handleWishlistToggle(product.id, product.name, e)}
                        className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full border shadow-sm backdrop-blur-md transition-colors ${
                          isInWishlist(product.id)
                            ? 'bg-red-50/90 dark:bg-red-950/80 border-red-200/50 text-red-500'
                            : 'bg-white/90 dark:bg-slate-900/80 border-slate-200/30 text-slate-400 hover:text-red-500'
                        }`}
                        aria-label="Toggle Wishlist"
                      >
                        <Heart size={13} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                      </button>

                      {/* Badge */}
                      {product.badge && product.badge !== 'Best Seller' && (
                        <span className="absolute top-2.5 left-2.5 z-10 text-[8px] font-bold uppercase tracking-wider text-white bg-accent px-2 py-0.5 rounded-sm shadow-sm">
                          {product.badge}
                        </span>
                      )}

                      {/* Image container - strict fixed height, inline style guarantees consistency across all browsers */}
                      <div
                        className="w-full bg-white dark:bg-slate-900/10 overflow-hidden flex items-center justify-center relative border-b border-slate-100 dark:border-slate-800/60"
                        style={{ height: '200px', minHeight: '200px', maxHeight: '200px' }}
                      >
                        <img
                          src={getProductImage(product.name, product.category, product.image)}
                          alt={product.name}
                          loading="lazy"
                          style={{ width: '168px', height: '168px', objectFit: 'contain', flexShrink: 0 }}
                          className="group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = getProductImage(product.name, product.category, null, true);
                          }}
                        />
                      </div>

                      {/* Details */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-left">
                        <div className="space-y-1">
                          {/* Brand Label */}
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {getProductBrand(product.name)}
                          </span>
                          
                          {/* Name */}
                          <h3 className="font-semibold text-xs text-slate-800 dark:text-text-dark leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer min-h-[2.5rem]">
                            {product.name}
                          </h3>
                          
                          {/* Rating Pill & fAssured */}
                          <div className="flex items-center gap-1.5 pt-0.5 select-none flex-wrap">
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-white bg-[#388e3c] px-1.5 py-0.5 rounded-sm">
                              {product.rating} <Star size={8} fill="currentColor" className="text-white" />
                            </span>
                            <span className="text-[10px] text-slate-450 font-bold">({product.reviews?.toLocaleString() || '1,200'})</span>
                            <span className="inline-flex items-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider leading-none">
                              Certified
                            </span>
                            <button
                              onClick={(e) => handleToggleCompare(product, e)}
                              className={`text-[8.5px] font-black uppercase px-2 py-0.5 border rounded-sm transition-all ${
                                compareList.find(c => c.id === product.id)
                                  ? 'bg-primary text-white border-primary'
                                  : 'border-slate-350 dark:border-slate-700 text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              {compareList.find(c => c.id === product.id) ? '✓ Comparing' : '+ Compare'}
                            </button>
                          </div>
                        </div>

                        {/* Pricing details & delivery */}
                        <div className="flex flex-col gap-0.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-text-dark">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.discount > 0 && (
                              <>
                                <span className="text-[10px] text-slate-450 line-through">
                                  ₹{product.originalPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] font-semibold text-[#388e3c]">
                                  {product.discount}% off
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-[10px] text-[#388e3c] font-bold">Free delivery</div>
                        </div>

                        {/* Add to Cart + Buy Now Buttons */}
                        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleAddToCart(product.id, product.name, e)}
                            disabled={!product.inStock}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-extrabold uppercase tracking-wide rounded-sm transition-all border ${
                              product.inStock
                                ? 'bg-secondary hover:bg-secondary-dark text-primary border border-secondary/50 shadow-sm hover:shadow-md active:scale-95'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingBag size={11} strokeWidth={3} />
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </button>
                          {product.inStock && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleAddToCart(product.id, product.name, e);
                                navigate('/checkout');
                              }}
                              className="flex-1 flex items-center justify-center py-2.5 text-[10px] font-extrabold uppercase tracking-wide rounded-sm bg-accent hover:bg-accent-dark text-white border border-accent shadow-sm hover:shadow-md active:scale-95 transition-all"
                            >
                              Buy Now
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-6">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-400 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-650 dark:text-slate-400 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </section>

      {/* 7. STATISTICS SECTION (ANIMATED COUNTER) */}
      <section ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glassmorphism p-6 sm:p-8 rounded-sm border border-slate-200/50 dark:border-slate-800/50 grid grid-cols-1 md:grid-cols-3 gap-4 text-center relative overflow-hidden shadow-soft">
          {[
            {
              id: 'customers',
              targetVal: stats.customers,
              label: 'Verified Shoppers',
              suffix: '+',
              icon: <Award className="text-primary mx-auto mb-2" size={24} />
            },
            {
              id: 'orders',
              targetVal: stats.orders,
              label: 'Orders Processed',
              suffix: '+',
              icon: <ShoppingBag className="text-accent mx-auto mb-2" size={24} />
            },
            {
              id: 'cities',
              targetVal: stats.cities,
              label: 'Cities Covered',
              suffix: '+',
              icon: <Truck className="text-secondary mx-auto mb-2" size={24} />
            }
          ].map((stat) => (
            <div key={stat.id} className="space-y-1 z-10">
              {stat.icon}
              <h3 className="text-3xl font-black text-slate-850 dark:text-text-dark tracking-tight">
                {stat.targetVal.toLocaleString('en-IN')}{stat.suffix}
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. BRAND LOGOS LOOP CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <h3 className="text-[10px] font-bold text-center text-slate-500 dark:text-slate-400 uppercase tracking-widest">Trusted Brand Partnerships</h3>
        
        {/* Brand row */}
        <div className="relative overflow-hidden py-3 bg-white dark:bg-card-dark border border-slate-200/70 dark:border-slate-800/50 rounded-sm shadow-soft">
          <div className="flex justify-around gap-6 items-center flex-wrap px-6">
            {BRAND_PARTNERSHIPS.map((brand, idx) => (
              <span 
                key={brand} 
                className="font-black tracking-widest text-xs text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary-light transition-all hover:scale-110 cursor-pointer duration-200"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS SLIDER SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Testimonials</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-text-dark">Loved by Shoppers</h2>
        </div>

        <div className="glassmorphism p-5 rounded-sm border border-slate-250/50 dark:border-slate-800/50 text-center relative shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Stars */}
              <div className="flex justify-center gap-0.5 text-warning">
                {[...Array(testimonials[currentTestimonial].stars)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" className="border-none" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">
                "{testimonials[currentTestimonial].quote}"
              </p>

              {/* Author Info */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-extrabold text-xs flex items-center justify-center">
                  {testimonials[currentTestimonial].avatar}
                </div>
                <span className="text-xs font-extrabold text-slate-800 dark:text-text-dark">
                  {testimonials[currentTestimonial].name}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {testimonials[currentTestimonial].role}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 pt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  currentTestimonial === idx ? 'bg-primary w-4' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER SIGNUP PANEL - Flipkart style bright blue */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-sm bg-gradient-to-br from-blue-600 via-indigo-600 to-primary p-6 sm:p-10 text-center space-y-4 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-52 h-52 rounded-full bg-blue-400/20 filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-indigo-400/20 filter blur-3xl pointer-events-none" />
          
          <div className="max-w-xl mx-auto space-y-4 z-10 relative">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-100 bg-white/20 px-4 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">
              <Mail size={12} /> Stay Updated & Save
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Get Flat 10% Off — Right Now!
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-semibold leading-relaxed">
              Join 50,000+ shoppers. Get early access to sales, exclusive coupons & new arrivals.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-grow px-4 py-3 rounded-full border border-white/20 bg-white/95 dark:bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-slate-400 shadow-sm"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex-shrink-0"
              >
                Subscribe & Save 🎉
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- Recently Viewed Section --- */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Your Browse History</span>
            <h3 className="text-lg font-black text-slate-850 dark:text-white">Recently Viewed Products</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {recentlyViewed.map(p => (
              <div
                key={`recent-${p.id}`}
                onClick={() => navigate(`/product/${p.id}`)}
                className="group w-48 flex-shrink-0 bg-white dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm hover:shadow-md cursor-pointer transition-shadow text-left space-y-2"
              >
                <div className="w-full h-24 bg-slate-50 dark:bg-slate-950/20 flex items-center justify-center p-2 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                  <img 
                    src={getProductImage(p.name, p.category, p.image)} 
                    alt={p.name} 
                    className="max-h-full max-w-full object-contain" 
                    onError={(e) => {
                      e.target.src = getProductImage(p.name, p.category, null, true);
                    }}
                  />
                </div>
                <h5 className="text-[10.5px] font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1">{p.name}</h5>
                <span className="text-xs font-black text-slate-900 dark:text-white">₹{p.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- Product Compare Drawer Overlay --- */}
      <ProductCompare
        selectedProducts={compareList}
        onRemove={(id) => setCompareList(prev => prev.filter(p => p.id !== id))}
        onClose={() => setCompareList([])}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
