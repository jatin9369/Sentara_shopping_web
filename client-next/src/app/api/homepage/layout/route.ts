import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const layout = {
      sections: [
        { sectionId: 'hero', label: 'Hero Carousel' },
        { sectionId: 'categories', label: 'Categories' },
        { sectionId: 'trending', label: 'Trending Products' },
        { sectionId: 'recommendations', label: 'Recommended For You' }
      ],
      banners: [
        {
          id: 'banner-1',
          title: 'Welcome to SENTARA',
          subtitle: 'Shop smarter with exclusive deals and tailored recommendations.',
          cta: 'Browse Deals',
          image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&auto=format&fit=crop&q=80',
          background: 'from-blue-600 to-indigo-700'
        },
        {
          id: 'banner-2',
          title: 'Fast Delivery for Students',
          subtitle: 'Save on gadgets, books, and lifestyle essentials.',
          cta: 'Explore Student Picks',
          image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
          background: 'from-teal-600 to-cyan-700'
        }
      ],
      categories: [
        { label: 'Electronics', image: 'https://images.unsplash.com/photo-1510552776732-7197d2b1dc17?w=128&auto=format&fit=crop&q=60' },
        { label: 'Books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=128&auto=format&fit=crop&q=60' },
        { label: 'Fashion', image: 'https://images.unsplash.com/photo-1521334884684-d80222895322?w=128&auto=format&fit=crop&q=60' },
        { label: 'Home', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=128&auto=format&fit=crop&q=60' }
      ]
    };

    return NextResponse.json({ success: true, layout });
  } catch (error) {
    console.error('/api/homepage/layout error', error);
    return NextResponse.json({ success: false, error: 'Could not load homepage layout' }, { status: 500 });
  }
}
