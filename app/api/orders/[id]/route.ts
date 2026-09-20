import { NextRequest, NextResponse } from 'next/server';
import { fetchOrderById } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const order = await fetchOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order with ID '${id}' not found`, code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error('[API Order By ID Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve order', message: error.message },
      { status: 500 }
    );
  }
}
