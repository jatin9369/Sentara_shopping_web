import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import { getProductImage } from '../utils/imageMapper';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Loader2, 
  ShieldCheck,
  Heart,
  ShoppingCart,
  Star
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Subtab switching state: 'settings', 'addresses', 'wishlist'
  const [activeSubTab, setActiveSubTab] = useState(() => {
    return location.state?.openWishlist ? 'wishlist' : 'settings';
  });

  // Profile Form States
  const [name, setName] = useState(() => user?.name || '');
  const [email, setEmail] = useState(() => user?.email || '');
  const [prevUserForForm, setPrevUserForForm] = useState(user);
  if (user !== prevUserForForm) {
    setPrevUserForForm(user);
    setName(user?.name || '');
    setEmail(user?.email || '');
  }
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Form State for Adding / Editing Address
  const [showAddForm, setShowAddForm] = useState(false);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrName, setAddrName] = useState('');
  const [addrMobile, setAddrMobile] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Wishlist Products State
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadAddresses = React.useCallback(async () => {
    await Promise.resolve();
    setAddressesLoading(true);
    try {
      const data = await api.user.getAddresses();
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  const loadWishlistProducts = React.useCallback(async () => {
    await Promise.resolve();
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setWishlistLoading(true);
    try {
      // Fetch products and filter those in user's wishlist
      const data = await api.products.list({ limit: 100 });
      if (data.success) {
        const filtered = data.products.filter(p => wishlist.includes(p.id));
        setWishlistProducts(filtered);
      }
    } catch (err) {
      console.error('Failed to load wishlist products:', err);
    } finally {
      setWishlistLoading(false);
    }
  }, [wishlist]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      const timer = setTimeout(() => {
        loadAddresses();
      }, 0);
      return () => clearTimeout(timer);
    }

    // Clear navigation state if auto-toggled to wishlist
    if (location.state?.openWishlist) {
      window.history.replaceState({}, document.title);
    }
  }, [user, authLoading, location.state, loadAddresses, navigate]);

  // Load wishlist products when active tab changes
  useEffect(() => {
    if (activeSubTab === 'wishlist' && user) {
      const timer = setTimeout(() => {
        loadWishlistProducts();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeSubTab, wishlist, user, loadWishlistProducts]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const data = await updateProfile(name, email);
      if (data.success) {
        setProfileEditing(false);
        showToast('Profile updated successfully!');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressError('');

    if (!addrName || !addrMobile || !addrLine1 || !addrCity || !addrState || !addrPincode) {
      setAddressError('Please fill in all required fields');
      return;
    }

    if (!/^\d{10}$/.test(addrMobile)) {
      setAddressError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!/^\d{6}$/.test(addrPincode)) {
      setAddressError('Please enter a valid 6-digit PIN code');
      return;
    }

    const payload = {
      label: addrLabel,
      name: addrName,
      mobile: addrMobile,
      line1: addrLine1,
      line2: addrLine2,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      isDefault: addrIsDefault
    };

    try {
      let data;
      if (editingAddressId) {
        data = await api.user.updateAddress(editingAddressId, payload);
      } else {
        data = await api.user.addAddress(payload);
      }

      if (data.success) {
        setAddresses(data.addresses);
        resetAddressForm();
        showToast(editingAddressId ? 'Address updated!' : 'Address added!');
      }
    } catch (err) {
      setAddressError(err.message || 'Failed to save address');
    }
  };

  const handleEditAddressInit = (addr) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label);
    setAddrName(addr.name);
    setAddrMobile(addr.mobile);
    setAddrLine1(addr.line1);
    setAddrLine2(addr.line2 || '');
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrIsDefault(addr.isDefault);
    setShowAddForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const data = await api.user.deleteAddress(id);
      if (data.success) {
        setAddresses(data.addresses);
        showToast('Address deleted!');
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
      showToast('Failed to delete address');
    }
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setShowAddForm(false);
    setAddrLabel('Home');
    setAddrName('');
    setAddrMobile('');
    setAddrLine1('');
    setAddrLine2('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddrIsDefault(false);
    setAddressError('');
  };

  const handleRemoveFromWishlist = (productId, name, e) => {
    e.stopPropagation();
    try {
      toggleWishlist(productId);
      showToast(`Removed ${name} from Wishlist`);
    } catch (err) {
      showToast(err.message || 'Failed to toggle wishlist');
    }
  };

  const handleAddToCartFromWishlist = async (productId, name, e) => {
    e.stopPropagation();
    try {
      await addToCart(productId, 1);
      showToast(`Added ${name} to your cart! 🛒`);
    } catch (err) {
      showToast(err.message || 'Failed to add item');
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <span className="text-sm font-medium text-slate-500">Checking session...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 transition-colors duration-300">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 text-xs sm:text-sm font-bold text-slate-400">
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`pb-3.5 px-2.5 border-b-2 transition-all ${
            activeSubTab === 'settings'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Account Settings
        </button>
        <button
          onClick={() => setActiveSubTab('addresses')}
          className={`pb-3.5 px-2.5 border-b-2 transition-all ${
            activeSubTab === 'addresses'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          Addresses
        </button>
        <button
          onClick={() => setActiveSubTab('wishlist')}
          className={`pb-3.5 px-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
            activeSubTab === 'wishlist'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent hover:text-slate-700 dark:hover:text-slate-350'
          }`}
        >
          <Heart size={14} />
          <span>My Wishlist ({wishlist.length})</span>
        </button>
      </div>

      {/* 1. Account Settings Subtab */}
      {activeSubTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="md:col-span-1">
            <div className="glassmorphism p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center font-extrabold text-xl mb-4 border border-primary/20">
                {user ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>

              {!profileEditing ? (
                <div className="space-y-4 w-full">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 dark:text-text-dark">{user?.name}</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Joined {user ? new Date(user.createdAt).toLocaleDateString('en-IN', {month: 'long', year: 'numeric'}) : ''}</span>
                  </div>

                  <div className="text-left space-y-3.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {user?.mobile && (
                      <div className="flex items-center gap-2.5">
                        <Phone size={15} className="text-slate-400" />
                        <span>+91 {user?.mobile}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5">
                      <Mail size={15} className="text-slate-400" />
                      <span className="truncate">{user?.email || <span className="italic text-slate-400 font-medium">No email added</span>}</span>
                    </div>
                    <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-extrabold text-[10px] border border-amber-500/20">
                        ★
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-800 dark:text-white font-bold">{user?.points || 0} SENTARA Points</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Value: ₹{((user?.points || 0) * 0.1).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setProfileEditing(true)}
                    className="w-full mt-4 flex items-center justify-center gap-1.5 py-2 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Edit3 size={12} />
                    <span>Edit Profile</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="w-full text-left space-y-4">
                  {profileError && (
                    <p className="text-[10px] text-error font-medium">{profileError}</p>
                  )}
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-850 dark:text-slate-255 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileEditing(false);
                        setName(user.name);
                        setEmail(user.email || '');
                        setProfileError('');
                      }}
                      className="flex-1 text-center py-2 px-3 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="flex-1 py-2 px-3 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-1"
                    >
                      <Save size={12} />
                      <span>Save</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            {/* Loyalty Points Card */}
            <div className="p-6 border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 rounded-2xl shadow-soft text-left">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-sm text-amber-700 dark:text-amber-400 uppercase tracking-widest">SENTARA Reward Club</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 font-bold">Earn points and redeem discounts on your purchases</p>
                </div>
                <div className="px-3 py-1 bg-amber-500 text-white font-black text-xs rounded-full shadow-sm">
                  Loyalty Member
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-amber-500/10 mb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">Current Balance</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{user?.points || 0} pts</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500">Cash Value</span>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">₹{((user?.points || 0) * 0.1).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Reward Guidelines</span>
                <ul className="text-xs font-semibold text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                  <li><strong>First Order Completion:</strong> Earn <span className="text-amber-600 dark:text-amber-400 font-extrabold">50 Points</span> (Worth ₹5.00).</li>
                  <li><strong>Subsequent Purchases:</strong> Receive <span className="text-amber-600 dark:text-amber-400 font-extrabold">50 Points</span> per completed order.</li>
                  <li><strong>Redeem Balance:</strong> Spend points at Checkout to get instant discounts (10 Points = ₹1.00).</li>
                </ul>
              </div>
            </div>

            {/* General Info Card */}
            <div className="p-6 border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-card-dark rounded-2xl shadow-soft">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-text-dark mb-2">Platform Member Details</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Your email <strong>{user?.email}</strong> is registered. Your shipping addresses and payment profiles are fully encrypted under standard protocols.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Addresses Subtab */}
      {activeSubTab === 'addresses' && (
        <div className="bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-soft text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-text-dark flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Delivery Address Book
            </h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <Plus size={12} />
                <span>Add New</span>
              </button>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleSaveAddress} className="border border-slate-250 dark:border-slate-800/60 p-4 rounded-xl space-y-4 mb-6">
              <h4 className="text-xs font-bold text-slate-700 dark:text-text-dark">
                {editingAddressId ? 'Update Delivery Address' : 'Add New Delivery Address'}
              </h4>
              
              {addressError && (
                <p className="text-[10px] text-error font-medium">{addressError}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Recipient Name *"
                  required
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="10-digit mobile number *"
                  required
                  value={addrMobile}
                  onChange={(e) => setAddrMobile(e.target.value.replace(/\D/g, '').slice(0,10))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    required
                    value={addrLine1}
                    onChange={(e) => setAddrLine1(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={addrLine2}
                    onChange={(e) => setAddrLine2(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City *"
                  required
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="State *"
                  required
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Pincode *"
                  required
                  value={addrPincode}
                  onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, '').slice(0,6))}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={resetAddressForm}
                  className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold px-3 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white text-[11px] font-bold px-4 py-2 rounded-lg"
                >
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          )}

          {addressesLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-primary" size={20} />
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-400 font-semibold">
              No saved addresses found. Add one above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 border border-slate-200 dark:border-slate-850 rounded-xl relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[9px] font-bold text-success flex items-center gap-0.5">
                          <ShieldCheck size={12} /> Default
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-850 dark:text-text-dark block">
                      {addr.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1 leading-relaxed">
                      {addr.line1}, {addr.line2 && addr.line2 + ', '}{addr.city}, {addr.state} - {addr.pincode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 border-t border-slate-100 dark:border-slate-850/60 pt-2.5">
                    <span className="text-[10px] font-semibold text-slate-400">
                      📞 {addr.mobile}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditAddressInit(addr)}
                        className="p-1 text-slate-400 hover:text-primary transition-colors"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1 text-slate-400 hover:text-error transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Wishlist Subtab */}
      {activeSubTab === 'wishlist' && (
        <div className="bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl shadow-soft text-left space-y-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-text-dark pb-3 border-b border-slate-200 dark:border-slate-800/80 mb-2 flex items-center gap-2">
            <Heart size={18} className="text-primary fill-primary" />
            My Wishlisted Products
          </h3>

          {wishlistLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-3xl block mb-2">❤️</span>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">Your wishlist is empty</h4>
              <p className="text-[11px] text-slate-450 mt-1 max-w-xs mx-auto leading-relaxed">
                Add products to your wishlist by clicking the heart icons on product cards in the home catalog.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 bg-primary hover:bg-primary-dark text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-premium"
              >
                Go Shop Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishlistProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="flex gap-4 border border-slate-200 dark:border-slate-850 p-3 rounded-xl hover:border-primary/20 transition-all cursor-pointer relative group bg-white dark:bg-slate-900/10 shadow-soft"
                >
                  <div className="h-16 w-16 bg-slate-50 dark:bg-slate-900/30 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 border border-slate-200/20">
                    <img
                      src={getProductImage(p.name, p.category, p.image)}
                      alt={p.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = getProductImage(p.name, p.category, null, true);
                      }}
                    />
                  </div>

                  <div className="flex-grow flex flex-col justify-between py-0.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-text-dark line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400">
                        <span>{p.category}</span>
                        <div className="flex items-center gap-0.5 text-warning">
                          ★ <span>{p.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-text-dark">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        {p.discount > 0 && (
                          <span className="text-[9px] font-bold text-success">
                            {p.discount}% OFF
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleRemoveFromWishlist(p.id, p.name, e)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-error hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          title="Remove from Wishlist"
                        >
                          <Trash2 size={13} />
                        </button>
                        <button
                          onClick={(e) => handleAddToCartFromWishlist(p.id, p.name, e)}
                          className="p-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all"
                          title="Add to Cart"
                        >
                          <ShoppingCart size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
