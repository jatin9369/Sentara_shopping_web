import { NextResponse } from 'next/server';
import { getRecommendations, readProducts } from '../../../../lib/api/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = readProducts();
    const recommendations = getRecommendations(products);
    return NextResponse.json({ success: true, products: recommendations });
  } catch (error) {
    console.error('/api/products/recommendations error', error);
    return NextResponse.json({ success: false, error: 'Could not load recommendations' }, { status: 500 });
  }
}
