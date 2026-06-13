import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/imageMapper';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ShoppingCart, 
  ArrowLeft, 
  Info,
  Loader2
} from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    subtotal,
    deliveryFee,
    coupon,
    discount,
    total,
    loading,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const data = await applyCoupon(couponCode);
      setCouponSuccess(data.message || 'Coupon applied successfully!');
      setCouponCode('');
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleQuantityChange = async (productId, currentQty, increment, color = null, size = null) => {
    const nextQty = currentQty + (increment ? 1 : -1);
    try {
      await updateQuantity(productId, nextQty, color, size);
    } catch (err) {
      console.error('Failed to change quantity:', err);
    }
  };

  if (loading && cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <span className="text-sm font-medium text-slate-500">Loading your cart...</span>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center justify-center transition-colors duration-300">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 mb-6">
          <ShoppingCart size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-text-dark">Your cart is empty</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-text-mutedDark max-w-sm">
          Looks like you haven't added anything to your cart yet. Browse our products to find the best deals!
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-6 py-3 rounded-full shadow-premium transition-all hover:scale-105"
        >
          <ArrowLeft size={14} />
          <span>Start Shopping</span>
        </Link>
      </div>
    );
  }

  const itemSavings = cart.reduce((acc, item) => {
    const orig = item.product.originalPrice || item.product.price;
    return acc + (orig - item.product.price) * item.quantity;
  }, 0);
  const totalSavings = itemSavings + discount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <h1 className="text-xl font-bold text-slate-800 dark:text-text-dark tracking-tight mb-6 flex items-center gap-2">
        <ShoppingCart className="text-primary" size={22} />
        <span>Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-805 rounded-sm shadow-soft">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                SENTARA Items ({cart.length})
              </span>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
                className="text-xs font-bold text-error hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} />
                <span>Clear Cart</span>
              </button>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {cart.map((item) => (
                <div
                  key={`${item.productId}-${item.color || ''}-${item.size || ''}`}
                  className="flex flex-col sm:flex-row items-start justify-between gap-6 p-6"
                >
                  {/* Product Details Section */}
                  <div className="flex gap-6 flex-1">
                    {/* Image Column */}
                    <div className="flex flex-col items-center">
                      <div 
                        onClick={() => navigate(`/product/${item.productId}`)}
                        className="group h-24 w-24 bg-white dark:bg-slate-900/40 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 cursor-pointer border border-slate-200 dark:border-slate-800"
                      >
                        <img
                          src={getProductImage(item.product.name, item.product.category, item.product.image)}
                          alt={item.product.name}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = getProductImage(item.product.name, item.product.category, null, true);
                          }}
                        />
                      </div>

                      {/* Quantity selector directly below image */}
                      <div className="flex items-center gap-1.5 mt-4">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => handleQuantityChange(item.productId, item.quantity, false, item.color, item.size)}
                          className="w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-full text-slate-750 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-text-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity, true, item.color, item.size)}
                          className="w-7 h-7 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-full text-slate-750 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          title="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Description Column */}
                    <div className="flex-1 space-y-2">
                      <h3 
                        onClick={() => navigate(`/product/${item.productId}`)}
                        className="text-sm font-medium text-slate-850 dark:text-text-dark hover:text-primary cursor-pointer transition-colors max-w-md line-clamp-2 leading-relaxed"
                      >
                        {item.product.name}
                      </h3>
                      {/* Display item options (color, size) */}
                      {(item.color || item.size) && (
                        <div className="flex gap-4 text-[10px] text-slate-500 font-semibold pt-1">
                          {item.color && (
                            <span className="flex items-center gap-1">
                              Color: <span className="text-slate-850 dark:text-slate-200">{item.color}</span>
                            </span>
                          )}
                          {item.size && (
                            <span className="flex items-center gap-1">
                              Size: <span className="text-slate-850 dark:text-slate-200">{item.size}</span>
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Category: {item.product.category}
                        </span>
                        {item.product.inStock ? (
                          <span className="text-[10px] font-bold text-success">In Stock</span>
                        ) : (
                          <span className="text-[10px] font-bold text-error">Out of Stock</span>
                        )}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base font-black text-slate-900 dark:text-text-dark">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        {item.product.discount > 0 && (
                          <>
                            <span className="text-xs text-slate-400 line-through">
                              ₹{(item.product.originalPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-bold text-success">
                              {item.product.discount}% Off
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button on the right (stacked on mobile) */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start h-full self-stretch sm:self-auto w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                      onClick={() => removeFromCart(item.productId, item.color, item.size)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-350 hover:text-error dark:hover:text-error uppercase tracking-wider transition-colors py-1.5 px-3 border border-slate-200 dark:border-slate-700 hover:border-error/30 dark:hover:border-error/30 rounded-sm bg-slate-50/50 dark:bg-slate-850"
                      title="Remove from cart"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Place Order sticky footer inside items card */}
            <div className="flex justify-end p-4 border-t border-slate-200 dark:border-slate-850 bg-white dark:bg-card-dark sticky bottom-0 z-10 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] rounded-b-sm">
              <button
                onClick={() => navigate('/checkout')}
                className="bg-accent hover:bg-accent-dark text-white font-bold py-3.5 px-8 rounded-sm shadow-md hover:shadow-lg uppercase text-sm tracking-wider transition-all duration-200 active:scale-[0.98]"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="space-y-4">
          
          {/* Coupon Code Card */}
          <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 rounded-sm p-4 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <Tag size={14} className="text-primary" />
              Promotional Coupons
            </h3>

            {coupon ? (
              <div className="bg-green-50 dark:bg-green-950/20 border border-success/35 p-3 rounded-sm flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-success block">
                    {coupon.code} Applied
                  </span>
                  <span className="text-[10px] text-green-700 dark:text-green-400 font-medium">
                    {coupon.description}
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-650 dark:text-red-400 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Coupon (e.g. SAVE10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-200 rounded-sm text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-4 py-2 rounded-sm transition-colors disabled:opacity-50"
                >
                  {couponLoading ? 'Applying...' : 'Apply'}
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-[11px] text-error font-medium mt-2">{couponError}</p>
            )}
            {couponSuccess && (
              <p className="text-[11px] text-success font-medium mt-2">{couponSuccess}</p>
            )}
          </div>

          {/* Pricing Invoice Summary Card */}
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

            <div className="border-t border-slate-200 dark:border-slate-850 border-dashed pt-4 flex justify-between font-bold text-base text-slate-800 dark:text-text-dark">
              <span>Total Amount</span>
              <span className="text-slate-900 dark:text-text-dark">
                ₹{total.toLocaleString('en-IN')}
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
        </div>

      </div>
    </div>
  );
}
