import { NextResponse } from 'next/server';
import { fetchCustomerProfile } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await fetchCustomerProfile();
    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('[API Account Profile Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve profile', message: error.message },
      { status: 500 }
    );
  }
}
