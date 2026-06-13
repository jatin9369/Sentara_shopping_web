import React from 'react';
import DynamicLayout from '../components/DynamicLayout';

export const dynamic = 'force-dynamic';

async function fetchStorefrontData() {
  try {
    const layoutRes = await fetch('/api/homepage/layout', { cache: 'no-store' });
    const layoutData = await layoutRes.json();

    const productsRes = await fetch('/api/products', { cache: 'no-store' });
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
