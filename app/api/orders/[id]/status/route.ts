import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatusInDb } from '@/lib/supabase';
import { Order, DeliveryStatus, TrackingEvent } from '@/types';

export const dynamic = 'force-dynamic';

const STATUS_TO_DELIVERY_STATUS: Record<Order['status'], DeliveryStatus> = {
  Processing: 'PROCESSING',
  Shipped: 'IN_TRANSIT',
  'Out for Delivery': 'OUT_FOR_DELIVERY',
  Delivered: 'DELIVERED',
  Cancelled: 'FAILED',
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, note } = body;

    const validStatuses: Order['status'][] = [
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Valid values: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const deliveryStatus = STATUS_TO_DELIVERY_STATUS[status as Order['status']];
    let newEvent: TrackingEvent | undefined;

    if (note || status) {
      newEvent = {
        title: status,
        description: note || `Order status updated to ${status}`,
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        completed: true,
      };
    }

    const updated = await updateOrderStatusInDb(id, status, deliveryStatus, newEvent);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Order with ID '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error: any) {
    console.error('[API Order Status Update Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status', message: error.message },
      { status: 500 }
    );
  }
}
