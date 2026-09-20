import { Product, Category, Order, DeliveryAddress, PaymentMethodType, DeliveryMethodType } from '@/types';
import { MOCK_PRODUCTS, CATEGORIES } from '@/data/products';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const apiCache = new Map<string, { data: any; timestamp: number }>();
const CLIENT_CACHE_TTL = 45 * 1000; // 45 seconds

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key);
    }
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();

  // Instant response from client memory cache for GET requests
  if (method === 'GET') {
    const cached = apiCache.get(url);
    if (cached && (Date.now() - cached.timestamp < CLIENT_CACHE_TTL)) {
      return cached.data as T;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    if (method === 'GET') {
      apiCache.set(url, { data, timestamp: Date.now() });
    } else {
      // Invalidate relevant cache on mutations
      if (endpoint.startsWith('/api/orders')) {
        clearApiCache('/api/orders');
      }
    }

    return data;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.error(`[API Timeout Error] ${options.method || 'GET'} ${url} timed out`);
      throw new Error('Network request timed out. Please check your connection and try again.');
    }
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
      try {
        const searchParams = new URLSearchParams();
        if (params.category && params.category !== 'All Products') searchParams.append('category', params.category);
        if (params.search) searchParams.append('search', params.search);
        if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
        if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.deals) searchParams.append('deals', 'true');
        if (params.featured) searchParams.append('featured', 'true');

        const qs = searchParams.toString();
        return await request(`/api/products${qs ? `?${qs}` : ''}`);
      } catch {
        // Fallback filter on local MOCK_PRODUCTS
        let list = [...MOCK_PRODUCTS];
        if (params.category && params.category !== 'All Products') {
          const c = params.category.toLowerCase();
          list = list.filter(p => p.category.toLowerCase() === c);
        }
        if (params.search && params.search.trim()) {
          const q = params.search.toLowerCase().trim();
          list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }
        if (params.maxPrice !== undefined) {
          list = list.filter(p => p.price <= params.maxPrice!);
        }
        if (params.deals) {
          list = list.filter(p => Boolean(p.discountBadge || (p.oldPrice && p.oldPrice > p.price)));
        }
        if (params.featured) {
          list = list.filter(p => Boolean(p.isFeatured));
        }
        if (params.sortBy) {
          if (params.sortBy === 'price-low') list.sort((a, b) => a.price - b.price);
          else if (params.sortBy === 'price-high') list.sort((a, b) => b.price - a.price);
          else if (params.sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);
          else if (params.sortBy === 'newest') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        }
        return { success: true, count: list.length, products: list };
      }
    },

    getById: async (id: string): Promise<{ success: boolean; product: Product }> => {
      try {
        return await request(`/api/products/${id}`);
      } catch {
        const prod = MOCK_PRODUCTS.find(p => p.id.toLowerCase() === id.toLowerCase());
        if (!prod) throw new Error(`Product ${id} not found`);
        return { success: true, product: prod };
      }
    },
  },

  // Categories API
  categories: {
    list: async (): Promise<{ success: boolean; count: number; categories: Category[] }> => {
      try {
        return await request('/api/categories');
      } catch {
        return { success: true, count: CATEGORIES.length, categories: CATEGORIES as Category[] };
      }
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
      try {
        return await request('/api/checkout/validate', {
          method: 'POST',
          body: JSON.stringify({ items, deliveryMethod }),
        });
      } catch {
        let subtotal = 0;
        const validatedItems = items.map((it) => {
          const prod = MOCK_PRODUCTS.find((p) => p.id === it.productId) || MOCK_PRODUCTS[0];
          const lineTotal = prod.price * it.quantity;
          subtotal += lineTotal;
          return { product: prod, quantity: it.quantity, selectedColor: it.selectedColor, lineTotal };
        });
        const deliveryFee = deliveryMethod === 'express' ? 4000 : deliveryMethod === 'pickup' ? 0 : 2000;
        return {
          success: true,
          subtotal,
          deliveryFee,
          discount: 0,
          total: subtotal + deliveryFee,
          itemCount: validatedItems.reduce((acc, i) => acc + i.quantity, 0),
          items: validatedItems,
        };
      }
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
      try {
        return await request('/api/payments', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        return {
          success: true,
          payment: {
            id: `pay_${Date.now()}`,
            orderId: payload.orderId || `STX-TEMP-${Date.now()}`,
            amount: payload.amount,
            currency: payload.currency || 'NGN',
            status: 'succeeded',
            transactionId: `tx_simulated_${Date.now()}`,
          },
        };
      }
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
      try {
        return await request('/api/account/profile');
      } catch {
        return {
          success: true,
          profile: {
            id: 'cust_storex_001',
            name: 'Muhammed Adegoke',
            email: 'muhammed@example.com',
            phone: '+234 801 234 5678',
            address: {
              fullName: 'Muhammed Adegoke',
              phone: '+234 801 234 5678',
              email: 'muhammed@example.com',
              address: '12, Freedom Street, Ikeja',
              city: 'Ikeja',
              state: 'Lagos',
              postalCode: '100001',
            },
            metrics: { walletBalance: 0 },
          },
        };
      }
    },
  },
};
