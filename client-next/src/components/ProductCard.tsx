"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  brand?: string;
  inStock: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleCompare, compareList } = useStore();
  const isCompared = compareList.some((p) => p.id === product.id);

  const getBrand = (name: string) => {
    return product.brand || name.split(' ')[0];
  };

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group flex flex-col bg-surface border border-border rounded-theme overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative text-left"
      aria-label={`Product card for ${product.name}`}
    >
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-3 left-3 z-10 text-[9px] font-black uppercase tracking-wider text-white bg-accent px-2 py-0.5 rounded-sm">
          {product.badge}
        </span>
      )}

      {/* Wishlist Button */}
      <button
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-surface/80 hover:bg-surface border border-border/40 text-text/50 hover:text-red-500 transition-colors shadow-sm"
        aria-label="Add to Wishlist"
      >
        <Heart size={14} />
      </button>

      {/* Image container */}
      <div className="w-full h-48 bg-background/30 flex items-center justify-center relative p-4 overflow-hidden border-b border-border/40">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-text/40 uppercase tracking-widest block">
            {getBrand(product.name)}
          </span>
          <h3 className="font-extrabold text-xs text-text leading-snug line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 pt-0.5 select-none">
            <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-white bg-green-700 px-1.5 py-0.5 rounded-sm">
              {product.rating} <Star size={8} fill="currentColor" />
            </span>
            <span className="text-[10px] text-text/40 font-bold">({product.reviews || '1,200'})</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t border-border/40">
          <div className="flex flex-col">
            <span className="text-sm font-black text-text">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <div className="flex gap-1.5 items-center">
                <span className="text-[10px] text-text/40 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                <span className="text-[9px] font-bold text-green-700">{product.discount}% OFF</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => toggleCompare(product)}
              className={`text-[9px] font-black uppercase px-2 py-1 border rounded-sm transition-all ${
                isCompared ? 'bg-primary text-white border-primary' : 'border-border text-text/60 hover:bg-background'
              }`}
            >
              Compare
            </button>
            <button
              onClick={() => addToCart(product)}
              className="p-1.5 bg-primary text-white hover:bg-primary/95 rounded-sm transition-colors shadow-sm"
              aria-label="Add to Cart"
            >
              <ShoppingBag size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
