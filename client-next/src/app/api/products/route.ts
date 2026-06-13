import { NextResponse, NextRequest } from 'next/server';
import { filterProducts, readProducts } from '../../../lib/api/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const products = readProducts();
    const { products: paginated, total, page, totalPages, categories } = filterProducts(products, req.nextUrl.searchParams);

    return NextResponse.json({
      success: true,
      products: paginated,
      total,
      page,
      totalPages,
      categories
    });
  } catch (error) {
    console.error('/api/products error', error);
    return NextResponse.json({ success: false, error: 'Could not load products' }, { status: 500 });
  }
}
