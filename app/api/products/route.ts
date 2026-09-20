import { NextRequest, NextResponse } from 'next/server';
import { fetchProducts } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.has('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.has('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const deals = searchParams.get('deals') === 'true';
    const featured = searchParams.get('featured') === 'true';

    const products = await fetchProducts({
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      deals,
      featured,
    });

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error: any) {
    console.error('[API Products Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve products', message: error.message },
      { status: 500 }
    );
  }
}
