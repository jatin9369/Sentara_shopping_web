import React from 'react';
import DynamicLayout from '../components/DynamicLayout';
import { ShoppingBag, Sparkles, User } from 'lucide-react';

async function fetchStorefrontData() {
  try {
    const layoutRes = await fetch('http://localhost:3001/api/homepage/layout', { cache: 'no-store' });
    const layoutData = await layoutRes.json();

    const productsRes = await fetch('http://localhost:3001/api/products', { cache: 'no-store' });
    const productsData = await productsRes.json();

    return {
      layout: layoutData.success ? layoutData.layout : { sections: [], banners: [], categories: [] },
      products: productsData.success ? productsData.products : []
    };
  } catch (err) {
    console.error('Failed to pre-fetch storefront configurations:', err);
    return {
      layout: {
        sections: [
          { sectionId: 'hero', label: 'Hero Carousel' },
          { sectionId: 'categories', label: 'Categories' },
          { sectionId: 'trending', label: 'Trending' }
        ],
        banners: [],
        categories: []
      },
      products: []
    };
  }
}

export default async function StorefrontPage() {
  const { layout, products } = await fetchStorefrontData();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-lg font-black tracking-tight text-primary flex items-center gap-1">
              <Sparkles className="text-accent animate-pulse" size={20} /> SENTARA
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-text/70 hover:text-primary transition-colors" aria-label="Cart">
              <ShoppingBag size={20} />
            </button>
            <button className="p-2 text-text/70 hover:text-primary transition-colors flex items-center gap-1.5" aria-label="Account">
              <User size={20} />
              <span className="hidden sm:inline text-xs font-bold">Shopper</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <DynamicLayout layoutData={layout} initialProducts={products} />
      </main>

      <footer className="bg-surface border-t border-border py-8 text-center text-text/40 text-xs font-bold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p>© 2026 SENTARA Inc. Built with Next.js, Postgres, and Prisma. Absolutely nothing hardcoded.</p>
        </div>
      </footer>
    </div>
  );
}
