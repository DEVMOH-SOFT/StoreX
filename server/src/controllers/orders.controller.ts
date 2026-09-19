import { Request, Response } from 'express';
import { getRepository } from '../db/index.js';
import { Order, DeliveryStatus, TrackingEvent } from '../types/index.js';

export async function getOrders(_req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const orders = await repo.getOrders();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error('[StoreX API] Error in getOrders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve orders',
      message: error.message,
    });
  }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const { id } = req.params;

    const order = await repo.getOrderById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: `Order with ID '${id}' not found`,
        code: 'NOT_FOUND',
      });
      return;
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error(`[StoreX API] Error in getOrderById(${req.params.id}):`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve order',
      message: error.message,
    });
  }
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const {
      items,
      subtotal,
      deliveryFee = 2000,
      discount = 0,
      address,
      paymentMethod = 'card',
      deliveryMethod = 'standard',
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Order must contain at least one item',
      });
      return;
    }

    if (!address || !address.fullName || !address.address || !address.phone) {
      res.status(400).json({
        success: false,
        error: 'Complete delivery address with fullName, address, and phone is required',
      });
      return;
    }

    const orderId = `STX-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const calculatedTotal = (Number(subtotal) || 0) + Number(deliveryFee) - Number(discount);
    const trackingNumber = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const deliveryId = `DEL-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      date: today,
      items,
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee),
      discount: Number(discount),
      total: calculatedTotal,
      status: 'Processing',
      paymentMethod,
      delivery: {
        deliveryId,
        provider: 'StoreX Express Logistics',
        status: 'PROCESSING',
        trackingNumber,
        address,
        estimatedDelivery: deliveryMethod === 'express' ? '1-2 Business Days' : '2-4 Business Days',
        events: [
          {
            title: 'Order Confirmed',
            description: 'Payment received and order verified successfully',
            timestamp: `${today}, Just now`,
            completed: true,
          },
          {
            title: 'Processing',
            description: 'Package being prepared at Lagos fulfillment hub',
            timestamp: `${today}, In Progress`,
            completed: true,
          },
          {
            title: 'Out for Delivery',
            description: 'Package dispatched with courier rider',
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
      },
    };

    const created = await repo.createOrder(newOrder);

    res.status(201).json({
      success: true,
      order: created,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    console.error('[StoreX API] Error in createOrder:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      message: error.message,
    });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const repo = getRepository();
    const { id } = req.params;
    const { status, note } = req.body;

    const allowedStatuses: Order['status'][] = [
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
      return;
    }

    const order = await repo.getOrderById(id);
    if (!order) {
      res.status(404).json({
        success: false,
        error: `Order '${id}' not found`,
      });
      return;
    }

    // Map order status to delivery status
    let deliveryStatus: DeliveryStatus = 'PROCESSING';
    if (status === 'Out for Delivery') deliveryStatus = 'OUT_FOR_DELIVERY';
    if (status === 'Delivered') deliveryStatus = 'DELIVERED';
    if (status === 'Shipped') deliveryStatus = 'IN_TRANSIT';
    if (status === 'Cancelled') deliveryStatus = 'FAILED';

    const nowFormatted = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Update milestone event if matching
    const targetEvent = order.delivery.events.find(
      e => e.title.toLowerCase() === status.toLowerCase()
    );

    let newEvent: TrackingEvent | undefined = undefined;
    if (targetEvent) {
      targetEvent.completed = true;
      targetEvent.timestamp = `Today, ${nowFormatted}`;
      if (note) targetEvent.description = note;
    } else if (note) {
      newEvent = {
        title: status,
        description: note,
        timestamp: `Today, ${nowFormatted}`,
        completed: true,
      };
    }

    const updated = await repo.updateOrderStatus(id, status, deliveryStatus, newEvent);

    res.status(200).json({
      success: true,
      order: updated,
      message: `Order status advanced to ${status}`,
    });
  } catch (error: any) {
    console.error(`[StoreX API] Error in updateOrderStatus(${req.params.id}):`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      message: error.message,
    });
  }
}
