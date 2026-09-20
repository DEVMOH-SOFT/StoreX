import { NextResponse } from 'next/server';
import { fetchCategories } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await fetchCategories();
    return NextResponse.json(
      {
        success: true,
        count: categories.length,
        categories,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error: any) {
    console.error('[API Categories Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve categories', message: error.message },
      { status: 500 }
    );
  }
}
