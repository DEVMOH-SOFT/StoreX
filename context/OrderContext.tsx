'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, CartItem, DeliveryAddress, PaymentMethodType, DeliveryMethodType } from '@/types';
import { api } from '@/lib/api';

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
  createOrder: (params: CreateOrderParams) => Promise<Order>;
  getOrderById: (id: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
  isLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch orders from Node.js backend
  const fetchOrdersFromApi = async () => {
    try {
      setIsLoading(true);
      const res = await api.orders.list();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
        localStorage.setItem('storex_orders', JSON.stringify(res.orders));
      }
    } catch (e) {
      console.warn('[StoreX OrderContext] Backend not reachable, loading from localStorage cache...');
      try {
        const cached = localStorage.getItem('storex_orders');
        if (cached) {
          setOrders(JSON.parse(cached));
        }
      } catch (err) {
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersFromApi();
  }, []);

  const createOrder = async (params: CreateOrderParams): Promise<Order> => {
    try {
      const res = await api.orders.create({
        items: params.items,
        subtotal: params.subtotal,
        deliveryFee: params.deliveryFee,
        discount: params.discount,
        address: params.address,
        paymentMethod: params.paymentMethod,
        deliveryMethod: params.deliveryMethod,
      });

      if (res.success && res.order) {
        setOrders((prev) => [res.order, ...prev.filter(o => o.id !== res.order.id)]);
        return res.order;
      }
      throw new Error('Failed to create order on server');
    } catch (err: any) {
      console.error('[StoreX OrderContext] Server order creation error, falling back locally:', err.message);
      // Fallback local order creation if backend offline
      const newOrderId = `STX-${Math.floor(1000 + Math.random() * 9000)}`;
      const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const fallbackOrder: Order = {
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

      setOrders((prev) => [fallbackOrder, ...prev]);
      return fallbackOrder;
    }
  };

  const getOrderById = (id: string) => {
    return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        getOrderById,
        refreshOrders: fetchOrdersFromApi,
        isLoading,
      }}
    >
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
