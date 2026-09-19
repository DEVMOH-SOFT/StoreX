'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, CartItem, DeliveryAddress, PaymentMethodType, DeliveryMethodType } from '@/types';
import { DEMO_PRODUCTS } from '@/data/products';

interface CreateOrderParams {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  address: DeliveryAddress;
  deliveryMethod: DeliveryMethodType;
  paymentMethod: PaymentMethodType;
}

interface OrderContextType {
  orders: Order[];
  createOrder: (params: CreateOrderParams) => Order;
  getOrderById: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Initial demo order matching visual mockups
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'STX-7842',
    date: 'Apr 25, 2026',
    items: [
      { product: DEMO_PRODUCTS[0], quantity: 1, selectedColor: 'Space Black' },
      { product: DEMO_PRODUCTS[3], quantity: 1, selectedColor: 'White' },
      { product: DEMO_PRODUCTS[1], quantity: 1, selectedColor: 'Space Gray' },
      { product: DEMO_PRODUCTS[6], quantity: 1, selectedColor: 'Black' }
    ],
    subtotal: 2995000,
    deliveryFee: 2000,
    discount: 0,
    total: 2997000,
    status: 'Out for Delivery',
    paymentMethod: 'card',
    delivery: {
      deliveryId: 'DEL-88392',
      provider: 'StoreX Express Logistics',
      status: 'OUT_FOR_DELIVERY',
      trackingNumber: 'TRK-90428402',
      address: {
        fullName: 'Muhammed Adegoke',
        phone: '+234 801 234 5678',
        email: 'muhammed@example.com',
        address: '12, Freedom Street, Ikeja',
        city: 'Ikeja',
        state: 'Lagos',
        postalCode: '100001'
      },
      estimatedDelivery: '24 September 2026',
      events: [
        {
          title: 'Order Confirmed',
          description: 'Payment verified & order created successfully',
          timestamp: 'Apr 25, 10:24 AM',
          completed: true
        },
        {
          title: 'Processing',
          description: 'Package prepared & verified at Lagos hub',
          timestamp: 'Apr 25, 2:15 PM',
          completed: true
        },
        {
          title: 'Out for Delivery',
          description: 'Courier rider assigned and currently en route to delivery address',
          timestamp: 'Apr 26, 9:00 AM',
          completed: true
        },
        {
          title: 'Delivered',
          description: 'Package handed over to recipient',
          timestamp: 'Pending',
          completed: false
        }
      ]
    }
  },
  {
    id: 'STX-7721',
    date: 'Apr 18, 2026',
    items: [{ product: DEMO_PRODUCTS[0], quantity: 1 }],
    subtotal: 1250000,
    deliveryFee: 0,
    discount: 0,
    total: 1250000,
    status: 'Delivered',
    paymentMethod: 'card',
    delivery: {
      deliveryId: 'DEL-77210',
      provider: 'StoreX Logistics',
      status: 'DELIVERED',
      trackingNumber: 'TRK-1192830',
      address: {
        fullName: 'Muhammed Adegoke',
        phone: '+234 801 234 5678',
        email: 'muhammed@example.com',
        address: '12, Freedom Street, Ikeja',
        city: 'Ikeja',
        state: 'Lagos'
      },
      estimatedDelivery: 'Apr 20, 2026',
      events: [
        { title: 'Order Confirmed', description: 'Order confirmed', timestamp: 'Apr 18', completed: true },
        { title: 'Delivered', description: 'Delivered', timestamp: 'Apr 20', completed: true }
      ]
    }
  }
];

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('storex_orders');
      if (saved) {
        setOrders(JSON.parse(saved));
      } else {
        setOrders(INITIAL_DEMO_ORDERS);
      }
    } catch (e) {
      setOrders(INITIAL_DEMO_ORDERS);
    }
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      try {
        localStorage.setItem('storex_orders', JSON.stringify(orders));
      } catch (e) {
        console.error(e);
      }
    }
  }, [orders]);

  const createOrder = (params: CreateOrderParams): Order => {
    const newOrderId = `STX-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newOrder: Order = {
      id: newOrderId,
      date: today,
      items: params.items,
      subtotal: params.subtotal,
      deliveryFee: params.deliveryFee,
      discount: params.discount,
      total: params.subtotal + params.deliveryFee - params.discount,
      status: 'Processing',
      paymentMethod: params.paymentMethod,
      delivery: {
        deliveryId: `DEL-${Math.floor(10000 + Math.random() * 90000)}`,
        provider: 'StoreX Express Logistics',
        status: 'PROCESSING',
        trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: params.address,
        estimatedDelivery: '2-4 Business Days',
        events: [
          {
            title: 'Order Confirmed',
            description: 'Payment received and order verified',
            timestamp: `${today}, Just now`,
            completed: true,
          },
          {
            title: 'Processing',
            description: 'Package being prepared at fulfillment center',
            timestamp: `${today}, In Progress`,
            completed: true,
          },
          {
            title: 'Out for Delivery',
            description: 'Package will be handed over to dispatch courier',
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

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrderById = (id: string) => {
    return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, getOrderById }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
