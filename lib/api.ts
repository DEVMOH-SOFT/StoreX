import { Product, Category, Order, DeliveryAddress, PaymentMethodType, DeliveryMethodType } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data;
  } catch (err: any) {
    console.error(`[API Client Error] ${options.method || 'GET'} ${url}:`, err.message);
    throw err;
  }
}

export const api = {
  // Products API
  products: {
    list: async (params: {
      category?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
      deals?: boolean;
      featured?: boolean;
    } = {}): Promise<{ success: boolean; count: number; products: Product[] }> => {
      const searchParams = new URLSearchParams();
      if (params.category && params.category !== 'All Products') searchParams.append('category', params.category);
      if (params.search) searchParams.append('search', params.search);
      if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.deals) searchParams.append('deals', 'true');
      if (params.featured) searchParams.append('featured', 'true');

      const qs = searchParams.toString();
      return request(`/api/products${qs ? `?${qs}` : ''}`);
    },

    getById: async (id: string): Promise<{ success: boolean; product: Product }> => {
      return request(`/api/products/${id}`);
    },
  },

  // Categories API
  categories: {
    list: async (): Promise<{ success: boolean; count: number; categories: Category[] }> => {
      return request('/api/categories');
    },
  },

  // Checkout API
  checkout: {
    validate: async (
      items: Array<{ productId: string; quantity: number; selectedColor?: string }>,
      deliveryMethod: DeliveryMethodType = 'standard'
    ): Promise<{
      success: boolean;
      subtotal: number;
      deliveryFee: number;
      discount: number;
      total: number;
      itemCount: number;
      items: any[];
    }> => {
      return request('/api/checkout/validate', {
        method: 'POST',
        body: JSON.stringify({ items, deliveryMethod }),
      });
    },
  },

  // Payments API
  payments: {
    create: async (payload: {
      orderId?: string;
      amount: number;
      currency?: string;
      method: PaymentMethodType;
      cardDetails?: { cardNumber: string; expiry: string; cvv: string };
    }): Promise<{
      success: boolean;
      payment: {
        id: string;
        orderId: string;
        amount: number;
        currency: string;
        status: string;
        transactionId: string;
      };
    }> => {
      return request('/api/payments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // Orders API
  orders: {
    list: async (): Promise<{ success: boolean; count: number; orders: Order[] }> => {
      return request('/api/orders');
    },

    getById: async (id: string): Promise<{ success: boolean; order: Order }> => {
      return request(`/api/orders/${id}`);
    },

    create: async (payload: {
      items: any[];
      subtotal: number;
      deliveryFee: number;
      discount: number;
      address: DeliveryAddress;
      paymentMethod: PaymentMethodType;
      deliveryMethod: DeliveryMethodType;
    }): Promise<{ success: boolean; order: Order }> => {
      return request('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    updateStatus: async (
      id: string,
      status: Order['status'],
      note?: string
    ): Promise<{ success: boolean; order: Order }> => {
      return request(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
    },
  },

  // Account API
  account: {
    getProfile: async (): Promise<{ success: boolean; profile: any }> => {
      return request('/api/account/profile');
    },
  },
};
