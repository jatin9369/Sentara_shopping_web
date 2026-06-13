"use client";

import { useRouter } from 'next/navigation';
import { ShoppingBag, User, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Header() {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-left flex items-center gap-2 text-lg font-black tracking-tight text-primary"
          >
            <Sparkles className="text-accent animate-pulse" size={20} />
            SENTARA
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="relative p-2 text-text/70 hover:text-primary transition-colors"
            aria-label="View cart"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent text-[10px] font-black text-white px-1.5">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="p-2 text-text/70 hover:text-primary transition-colors flex items-center gap-1"
            aria-label="Account"
          >
            <User size={20} />
            <span className="hidden sm:inline text-xs font-bold">Shopper</span>
          </button>
        </div>
      </div>
    </header>
  );
}
