import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Calendar, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Truck, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  ArrowRight
} from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null); // Track ID of expanded order details
  const [successOrder, setSuccessOrder] = useState(() => {
    return (location.state?.orderSuccess && location.state?.placedOrder) ? location.state.placedOrder : null;
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Clear navigation state to prevent showing success on subsequent page refreshes
    if (location.state?.orderSuccess) {
      window.history.replaceState({}, document.title);
    }

    const fetchOrders = async () => {
      await Promise.resolve();
      setLoading(true);
      try {
        const data = await api.orders.list();
        if (data.success) {
          setOrders(data.orders);
          // Auto-expand the first order if it exists
          if (data.orders.length > 0) {
            setExpandedOrder(data.orders[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, location.state, navigate]);

  const toggleExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  // Helper to format date
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'text-success bg-green-50 dark:bg-green-950/20 border-success/30';
      case 'shipped': return 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/20';
      case 'cancelled': return 'text-error bg-red-50 dark:bg-red-950/20 border-error/30';
      default: return 'text-warning bg-amber-50 dark:bg-amber-950/20 border-warning/30'; // confirmed / processing
    }
  };

  // Check which steps are completed based on status
  const getStepProgress = (status) => {
    const steps = ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIdx = steps.indexOf(status?.toLowerCase()) !== -1 
      ? steps.indexOf(status?.toLowerCase()) 
      : 0; // default confirmed
    return currentIdx;
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <span className="text-sm font-medium text-slate-500">Retrieving orders...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 transition-colors duration-300">
      
      {/* Placed Order Success Banner */}
      {successOrder && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-success/30 p-6 sm:p-8 rounded-2xl mb-8 flex flex-col items-center text-center shadow-soft animate-fadeIn">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-success/15 text-success mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-green-900 dark:text-green-300">
            Order Placed Successfully!
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md">
            Thank you for shopping with us. Your order has been registered under ID: <br />
            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-[10px] sm:text-xs">{successOrder.id}</span>
          </p>
          <p className="text-xs text-green-800 dark:text-green-400 font-semibold mt-3 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-success/20">
            Estimated Delivery: {formatDate(successOrder.estimatedDelivery).split(',')[0]}
          </p>
        </div>
      )}

      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-text-dark tracking-tight mb-8">
        Your Order History
      </h1>

      {orders.length === 0 ? (
        /* Empty History */
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-3xl block mb-2">📦</span>
          <h3 className="text-lg font-bold text-slate-700 dark:text-text-dark">No orders found</h3>
          <p className="text-xs text-slate-500 dark:text-text-mutedDark mt-1 max-w-sm mx-auto">
            You haven't placed any orders yet. Browse our selection and shop our catalog!
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark px-5 py-2.5 rounded-full shadow-premium"
          >
            <span>Browse Products</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        /* Order Cards List */
        <div className="space-y-6">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const progressIndex = getStepProgress(order.status);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-card-dark border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-soft transition-all"
              >
                {/* Header Summary (Click to Toggle Detail) */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/10 transition-colors"
                >
                  <div className="grid grid-cols-2 sm:flex gap-x-6 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Order Placed</span>
                      <span className="text-slate-800 dark:text-text-dark font-semibold">{formatDate(order.orderedAt).split(',')[0]}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Total Amount</span>
                      <span className="text-slate-850 dark:text-text-dark font-bold">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Items</span>
                      <span className="text-slate-800 dark:text-text-dark font-semibold">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} {order.items.length === 1 ? 'qty' : 'qtys'}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Order ID</span>
                      <span className="font-mono text-slate-700 dark:text-slate-350 text-[10px] font-semibold">{order.id.slice(0, 18)}...</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className={`px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <button className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Tracking & Breakdown details */}
                {isExpanded && (
                  <div className="border-t border-slate-150 dark:border-slate-800 p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/10 space-y-6 animate-fadeIn">
                    
                    {/* Visual Timeline Tracker */}
                    <div className="py-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-5 flex items-center gap-1.5">
                        <Truck size={14} className="text-primary" />
                        Delivery Progress Tracker
                      </h4>

                      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4 md:pl-0">
                        {/* Line - Desktop */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 hidden md:block z-0" />
                        
                        {/* Track filled line */}
                        <div 
                          className="absolute top-1/2 left-0 h-0.5 bg-success -translate-y-1/2 hidden md:block z-0 transition-all duration-550" 
                          style={{ width: `${(progressIndex / 4) * 100}%` }}
                        />

                        {/* Line - Mobile */}
                        <div className="absolute top-0 bottom-0 left-[7px] w-0.5 bg-slate-200 dark:bg-slate-800 md:hidden z-0" />
                        <div 
                          className="absolute top-0 left-[7px] w-0.5 bg-success md:hidden z-0 transition-all duration-550" 
                          style={{ height: `${(progressIndex / 4) * 100}%` }}
                        />

                        {[
                          { label: 'Confirmed', desc: 'Order placed' },
                          { label: 'Processing', desc: 'Packing item' },
                          { label: 'Shipped', desc: 'Handed to courier' },
                          { label: 'Out for Delivery', desc: 'Local hub dispatch' },
                          { label: 'Delivered', desc: 'Arrived at home' }
                        ].map((step, idx) => {
                          const isCompleted = idx <= progressIndex;
                          const isCurrent = idx === progressIndex;

                          return (
                            <div key={idx} className="relative z-10 flex md:flex-col md:items-center gap-4 md:gap-2">
                              {/* Circle node */}
                              <div className={`h-4 w-4 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-card-dark transition-all ${
                                isCompleted 
                                  ? 'bg-success text-white scale-110 shadow-sm' 
                                  : 'bg-slate-200 dark:bg-slate-800'
                              }`}>
                                {isCompleted && <span className="text-[7px] font-bold">✓</span>}
                              </div>
                              
                              {/* Label */}
                              <div className="text-left md:text-center mt-0.5 md:mt-1">
                                <span className={`block text-xs font-bold ${
                                  isCurrent ? 'text-primary' : (isCompleted ? 'text-slate-800 dark:text-slate-250' : 'text-slate-400')
                                }`}>
                                  {step.label}
                                </span>
                                <span className="block text-[10px] text-slate-400 leading-none mt-0.5">{step.desc}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping info & invoice summary split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                      
                      {/* Shipping details */}
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                            <MapPin size={12} /> Shipping Address
                          </h5>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line leading-relaxed">
                            {order.address}
                          </p>
                        </div>

                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                            <CreditCard size={12} /> Payment Method
                          </h5>
                          <p className="text-xs text-slate-750 dark:text-slate-300 font-bold uppercase">
                            {order.paymentMethod}
                          </p>
                        </div>
                      </div>

                      {/* Items Summary & Invoice */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                          <Package size={12} /> Invoice Summary
                        </h5>
                        
                        {/* List items */}
                        <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-4 text-xs font-medium">
                              <span className="text-slate-600 dark:text-slate-300 line-clamp-1 flex-1">
                                {item.name}
                                {(item.color || item.size) && (
                                  <span className="text-[9px] text-slate-400 font-medium ml-1.5 lowercase">
                                    ({[item.color, item.size].filter(Boolean).join(', ')})
                                  </span>
                                )}
                                <span className="text-slate-400 font-bold text-[10px] ml-1">x{item.quantity}</span>
                              </span>
                              <span className="text-slate-800 dark:text-text-dark font-semibold">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-success">
                              <span>Discount Applied ({order.couponCode})</span>
                              <span>- ₹{order.discount.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Delivery charges</span>
                            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                          </div>
                          <div className="flex justify-between text-slate-800 dark:text-text-dark font-extrabold text-sm pt-1.5 border-t border-slate-150 dark:border-slate-800/60">
                            <span>Paid Total</span>
                            <span className="text-primary">₹{order.total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
