export type ProductCategory =
  | 'Smartphones'
  | 'Laptops'
  | 'Headphones & Earbuds'
  | 'Smartwatches'
  | 'Gaming'
  | 'Accessories'
  | 'Cameras'
  | 'Monitors'
  | 'Power Banks'
  | 'Other';

export interface ProductSpec {
  name: string;
  value: string;
}

export interface Category {
  name: string;
  icon: string;
  count: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  oldPrice?: number;
  discountBadge?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  image: string;
  images: string[];
  description: string;
  specs: ProductSpec[];
  colors?: { name: string; hex: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
}

export type DeliveryMethodType = 'standard' | 'express' | 'pickup';

export interface DeliveryOption {
  id: DeliveryMethodType;
  name: string;
  duration: string;
  fee: number;
  description: string;
}

export type PaymentMethodType = 'card' | 'transfer' | 'wallet';

export type DeliveryStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED';

export interface TrackingEvent {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface OrderDelivery {
  deliveryId: string;
  provider: string;
  status: DeliveryStatus;
  trackingNumber: string;
  address: DeliveryAddress;
  estimatedDelivery: string;
  events: TrackingEvent[];
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  delivery: OrderDelivery;
  paymentMethod: PaymentMethodType;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: DeliveryAddress;
  walletBalance: number;
  savedAddresses: DeliveryAddress[];
  createdAt: string;
}
