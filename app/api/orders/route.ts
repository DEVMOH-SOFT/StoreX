import { NextRequest, NextResponse } from 'next/server';
import { fetchOrders, insertOrder, fetchProductById } from '@/lib/supabase';
import { Order, OrderDelivery, DeliveryStatus, PaymentMethodType, DeliveryMethodType } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await fetchOrders();
    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error('[API Orders GET Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve orders', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      subtotal,
      deliveryFee = 2000,
      discount = 0,
      address,
      paymentMethod = 'card',
      deliveryMethod = 'standard',
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!address || !address.fullName || !address.address || !address.city || !address.phone) {
      return NextResponse.json(
        { success: false, error: 'Complete delivery address is required' },
        { status: 400 }
      );
    }

    // Verify all products in the cart
    const verifiedCartItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const productId = item.productId || item.product?.id;
      const quantity = Number(item.quantity) || 1;

      const product = await fetchProductById(productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product '${productId}' is not available in catalog` },
          { status: 404 }
        );
      }

      calculatedSubtotal += product.price * quantity;
      verifiedCartItems.push({
        product,
        quantity,
        selectedColor: item.selectedColor,
      });
    }

    const orderId = `STX-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const delivery: OrderDelivery = {
      deliveryId: `DEL-${Math.floor(10000 + Math.random() * 90000)}`,
      provider: deliveryMethod === 'express' ? 'StoreX Priority Express' : 'StoreX Standard Logistics',
      status: 'PROCESSING' as DeliveryStatus,
      trackingNumber: `TRK-${Date.now().toString().slice(-8)}`,
      address,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      events: [
        {
          title: 'Order Confirmed',
          description: 'Payment verified and order submitted',
          timestamp: `${formattedDate}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          completed: true,
        },
        {
          title: 'Processing',
          description: 'Items are being verified and packaged at distribution warehouse',
          timestamp: 'In Progress',
          completed: false,
        },
        {
          title: 'Out for Delivery',
          description: 'Courier assigned for final mile delivery',
          timestamp: 'Pending',
          completed: false,
        },
        {
          title: 'Delivered',
          description: 'Package delivered to recipient',
          timestamp: 'Pending',
          completed: false,
        },
      ],
    };

    const finalTotal = calculatedSubtotal + Number(deliveryFee) - Number(discount);

    const newOrder: Order = {
      id: orderId,
      date: formattedDate,
      items: verifiedCartItems,
      subtotal: calculatedSubtotal,
      deliveryFee: Number(deliveryFee),
      discount: Number(discount),
      total: finalTotal,
      status: 'Processing',
      delivery,
      paymentMethod: paymentMethod as PaymentMethodType,
    };

    await insertOrder(newOrder);

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API Orders POST Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order', message: error.message },
      { status: 500 }
    );
  }
}
