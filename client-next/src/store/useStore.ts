import { create } from 'zustand';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: string;
  points: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface AppState {
  theme: ThemeConfig | null;
  user: User | null;
  cart: CartItem[];
  compareList: any[];
  selectedMood: string;
  setTheme: (theme: ThemeConfig) => void;
  setUser: (user: User | null) => void;
  addToCart: (item: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleCompare: (product: any) => void;
  setSelectedMood: (mood: string) => void;
}

export const useStore = create<AppState>((set) => ({
  theme: null,
  user: null,
  cart: [],
  compareList: [],
  selectedMood: '',
  setTheme: (theme) => set({ theme }),
  setUser: (user) => set({ user }),
  addToCart: (item) => set((state) => {
    const existing = state.cart.find((c) => c.id === item.id);
    if (existing) {
      return {
        cart: state.cart.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      };
    }
    return { cart: [...state.cart, { ...item, quantity: 1 }] };
  }),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((c) => c.id !== id)
  })),
  clearCart: () => set({ cart: [] }),
  toggleCompare: (product) => set((state) => {
    const exists = state.compareList.find((p) => p.id === product.id);
    if (exists) {
      return { compareList: state.compareList.filter((p) => p.id !== product.id) };
    }
    if (state.compareList.length >= 3) return state; // max 3
    return { compareList: [...state.compareList, product] };
  }),
  setSelectedMood: (selectedMood) => set({ selectedMood }),
}));
