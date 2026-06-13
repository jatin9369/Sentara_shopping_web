"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function CartPage() {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const clearCart = useStore((state) => state.clearCart);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const increment = (item: any) => {
    useStore.setState((state) => ({
      cart: state.cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      )
    }));
  };

  const decrement = (item: any) => {
    useStore.setState((state) => ({
      cart: state.cart
        .map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) }
            : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-text">Your Cart</h1>
          <p className="text-sm text-text/70">Review the items you've added and proceed to checkout.</p>
        </div>
        <button
          type="button"
          onClick={() => clearCart()}
          className="inline-flex items-center gap-2 rounded-theme border border-border bg-surface px-4 py-2 text-sm font-bold text-text transition hover:border-error hover:text-error"
        >
          <Trash2 size={16} />
          Clear Cart
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-theme border border-border bg-surface p-12 text-center">
          <ShoppingBag size={32} className="mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-black text-text">Your cart is empty</h2>
          <p className="mt-2 text-sm text-text/70">Add products from the home page to see them here.</p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="mt-6 inline-flex items-center justify-center rounded-theme bg-primary px-5 py-3 text-sm font-black text-white transition hover:bg-primary/90"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4 rounded-theme border border-border bg-surface p-4">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 rounded-theme border border-border/50 bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-theme object-contain"
                  />
                  <div>
                    <h3 className="font-black text-text">{item.name}</h3>
                    <p className="text-sm text-text/60">₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-theme border border-border bg-surface">
                    <button
                      type="button"
                      onClick={() => decrement(item)}
                      className="px-3 py-2 text-text/70 hover:text-text"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 text-sm font-black text-text">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => increment(item)}
                      className="px-3 py-2 text-text/70 hover:text-text"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="rounded-theme border border-border px-3 py-2 text-sm font-bold text-error transition hover:bg-error/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-theme border border-border bg-surface p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-text/70">Order total</p>
                <p className="text-3xl font-black text-text">₹{total.toLocaleString('en-IN')}</p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center rounded-theme bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary/90"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
