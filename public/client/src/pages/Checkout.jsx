import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductImage } from '../utils/imageMapper';
import { 
  Plus, 
  Loader2, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { cart, subtotal, discount, deliveryFee, total, coupon, clearCart, cartInitialized } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [redeemPoints, setRedeemPoints] = useState(false);

  const availablePoints = user ? (user.points || 0) : 0;

  const pointsDiscount = redeemPoints ? (availablePoints * 0.1) : 0;
  const finalTotal = Math.max(0, subtotal - discount - pointsDiscount + deliveryFee);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(2); // 1: Login, 2: Address, 3: Order Summary, 4: Payment

  // Form state for adding new address
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newLine2, setNewLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newLabel, setNewLabel] = useState('Home');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [formError, setFormError] = useState('');
  const [pincodeAutoFilling, setPincodeAutoFilling] = useState(false);
  const [pincodeAutoMsg, setPincodeAutoMsg] = useState('');

  // Payment form states
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    if (!cartInitialized) return;

    if (cart.length === 0 && !orderCompleted) {
      navigate('/cart');
      return;
    }

    const fetchAddresses = async () => {
      setAddressLoading(true);
      try {
        const data = await api.user.getAddresses();
        if (data.success) {
          setAddresses(data.addresses);
          // Set default address or first address as selected
          const def = data.addresses.find(a => a.isDefault);
          if (def) {
            setSelectedAddress(def);
          } else if (data.addresses.length > 0) {
            setSelectedAddress(data.addresses[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setAddressLoading(false);
      }
    };
    fetchAddresses();
  }, [user, cartInitialized, cart.length, navigate]);

  // Auto-fill city/state from pincode using India Post API
  const handlePincodeChange = async (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setNewPincode(cleaned);
    setPincodeAutoMsg('');
    if (cleaned.length === 6) {
      setPincodeAutoFilling(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        const json = await res.json();
        if (json && json[0] && json[0].Status === 'Success' && json[0].PostOffice?.length > 0) {
          const po = json[0].PostOffice[0];
          setNewCity(po.District);
          setNewState(po.State);
          if (!newLine2) setNewLine2(po.Name); // pre-fill area as line2 if empty
          setPincodeAutoMsg(`✅ ${po.Name}, ${po.District}, ${po.State}`);
          // Also save to localStorage for future use
          localStorage.setItem('sentara_pincode', cleaned);
          localStorage.setItem('sentara_pincode_city', po.District);
          localStorage.setItem('sentara_pincode_state', po.State);
          localStorage.setItem('sentara_pincode_area', po.Name);
        } else {
          setPincodeAutoMsg('❌ Invalid PIN code');
        }
      } catch {
        setPincodeAutoMsg('⚠️ Could not verify PIN code');
      } finally {
        setPincodeAutoFilling(false);
      }
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newName || !newMobile || !newLine1 || !newCity || !newState || !newPincode) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (!/^\d{10}$/.test(newMobile)) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!/^\d{6}$/.test(newPincode)) {
      setFormError('Please enter a valid 6-digit PIN code');
      return;
    }

    try {
      const data = await api.user.addAddress({
        label: newLabel,
        name: newName,
        mobile: newMobile,
        line1: newLine1,
        line2: newLine2,
        city: newCity,
        state: newState,
        pincode: newPincode,
        isDefault: newIsDefault
      });

      if (data.success) {
        setAddresses(data.addresses);
        // Select newly created address
        const added = data.addresses[data.addresses.length - 1];
        setSelectedAddress(added);
        setShowAddForm(false);
        // Clear fields
        setNewName('');
        setNewMobile('');
        setNewLine1('');
        setNewLine2('');
        setNewCity('');
        setNewState('');
        setNewPincode('');
        setNewLabel('Home');
        setNewIsDefault(false);
        showToast('Address added successfully!');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save address');
    }
  };

  // Helper: load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrderInDB = async (addressString, paymentMethodLabel) => {
    const orderData = {
      items: cart.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        color: item.color || null,
        size: item.size || null
      })),
      address: addressString,
      paymentMethod: paymentMethodLabel,
      couponCode: coupon ? coupon.code : null,
      subtotal,
      discount,
      deliveryFee,
      total: finalTotal,
      pointsRedeemed: redeemPoints ? availablePoints : 0
    };
    const res = await api.orders.create(orderData);
    if (res.success && res.newPoints !== undefined) {
      setUser(prev => prev ? { ...prev, points: res.newPoints } : null);
    }
    return res;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      showToast('Please select or add a delivery address');
      return;
    }

    if (paymentMethod === 'Card' && (!cardNo || !cardExpiry || !cardCvv)) {
      showToast('Please fill in card payment details');
      return;
    }

    if (paymentMethod === 'Card' && cardNo.replace(/\s/g, '').length < 16) {
      showToast('Please enter a valid 16-digit card number');
      return;
    }

    if (paymentMethod === 'UPI' && !upiId) {
      showToast('Please enter your UPI ID');
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. name@upi)');
      return;
    }

    const addressString = `${selectedAddress.name}, +91 ${selectedAddress.mobile}\n${selectedAddress.line1}${selectedAddress.line2 ? ', ' + selectedAddress.line2 : ''}\n${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;

    // Cash on Delivery — no payment gateway needed
    if (paymentMethod === 'Cash on Delivery') {
      setLoading(true);
      try {
        const data = await placeOrderInDB(addressString, 'Cash on Delivery');
        if (data.success) {
          setOrderCompleted(true);
          await clearCart();
          navigate('/orders', { state: { orderSuccess: true, placedOrder: data.order } });
        }
      } catch (err) {
        console.error('Failed to create order:', err);
        showToast(err.message || 'Failed to place order');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Online payment via Razorpay (UPI / Card / Net Banking)
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast('Failed to load payment gateway. Placing order in demo mode...');
        const data = await placeOrderInDB(addressString, paymentMethod);
        if (data.success) {
          setOrderCompleted(true);
          await clearCart();
          navigate('/orders', { state: { orderSuccess: true, placedOrder: data.order } });
        }
        setLoading(false);
        return;
      }

      // Create Razorpay order on server
      const amountInPaise = Math.round(finalTotal * 100); // convert ₹ to paise
      let rpOrderData;
      try {
        rpOrderData = await api.payment.createOrder(amountInPaise, `order_${Date.now()}`);
      } catch (err) {
        // If Razorpay keys are not configured, fall through to direct order creation (demo mode)
        const errMsg = (err.message || '').toLowerCase();
        if (errMsg.includes('key') || errMsg.includes('unauthorized') || errMsg.includes('configured') || errMsg.includes('auth')) {
          showToast('Payment gateway not configured. Placing order in demo mode...');
          const data = await placeOrderInDB(addressString, paymentMethod);
          if (data.success) {
            setOrderCompleted(true);
            await clearCart();
            navigate('/orders', { state: { orderSuccess: true, placedOrder: data.order } });
          }
          setLoading(false);
          return;
        }
        throw err;
      }

      setLoading(false); // Let Razorpay modal take over

      const options = {
        key: rpOrderData.keyId,
        amount: rpOrderData.amount,
        currency: rpOrderData.currency || 'INR',
        name: 'SENTARA',
        description: `Order Payment — ${cart.length} item(s)`,
        image: '',
        order_id: rpOrderData.orderId,
        prefill: {
          name: user?.name || '',
          contact: user?.mobile ? `+91${user.mobile}` : '',
          email: user?.email || '',
          ...(paymentMethod === 'UPI' ? { vpa: upiId } : {}),
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled. Your cart is still saved.');
          }
        },
        handler: async (response) => {
          try {
            // Verify payment on server
            await api.payment.verify(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            // Create order record in DB after successful payment
            const orderLabel = `${paymentMethod} (Razorpay: ${response.razorpay_payment_id})`;
            const data = await placeOrderInDB(addressString, orderLabel);
            if (data.success) {
              setOrderCompleted(true);
              await clearCart();
              navigate('/orders', { state: { orderSuccess: true, placedOrder: data.order } });
            }
          } catch (err) {
            console.error('Post-payment order error:', err);
            showToast(err.message || 'Payment received but order creation failed. Contact support.');
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        showToast(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });
      rzp.open();

    } catch (err) {
      console.error('Failed to initiate payment:', err);
      showToast(err.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const itemSavings = cart.reduce((acc, item) => {
    const orig = item.product.originalPrice || item.product.price;
    return acc + (orig - item.product.price) * item.quantity;
  }, 0);
  const totalSavings = itemSavings + discount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 rounded-sm shadow-lg text-sm font-semibold flex items-center gap-2">
          <span>{toastMsg}</span>
        </div>
      )}

      <h1 className="text-xl font-bold text-slate-800 dark:text-text-dark tracking-tight mb-6 flex items-center gap-2">
        <ShoppingBag className="text-primary" size={22} />
        <span>Checkout</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* Left: Stacked Accordion Steps */}
        <div className="lg:col-span-2 space-y-3">
          
          {/* Step 1: LOGIN */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-sm shadow-soft">
            {activeStep === 1 ? (
              <div>
                <div className="bg-primary text-white font-bold py-4 px-6 flex items-center gap-3 text-sm uppercase">
                  <span className="w-5 h-5 flex items-center justify-center bg-white text-primary rounded-full text-xs">1</span>
                  <span>Login</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-405 font-medium">Logged in as</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-text-dark">{user?.name || 'Customer'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">Mobile: +91 {user?.mobile || ''}</p>
                    </div>
                    <button
                      onClick={() => setActiveStep(2)}
                      className="bg-accent hover:bg-accent-dark text-white font-bold py-2 px-6 rounded-sm uppercase text-xs transition-colors"
                    >
                      Continue Checkout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-card-dark py-4 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-sm">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-450 font-bold uppercase select-none">
                  <span className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-black">1</span>
                  <span>Login</span>
                  <span className="text-success text-xs lowercase font-semibold ml-2 select-none">✓ verified</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{user?.name} (+91 {user?.mobile})</span>
                  <button
                    onClick={() => setActiveStep(1)}
                    className="text-primary dark:text-primary-light hover:underline font-bold text-xs uppercase"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: DELIVERY ADDRESS */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-sm shadow-soft">
            {activeStep === 2 ? (
              <div>
                <div className="bg-primary text-white font-bold py-4 px-6 flex items-center gap-3 text-sm uppercase">
                  <span className="w-5 h-5 flex items-center justify-center bg-white text-primary rounded-full text-xs">2</span>
                  <span>Delivery Address</span>
                </div>
                <div className="p-6 space-y-4">
                  {addressLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="animate-spin text-primary" size={20} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.length > 0 ? (
                        <div className="space-y-3">
                          {addresses.map((addr) => (
                            <div
                              key={addr.id}
                              onClick={() => setSelectedAddress(addr)}
                              className={`p-4 border rounded-sm cursor-pointer transition-all flex items-start gap-3 ${
                                selectedAddress?.id === addr.id
                                  ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-primary/20'
                              }`}
                            >
                              <input
                                type="radio"
                                name="selected_address"
                                checked={selectedAddress?.id === addr.id}
                                onChange={() => setSelectedAddress(addr)}
                                className="mt-1 border-slate-350 text-primary focus:ring-primary h-4 w-4"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-slate-850 dark:text-text-dark">
                                    {addr.name}
                                  </span>
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                                    {addr.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed">
                                  {addr.line1}, {addr.line2 && addr.line2 + ', '}{addr.city}, {addr.state} - {addr.pincode}
                                </p>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 mt-1">
                                  Phone: +91 {addr.mobile}
                                </p>
                                
                                {selectedAddress?.id === addr.id && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveStep(3);
                                    }}
                                    className="mt-3 bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-8 rounded-sm uppercase text-xs shadow-sm transition-colors"
                                  >
                                    Deliver Here
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No addresses saved. Please add one below.</p>
                      )}

                      {!showAddForm ? (
                        <button
                          onClick={() => {
                            setShowAddForm(true);
                            // Pre-fill pincode and location from localStorage if user checked delivery on product page
                            const savedPincode = localStorage.getItem('sentara_pincode');
                            const savedCity = localStorage.getItem('sentara_pincode_city');
                            const savedState = localStorage.getItem('sentara_pincode_state');
                            const savedArea = localStorage.getItem('sentara_pincode_area');
                            if (savedPincode) {
                              setNewPincode(savedPincode);
                              if (savedCity) setNewCity(savedCity);
                              if (savedState) setNewState(savedState);
                              if (savedArea && !newLine2) setNewLine2(savedArea);
                              if (savedCity && savedState) setPincodeAutoMsg(`✅ ${savedArea || ''}, ${savedCity}, ${savedState}`);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-2"
                        >
                          <Plus size={14} /> Add new delivery address
                        </button>
                      ) : (
                        <form onSubmit={handleAddAddress} className="border border-slate-200 dark:border-slate-800 p-4 rounded-sm space-y-4 mt-2">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-text-dark">New Address Details</h4>
                          {formError && (
                            <p className="text-[10px] text-error font-medium">{formError}</p>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Name *"
                              required
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                            <input
                              type="tel"
                              placeholder="10-digit mobile number *"
                              required
                              value={newMobile}
                              onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, '').slice(0,10))}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Address Line 1 *"
                              required
                              value={newLine1}
                              onChange={(e) => setNewLine1(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                            <input
                              type="text"
                              placeholder="Address Line 2 (Optional)"
                              value={newLine2}
                              onChange={(e) => setNewLine2(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="City *"
                              required
                              value={newCity}
                              onChange={(e) => setNewCity(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                            <input
                              type="text"
                              placeholder="State *"
                              required
                              value={newState}
                              onChange={(e) => setNewState(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                            <input
                              type="text"
                              placeholder="Pincode *"
                              required
                              value={newPincode}
                              onChange={(e) => handlePincodeChange(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          {pincodeAutoMsg && (
                            <p className={`text-[10px] ${pincodeAutoMsg.includes('✅') ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'} font-bold mt-1`}>
                              {pincodeAutoMsg}
                            </p>
                          )}
                          <div className="flex items-center justify-between gap-4 pt-1">
                            <div className="flex gap-2">
                              {['Home', 'Office', 'Other'].map(lbl => (
                                <button
                                  key={lbl}
                                  type="button"
                                  onClick={() => setNewLabel(lbl)}
                                  className={`px-3 py-1 border rounded-sm text-[10px] font-semibold transition-all ${
                                    newLabel === lbl
                                      ? 'bg-primary border-primary text-white'
                                      : 'border-slate-200 dark:border-slate-750 text-slate-650 dark:text-slate-400'
                                  }`}
                                >
                                  {lbl}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                id="is_default"
                                checked={newIsDefault}
                                onChange={(e) => setNewIsDefault(e.target.checked)}
                                className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                              />
                              <label htmlFor="is_default" className="text-[10px] font-bold text-slate-500">
                                Set as Default
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              type="button"
                              onClick={() => setShowAddForm(false)}
                              className="text-slate-500 hover:bg-slate-105 dark:hover:bg-slate-800 text-[11px] font-bold px-3 py-2 rounded-sm"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-primary hover:bg-primary-dark text-white text-[11px] font-bold px-4 py-2 rounded-sm"
                            >
                              Save Address
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-card-dark py-4 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-sm">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-455 font-bold uppercase select-none">
                  <span className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-black">2</span>
                  <span>Delivery Address</span>
                  {selectedAddress && <span className="text-success text-xs lowercase font-semibold ml-2 select-none">✓ selected</span>}
                </div>
                <div className="flex items-center gap-4">
                  {selectedAddress && (
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-350 max-w-xs truncate">
                      {selectedAddress.name}, {selectedAddress.city} - {selectedAddress.pincode}
                    </span>
                  )}
                  <button
                    disabled={activeStep < 2}
                    onClick={() => setActiveStep(2)}
                    className="text-primary dark:text-primary-light hover:underline font-bold text-xs uppercase disabled:opacity-30"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: ORDER SUMMARY */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-sm shadow-soft">
            {activeStep === 3 ? (
              <div>
                <div className="bg-primary text-white font-bold py-4 px-6 flex items-center gap-3 text-sm uppercase">
                  <span className="w-5 h-5 flex items-center justify-center bg-white text-primary rounded-full text-xs">3</span>
                  <span>Order Summary</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-4 divide-y divide-slate-200 dark:divide-slate-800">
                    {cart.map((item, idx) => (
                      <div key={`${item.productId}-${item.color || ''}-${item.size || ''}`} className={`flex items-start gap-4 ${idx > 0 ? 'pt-4' : ''}`}>
                        <div className="w-16 h-16 bg-white border border-slate-200 dark:border-slate-800 rounded-sm flex items-center justify-center p-1 flex-shrink-0">
                           <img
                            src={getProductImage(item.product.name, item.product.category, item.product.image)}
                            alt={item.product.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => { e.target.src = getProductImage(item.product.name, item.product.category, null, true); }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-text-dark line-clamp-1">
                            {item.product.name}
                          </h4>
                          <p className="text-[10px] text-slate-450 uppercase mt-0.5">
                            Qty: {item.quantity}
                            {item.color && ` | Color: ${item.color}`}
                            {item.size && ` | Size: ${item.size}`}
                          </p>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-text-dark">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {item.product.discount > 0 && (
                              <span className="text-[10px] text-success font-bold">
                                {item.product.discount}% Off
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={() => setActiveStep(4)}
                      className="bg-accent hover:bg-accent-dark text-white font-bold py-2.5 px-8 rounded-sm uppercase text-xs shadow-sm transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-card-dark py-4 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-sm">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-455 font-bold uppercase select-none">
                  <span className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-xs font-black">3</span>
                  <span>Order Summary</span>
                  {activeStep > 3 && <span className="text-success text-xs lowercase font-semibold ml-2 select-none">✓ confirmed</span>}
                </div>
                <div className="flex items-center gap-4">
                  {activeStep > 3 && (
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-350">
                      {cart.length} {cart.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                  <button
                    disabled={activeStep < 3}
                    onClick={() => setActiveStep(3)}
                    className="text-primary dark:text-primary-light hover:underline font-bold text-xs uppercase disabled:opacity-30"
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: PAYMENT OPTIONS */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-sm shadow-soft">
            {activeStep === 4 ? (
              <div>
                <div className="bg-primary text-white font-bold py-4 px-6 flex items-center gap-3 text-sm uppercase">
                  <span className="w-5 h-5 flex items-center justify-center bg-white text-primary rounded-full text-xs">4</span>
                  <span>Payment Options</span>
                </div>
                <div className="p-6 space-y-6">
                  
                  {/* Payment selector buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['UPI', 'Card', 'Net Banking', 'Cash on Delivery'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-3 px-1 border rounded-sm text-xs font-bold transition-all text-center flex flex-col items-center justify-center ${
                          paymentMethod === method
                            ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                            : 'border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:border-primary/50'
                        }`}
                      >
                        <span>{method}</span>
                      </button>
                    ))}
                  </div>

                  {/* UPI Form */}
                  {paymentMethod === 'UPI' && (
                    <div className="pt-2 animate-fadeIn space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        UPI ID (VPA)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="example@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full max-w-sm px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      />
                      <span className="block text-[9px] text-slate-400">
                        Enter your UPI ID (e.g. mobile@ybl, name@oksbi) to verify payment
                      </span>
                    </div>
                  )}

                  {/* Card Form */}
                  {paymentMethod === 'Card' && (
                    <div className="pt-2 gap-3 grid grid-cols-3 max-w-md animate-fadeIn">
                      <div className="col-span-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="XXXX XXXX XXXX XXXX"
                          value={cardNo}
                          onChange={(e) => setCardNo(e.target.value.replace(/\D/g, '').slice(0,16).replace(/(.{4})/g, '$1 ').trim())}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-wider"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setCardExpiry(digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits);
                          }}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          CVV Code
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="***"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0,3))}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-center font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Net banking / COD details */}
                  {paymentMethod === 'Net Banking' && (
                    <p className="text-[10px] text-slate-450 italic">
                      Simulating payment redirect via mock merchant gateway.
                    </p>
                  )}
                  {paymentMethod === 'Cash on Delivery' && (
                    <p className="text-[10px] text-slate-455 italic">
                      ₹40 delivery/handling premium may apply. Cash will be collected on courier drop off.
                    </p>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-105 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full sm:w-auto px-10 py-3.5 bg-accent hover:bg-accent-dark text-white rounded-sm text-xs font-bold uppercase tracking-wide shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <>
                          <span>Place Order & Pay</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-card-dark py-4 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-sm">
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 font-bold uppercase select-none">
                  <span className="w-5 h-5 flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-black">4</span>
                  <span>Payment Options</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right: Price Details Card */}
        <div className="space-y-4">
          
          {/* Loyalty Points Redemption Box */}
          {user && availablePoints > 0 && (
            <div className="bg-white dark:bg-card-dark border border-amber-500/20 dark:border-amber-500/10 p-5 rounded-sm shadow-soft space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">SENTARA reward points</span>
                <span className="text-xs font-black text-slate-800 dark:text-white font-mono">{availablePoints} pts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  id="redeem-points"
                  type="checkbox"
                  checked={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.checked)}
                  className="h-4 w-4 text-amber-500 border-slate-350 dark:border-slate-800 rounded focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="redeem-points" className="text-xs font-semibold text-slate-650 dark:text-slate-350 cursor-pointer select-none">
                  Redeem points (Get <span className="text-emerald-600 dark:text-emerald-400 font-extrabold font-mono">₹{(availablePoints * 0.1).toFixed(2)}</span> discount)
                </label>
              </div>
            </div>
          )}

          {/* Summary Invoice Card */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-sm p-6 shadow-soft space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
              Price Details
            </h3>

            <div className="space-y-4 text-xs font-medium text-slate-700 dark:text-slate-350">
              <div className="flex justify-between">
                <span>Price ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                <span>₹{(subtotal + itemSavings).toLocaleString('en-IN')}</span>
              </div>
              
              {itemSavings > 0 && (
                <div className="flex justify-between text-success">
                  <span>Product Discount</span>
                  <span>- ₹{itemSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Coupon Discount</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Loyalty Points Discount</span>
                  <span>- ₹{pointsDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  Delivery Charges
                  <span className="group relative cursor-pointer text-slate-400">
                    <Info size={12} />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-36 hidden group-hover:block bg-slate-950 text-white dark:bg-white dark:text-slate-900 p-2 rounded text-[9px] text-center shadow-lg font-medium">
                      Free delivery on orders over ₹499
                    </span>
                  </span>
                </span>
                <span className={deliveryFee === 0 ? "text-success font-bold" : ""}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-850 border-dashed pt-4 flex justify-between font-bold text-base text-slate-850 dark:text-text-dark">
              <span>Total Payable</span>
              <span className="text-slate-900 dark:text-text-dark font-mono">
                ₹{finalTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {totalSavings > 0 && (
              <div className="bg-green-50/50 dark:bg-green-950/10 border-t border-b border-green-100 dark:border-green-950/30 py-3 text-center">
                <p className="text-[11.5px] font-bold text-success">
                  You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
                </p>
              </div>
            )}
          </div>

          {/* Guarantee info */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 p-3 rounded-sm">
            <ShieldCheck className="text-success flex-shrink-0" size={16} />
            <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
