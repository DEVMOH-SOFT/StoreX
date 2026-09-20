import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, Order, Customer, DeliveryStatus, TrackingEvent, PaymentMethodType } from '@/types';
import { SEED_PRODUCTS, SEED_CATEGORIES, SEED_ORDERS, SEED_CUSTOMER } from '@/lib/seedData';

import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
  }
  return null;
}

// Process-safe local fallback for runtime orders
const RUNTIME_ORDERS_FILE = path.join(process.cwd(), 'data', 'runtime_orders.json');

function getLocalOrders(): Map<string, Order> {
  try {
    if (fs.existsSync(RUNTIME_ORDERS_FILE)) {
      const raw = fs.readFileSync(RUNTIME_ORDERS_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return new Map(list.map((o: Order) => [o.id, o]));
      }
    }
  } catch (e) {
    // fallback
  }
  return new Map(SEED_ORDERS.map(o => [o.id, { ...o }]));
}

function saveLocalOrders(map: Map<string, Order>) {
  try {
    const list = Array.from(map.values());
    fs.writeFileSync(RUNTIME_ORDERS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (e) {
    // fallback
  }
}

const inMemoryProducts: Map<string, Product> = new Map(SEED_PRODUCTS.map(p => [p.id, { ...p }]));
const inMemoryCustomer: Customer = { ...SEED_CUSTOMER };

// Database Operations
export async function fetchProducts(filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  deals?: boolean;
  featured?: boolean;
}): Promise<Product[]> {
  const client = getSupabase();

  if (client) {
    try {
      let query = client.from('products').select('*');

      if (filters?.category && filters.category !== 'All Products') {
        query = query.ilike('category', filters.category);
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      if (typeof filters?.minPrice === 'number') {
        query = query.gte('price', filters.minPrice);
      }

      if (typeof filters?.maxPrice === 'number') {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.search && filters.search.trim()) {
        const q = filters.search.trim();
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
      }

      // Sort
      if (filters?.sortBy === 'price-low') {
        query = query.order('price', { ascending: true });
      } else if (filters?.sortBy === 'price-high') {
        query = query.order('price', { ascending: false });
      } else if (filters?.sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      } else if (filters?.sortBy === 'newest') {
        query = query.order('is_new', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: Number(item.price),
          oldPrice: item.old_price ? Number(item.old_price) : undefined,
          discountBadge: item.discount_badge || undefined,
          rating: Number(item.rating || 5),
          reviewCount: Number(item.review_count || 0),
          inStock: Boolean(item.in_stock),
          isNew: Boolean(item.is_new),
          isFeatured: Boolean(item.is_featured),
          image: item.image,
          images: item.images || [item.image],
          description: item.description,
          specs: item.specs || [],
          colors: item.colors || [],
        }));
      }
    } catch (err) {
      console.warn('[Supabase API] Failed to query products from Supabase, using seed catalog fallback:', err);
    }
  }

  // Local Seed Fallback
  let list = Array.from(inMemoryProducts.values());

  if (filters?.category && filters.category !== 'All Products') {
    const cat = filters.category.toLowerCase();
    list = list.filter(p => p.category.toLowerCase() === cat);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  if (typeof filters?.minPrice === 'number') {
    list = list.filter(p => p.price >= filters.minPrice!);
  }

  if (typeof filters?.maxPrice === 'number') {
    list = list.filter(p => p.price <= filters.maxPrice!);
  }

  if (filters?.deals) {
    list = list.filter(p => Boolean(p.discountBadge || (p.oldPrice && p.oldPrice > p.price)));
  }

  if (filters?.featured) {
    list = list.filter(p => Boolean(p.isFeatured));
  }

  if (filters?.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
  }

  return list;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('products').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          category: data.category,
          price: Number(data.price),
          oldPrice: data.old_price ? Number(data.old_price) : undefined,
          discountBadge: data.discount_badge || undefined,
          rating: Number(data.rating || 5),
          reviewCount: Number(data.review_count || 0),
          inStock: Boolean(data.in_stock),
          isNew: Boolean(data.is_new),
          isFeatured: Boolean(data.is_featured),
          image: data.image,
          images: data.images || [data.image],
          description: data.description,
          specs: data.specs || [],
          colors: data.colors || [],
        };
      }
    } catch (e) {
      console.warn(`[Supabase API] Failed to fetch product ${id} from Supabase:`, e);
    }
  }

  return inMemoryProducts.get(id) || null;
}

export async function fetchCategories(): Promise<Category[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('categories').select('*');
      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          name: c.name,
          icon: c.icon,
          count: c.count,
          image: c.image,
        }));
      }
    } catch (e) {
      console.warn('[Supabase API] Failed to fetch categories from Supabase:', e);
    }
  }
  return SEED_CATEGORIES;
}

export async function fetchOrders(): Promise<Order[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          date: d.date,
          items: d.items,
          subtotal: Number(d.subtotal),
          deliveryFee: Number(d.delivery_fee || 0),
          discount: Number(d.discount || 0),
          total: Number(d.total),
          status: d.status,
          paymentMethod: d.payment_method,
          delivery: d.delivery,
        }));
      }
    } catch (e) {
      console.warn('[Supabase API] Failed to fetch orders from Supabase:', e);
    }
  }
  return Array.from(getLocalOrders().values());
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('orders').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          date: data.date,
          items: data.items,
          subtotal: Number(data.subtotal),
          deliveryFee: Number(data.delivery_fee || 0),
          discount: Number(data.discount || 0),
          total: Number(data.total),
          status: data.status,
          paymentMethod: data.payment_method,
          delivery: data.delivery,
        };
      }
    } catch (e) {
      console.warn(`[Supabase API] Failed to fetch order ${id} from Supabase:`, e);
    }
  }
  return getLocalOrders().get(id) || null;
}

export async function insertOrder(order: Order): Promise<Order> {
  const local = getLocalOrders();
  local.set(order.id, order);
  saveLocalOrders(local);

  const client = getSupabase();
  if (client) {
    try {
      await client.from('orders').insert({
        id: order.id,
        date: order.date,
        items: order.items,
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee,
        discount: order.discount,
        total: order.total,
        status: order.status,
        payment_method: order.paymentMethod,
        delivery: order.delivery,
      });
    } catch (e) {
      console.warn('[Supabase API] Error saving order to Supabase:', e);
    }
  }

  return order;
}

export async function updateOrderStatusInDb(
  id: string,
  status: Order['status'],
  deliveryStatus: DeliveryStatus,
  event?: TrackingEvent
): Promise<Order | null> {
  const existing = await fetchOrderById(id);
  if (!existing) return null;

  existing.status = status;
  existing.delivery.status = deliveryStatus;
  if (event) {
    existing.delivery.events.push(event);
  }

  const local = getLocalOrders();
  local.set(id, existing);
  saveLocalOrders(local);

  const client = getSupabase();
  if (client) {
    try {
      await client.from('orders').update({
        status,
        delivery: existing.delivery,
      }).eq('id', id);
    } catch (e) {
      console.warn('[Supabase API] Error updating order status in Supabase:', e);
    }
  }

  return existing;
}

export async function recordPayment(payment: {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  transactionId: string;
  method: string;
}) {
  const client = getSupabase();
  if (client) {
    try {
      await client.from('payments').insert({
        id: payment.id,
        order_id: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        transaction_id: payment.transactionId,
        method: payment.method,
      });
    } catch (e) {
      console.warn('[Supabase API] Error saving payment in Supabase:', e);
    }
  }
}

export async function fetchCustomerProfile(): Promise<Customer> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('profiles').select('*').maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          address: data.address,
          walletBalance: Number(data.wallet_balance || 0),
          savedAddresses: data.saved_addresses || [],
          createdAt: data.created_at || new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('[Supabase API] Error fetching profile from Supabase:', e);
    }
  }
  return inMemoryCustomer;
}
