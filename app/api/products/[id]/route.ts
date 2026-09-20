import { NextRequest, NextResponse } from 'next/server';
import { fetchProductById } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const product = await fetchProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: `Product with ID '${id}' not found`, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error(`[API Product By ID Error]:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve product', message: error.message },
      { status: 500 }
    );
  }
}
