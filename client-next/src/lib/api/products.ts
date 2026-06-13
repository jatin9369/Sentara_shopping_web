import productsData from '../../../../data/products.json';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  image?: string;
  brand?: string;
}

export function readProducts(): Product[] {
  try {
    return productsData as Product[];
  } catch (error) {
    console.error('Failed to read products data:', error);
    return [];
  }
}

export function getAllCategories(products: Product[]) {
  return Array.from(new Set(products.map((product) => product.category))).sort();
}

export function filterProducts(products: Product[], query: URLSearchParams) {
  let filtered = [...products];

  const search = query.get('search')?.trim();
  const category = query.get('category')?.trim();
  const minPrice = query.get('minPrice');
  const maxPrice = query.get('maxPrice');
  const sort = query.get('sort');
  const page = parseInt(query.get('page') || '1', 10) || 1;
  const limit = Math.min(100, Math.max(1, parseInt(query.get('limit') || '12', 10)));
  const rating = query.get('rating');
  const inStock = query.get('inStock');
  const brand = query.get('brand')?.trim();
  const discount = query.get('discount');
  const mode = query.get('mode');
  const mood = query.get('mood')?.trim();
  const discoveryTag = query.get('discoveryTag')?.trim();

  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(lower) ||
      product.description.toLowerCase().includes(lower) ||
      product.category.toLowerCase().includes(lower)
    );
  }

  if (category) {
    filtered = filtered.filter((product) => product.category.toLowerCase() === category.toLowerCase());
  }

  if (minPrice !== null && minPrice !== '') {
    const min = parseFloat(minPrice);
    if (!Number.isNaN(min)) {
      filtered = filtered.filter((product) => product.price >= min);
    }
  }

  if (maxPrice !== null && maxPrice !== '') {
    const max = parseFloat(maxPrice);
    if (!Number.isNaN(max)) {
      filtered = filtered.filter((product) => product.price <= max);
    }
  }

  if (rating !== null && rating !== '') {
    const minRating = parseFloat(rating);
    if (!Number.isNaN(minRating)) {
      filtered = filtered.filter((product) => (product.rating ?? 0) >= minRating);
    }
  }

  if (inStock === 'true') {
    filtered = filtered.filter((product) => product.inStock);
  }

  if (brand) {
    const brandLower = brand.toLowerCase();
    filtered = filtered.filter((product) => product.name.toLowerCase().includes(brandLower));
  }

  if (discount !== null && discount !== '') {
    const minDiscount = parseFloat(discount);
    if (!Number.isNaN(minDiscount)) {
      filtered = filtered.filter((product) => (product.discount ?? 0) >= minDiscount);
    }
  }

  if (mode === 'student') {
    filtered = filtered.filter((product) => product.category === 'Electronics' || product.category === 'Books');
    filtered = filtered.map((product) => ({
      ...product,
      originalPrice: product.price,
      price: Math.floor(product.price * 0.9),
      studentDiscount: true
    }));
  }

  if (mood) {
    filtered = applyMoodFilter(filtered, mood);
  }

  if (discoveryTag) {
    filtered = applyDiscoveryTagFilter(filtered, discoveryTag);
  }

  if (sort) {
    switch (sort) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
      case 'featured':
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'trending':
        filtered.sort((a, b) => ((b.rating ?? 0) * (b.discount ?? 1)) - ((a.rating ?? 0) * (a.discount ?? 1)));
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
        break;
      case 'newest':
        filtered = filtered.reverse();
        break;
      default:
        break;
    }
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    products: paginated,
    total,
    page,
    totalPages,
    categories: getAllCategories(products)
  };
}

export function getMoodProducts(products: Product[], mood: string) {
  const normalizedMood = mood.toLowerCase();
  const matched = applyMoodFilter(products, normalizedMood);
  return matched.slice(0, 4);
}

export function getRecommendations(products: Product[]) {
  return products
    .filter((product) => product.inStock)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);
}

export function getProductById(products: Product[], id: string) {
  return products.find((product) => product.id === id) || null;
}

export function getPriceHistory(product: Product) {
  const history = [];
  let currentPrice = product.price * 1.2;

  for (let i = 30; i >= 0; i--) {
    history.push({
      day: 30 - i,
      price: Math.floor(currentPrice)
    });
    currentPrice = currentPrice - (currentPrice - product.price) * Math.random();
  }

  history[history.length - 1].price = product.price;
  return history;
}

function applyMoodFilter(products: Product[], mood: string) {
  const t = mood.toLowerCase();
  if (t === 'gaming') {
    return products.filter((product) =>
      product.category === 'Electronics' ||
      product.category === 'Toys' ||
      product.name.toLowerCase().includes('game') ||
      product.name.toLowerCase().includes('headphone') ||
      product.name.toLowerCase().includes('earbud')
    );
  }

  if (t === 'fitness') {
    return products.filter((product) =>
      product.category === 'Sports' ||
      product.category === 'Food & Health' ||
      product.name.toLowerCase().includes('shoe') ||
      product.name.toLowerCase().includes('protein') ||
      product.name.toLowerCase().includes('yoga') ||
      product.name.toLowerCase().includes('dumbbell')
    );
  }

  if (t === 'travel') {
    return products.filter((product) =>
      product.category === 'Clothing' ||
      product.category === 'Auto' ||
      product.category === '2 Wheeler' ||
      product.name.toLowerCase().includes('glove') ||
      product.name.toLowerCase().includes('holder') ||
      product.name.toLowerCase().includes('helmet') ||
      product.name.toLowerCase().includes('bag')
    );
  }

  if (t === 'study') {
    return products.filter((product) =>
      product.category === 'Books' ||
      product.name.toLowerCase().includes('table') ||
      product.name.toLowerCase().includes('book')
    );
  }

  if (t === 'productivity') {
    return products.filter((product) =>
      product.category === 'Electronics' ||
      product.category === 'Furniture' ||
      product.name.toLowerCase().includes('macbook') ||
      product.name.toLowerCase().includes('chair') ||
      product.name.toLowerCase().includes('table')
    );
  }

  return products;
}

function applyDiscoveryTagFilter(products: Product[], discoveryTag: string) {
  const tag = discoveryTag.toLowerCase();
  if (tag === 'under_500') {
    return products.filter((product) => product.price <= 500);
  }

  if (tag === 'gaming_setup') {
    return products.filter((product) =>
      product.category.toLowerCase() === 'electronics' ||
      product.name.toLowerCase().includes('game') ||
      product.name.toLowerCase().includes('headphone') ||
      product.name.toLowerCase().includes('earbud') ||
      product.name.toLowerCase().includes('monitor')
    );
  }

  if (tag === 'hostel_essentials') {
    return products.filter((product) =>
      product.category.toLowerCase() === 'home & kitchen' ||
      product.category.toLowerCase() === 'clothing' ||
      product.name.toLowerCase().includes('kettle') ||
      product.name.toLowerCase().includes('bag') ||
      product.name.toLowerCase().includes('bottle')
    );
  }

  if (tag === 'exam_prep') {
    return products.filter((product) =>
      product.category.toLowerCase() === 'books' ||
      product.name.toLowerCase().includes('book') ||
      product.name.toLowerCase().includes('pen')
    );
  }

  if (tag === 'home_office') {
    return products.filter((product) =>
      product.category.toLowerCase() === 'furniture' ||
      product.category.toLowerCase() === 'electronics' ||
      product.name.toLowerCase().includes('chair') ||
      product.name.toLowerCase().includes('table') ||
      product.name.toLowerCase().includes('lamp')
    );
  }

  if (tag === 'travel_kit') {
    return products.filter((product) =>
      product.category.toLowerCase() === 'clothing' ||
      product.name.toLowerCase().includes('bag') ||
      product.name.toLowerCase().includes('bottle') ||
      product.name.toLowerCase().includes('holder')
    );
  }

  return products;
}
