import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Star, AlertCircle } from 'lucide-react';
import { getProductImage } from '../utils/imageMapper';

export default function ProductCompare({ selectedProducts, onRemove, onClose, onAddToCart }) {
  if (selectedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-300 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-primary text-white px-2 py-0.5 rounded-sm uppercase tracking-wider">Compare Mode</span>
            <span className="text-xs text-slate-550 dark:text-slate-400 font-bold">
              Comparing {selectedProducts.length} of 3 products
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Table Grid */}
        <div className="grid grid-cols-4 gap-4 py-4 overflow-x-auto min-w-[700px]">
          {/* Label Column */}
          <div className="col-span-1 flex flex-col justify-around text-left border-r border-slate-100 dark:border-slate-800/80 pr-4 space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="h-24 flex items-center">Product</div>
            <div className="py-2 border-b border-slate-100 dark:border-slate-800">Price</div>
            <div className="py-2 border-b border-slate-100 dark:border-slate-800">Rating</div>
            <div className="py-2 border-b border-slate-100 dark:border-slate-800">Category</div>
            <div className="py-2 border-b border-slate-100 dark:border-slate-800">Stock Status</div>
            <div className="py-2">Actions</div>
          </div>

          {/* Product Cards */}
          {[...Array(3)].map((_, idx) => {
            const product = selectedProducts[idx];
            if (!product) {
              return (
                <div key={idx} className="col-span-1 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-sm p-4 h-full bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 text-[10px] font-bold uppercase tracking-wider">
                  <AlertCircle size={20} className="mb-2 text-slate-350" />
                  Slot {idx + 1} Empty
                </div>
              );
            }

            return (
              <div key={product.id} className="col-span-1 text-left space-y-4 relative">
                {/* Remove pin */}
                <button
                  onClick={() => onRemove(product.id)}
                  className="absolute top-0 right-0 bg-red-100 hover:bg-red-200 dark:bg-red-950/80 dark:hover:bg-red-900 text-red-600 dark:text-red-300 p-1 rounded-full transition-colors"
                  title="Remove from comparison"
                >
                  <X size={10} />
                </button>

                {/* Info block */}
                <div className="flex gap-3 items-center h-24">
                  <div className="w-14 h-14 bg-white dark:bg-slate-800 p-1 border border-slate-100 dark:border-slate-700/80 rounded-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={getProductImage(product.name, product.category, product.image)} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.src = getProductImage(product.name, product.category, null, true);
                      }}
                    />
                  </div>
                  <div className="text-xs font-black text-slate-800 dark:text-white line-clamp-2 pr-4 leading-tight">
                    {product.name}
                  </div>
                </div>

                {/* Price */}
                <div className="py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-black text-slate-900 dark:text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                  {product.discount > 0 && (
                    <span className="text-[9px] text-green-650 ml-1.5 font-bold">({product.discount}% OFF)</span>
                  )}
                </div>

                {/* Rating */}
                <div className="py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-green-700 text-white px-1.5 py-0.5 rounded-sm">
                    {product.rating} <Star size={8} fill="currentColor" />
                  </span>
                  <span className="text-[10px] text-slate-400">({product.reviews?.toLocaleString()} reviews)</span>
                </div>

                {/* Category */}
                <div className="py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-650 dark:text-slate-400">
                  {product.category}
                </div>

                {/* Stock Status */}
                <div className="py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
                  {product.inStock ? (
                    <span className="text-green-600 dark:text-green-400">In Stock</span>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="py-1">
                  <button
                    onClick={() => onAddToCart(product.id, product.name)}
                    disabled={!product.inStock}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-secondary hover:bg-secondary-dark text-primary disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 dark:disabled:bg-slate-850 dark:disabled:border-slate-800 text-[10px] font-black uppercase tracking-wider rounded-sm transition-colors border border-secondary/50 active:scale-95"
                  >
                    <ShoppingBag size={11} strokeWidth={2.5} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
