import { NextResponse, NextRequest } from 'next/server';
import { getMoodProducts, readProducts } from '../../../../lib/api/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const mood = req.nextUrl.searchParams.get('type') || req.nextUrl.searchParams.get('mood') || '';
    const products = readProducts();
    const selection = mood ? getMoodProducts(products, mood) : products.slice(0, 4);
    return NextResponse.json({ success: true, products: selection });
  } catch (error) {
    console.error('/api/products/mood error', error);
    return NextResponse.json({ success: false, error: 'Could not load mood products' }, { status: 500 });
  }
}
