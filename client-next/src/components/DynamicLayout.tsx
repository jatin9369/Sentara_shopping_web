"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useStore } from '../store/useStore';
import { ArrowRight, Flame, Sparkles, Star } from 'lucide-react';

interface LayoutData {
  sections: { sectionId: string; label: string }[];
  banners: any[];
  categories: any[];
}

export default function DynamicLayout({ layoutData, initialProducts }: { layoutData: LayoutData; initialProducts: any[] }) {
  const { selectedMood, setSelectedMood } = useStore();
  const [products, setProducts] = useState(initialProducts);
  const [personalRecs, setPersonalRecs] = useState<any[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const fetchPersonalRecs = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/products/recommendations');
        const data = await res.json();
        if (data.success) {
          setPersonalRecs(data.products);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPersonalRecs();
  }, []);

  useEffect(() => {
    const filterProducts = async () => {
      try {
        const url = selectedMood 
          ? `http://localhost:3001/api/products?mood=${selectedMood}`
          : 'http://localhost:3001/api/products';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error(err);
      }
    };
    filterProducts();
  }, [selectedMood]);

  const MOODS = [
    { mood: 'gaming', label: '🎮 Gaming' },
    { mood: 'fitness', label: '🏋️ Fitness' },
    { mood: 'study', label: '📚 Study' },
    { mood: 'productivity', label: '💻 Productivity' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {layoutData.sections.map((section) => {
        switch (section.sectionId) {
          case 'hero':
            return (
              <section key="hero" className="relative h-64 sm:h-80 w-full overflow-hidden bg-primary text-white rounded-theme shadow-sm select-none">
                {layoutData.banners.map((b, idx) => (
                  <div
                    key={b.id || idx}
                    className={`absolute inset-0 bg-gradient-to-r ${b.background || 'from-primary to-secondary'} flex items-center justify-between p-6 sm:p-12 transition-all duration-700 ${
                      activeBanner === idx ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-10 z-0'
                    }`}
                  >
                    <div className="space-y-2 max-w-md text-left">
                      <span className="inline-block text-[9px] font-black uppercase tracking-wider text-accent bg-white/10 px-2.5 py-1 rounded-sm">
                        EXCLUSIVE OFFER
                      </span>
                      <h1 className="text-xl sm:text-3xl font-black leading-tight drop-shadow-sm">
                        {b.title}
                      </h1>
                      <p className="text-xs text-white/80 font-medium">
                        {b.subtitle}
                      </p>
                      <button className="bg-accent text-white font-bold text-[10px] sm:text-xs px-4 py-2 shadow transition-all rounded-sm">
                        {b.cta || 'Shop Now'}
                      </button>
                    </div>
                    <div className="hidden sm:block h-full w-1/2 relative overflow-hidden">
                      <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-contain" />
                    </div>
                  </div>
                ))}
                
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {layoutData.banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBanner(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        activeBanner === idx ? 'bg-white w-4' : 'bg-white/40 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              </section>
            );

          case 'categories':
            return (
              <section key="categories" className="bg-surface border border-border rounded-theme p-4 shadow-sm overflow-x-auto no-scrollbar">
                <div className="flex items-center justify-between gap-6 min-w-max">
                  {layoutData.categories.map((cat, index) => (
                    <button
                      key={index}
                      className="flex flex-col items-center justify-center transition-all group focus:outline-none"
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-background flex items-center justify-center shadow-sm">
                        <img src={cat.image} alt={cat.label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200" />
                      </div>
                      <span className="text-[10px] font-bold mt-1 text-text hover:text-primary whitespace-nowrap">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            );

          case 'trending':
            return (
              <section key="trending" className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1">
                      <Flame size={12} /> Hot Deals
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-text">Trending Products</h2>
                  </div>
                  <div className="flex gap-1.5">
                    {MOODS.map((m) => (
                      <button
                        key={m.mood}
                        onClick={() => setSelectedMood(selectedMood === m.mood ? '' : m.mood)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                          selectedMood === m.mood ? 'bg-primary text-white' : 'bg-surface border border-border text-text/70'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );

          case 'recommendations':
            return personalRecs.length > 0 ? (
              <section key="recommendations" className="bg-[#fff9db] dark:bg-slate-900/10 border border-amber-200 p-6 rounded-theme space-y-4">
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-sm">
                    AI Personalization
                  </span>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="text-amber-500" size={18} /> Recommended For You
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {personalRecs.map((p) => (
                    <div key={p.id} className="bg-white p-3 rounded-theme border border-amber-100 text-center space-y-2 relative flex flex-col justify-between shadow-sm">
                      <div>
                        <span className="absolute top-1.5 right-1.5 text-[8.5px] font-black text-text/40">₹{p.price.toLocaleString('en-IN')}</span>
                        <div className="w-12 h-12 mx-auto bg-background rounded-sm flex items-center justify-center p-1 overflow-hidden">
                          <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <h5 className="text-[10px] font-extrabold text-text line-clamp-2 leading-tight mt-1">{p.name}</h5>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null;

          case 'testimonials':
            return (
              <section key="testimonials" className="bg-surface border border-border p-6 rounded-theme space-y-4 text-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Customer Reviews</span>
                  <h3 className="text-lg font-black text-text">What Our Shoppers Say</h3>
                </div>
                <div className="max-w-xl mx-auto space-y-2">
                  <div className="flex justify-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-xs text-text/70 italic leading-relaxed">
                    "SENTARA has completely redefined online shopping for me. OTP logins take under 5 seconds, and palette swapping theme options make custom configurations a breeze!"
                  </p>
                  <span className="block text-[10px] font-black text-text uppercase">— Nitin Singh, Verified Shopper</span>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
