import { Product } from '@/types';

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'stx-iphone-16-pro',
    name: 'iPhone 16 Pro',
    category: 'Smartphones',
    price: 1250000,
    oldPrice: 1350000,
    discountBadge: '8%',
    rating: 4.8,
    reviewCount: 120,
    inStock: true,
    isNew: true,
    isFeatured: true,
    image: '/images/products/iphone-16-pro.jpg',
    images: [
      '/images/products/iphone-16-pro.jpg'
    ],
    description: 'The iPhone 16 Pro delivers powerful performance, pro-grade cameras and a stunning display. Built for creators, professionals and everyday users.',
    specs: [
      { name: 'Display', value: '6.3" Super Retina XDR display' },
      { name: 'Processor', value: 'A18 Pro chip' },
      { name: 'Storage', value: '256GB storage' },
      { name: 'OS', value: 'iOS 18' },
      { name: 'Warranty', value: '1 Year Apple Official Warranty' }
    ],
    colors: [
      { name: 'Space Black', hex: '#232325' },
      { name: 'Natural Titanium', hex: '#a8a6a1' },
      { name: 'White Titanium', hex: '#f0f0ed' }
    ]
  },
  {
    id: 'stx-macbook-air-m3',
    name: 'MacBook Air M3',
    category: 'Laptops',
    price: 1350000,
    oldPrice: 1500000,
    discountBadge: '10%',
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    isFeatured: true,
    image: '/images/products/macbook-air-m3.jpg',
    images: [
      '/images/products/macbook-air-m3.jpg'
    ],
    description: 'Supercharged by M3, the ultra-thin MacBook Air speeds through work and play. Up to 18 hours of battery life.',
    specs: [
      { name: 'Processor', value: 'Apple M3 8-core CPU / 10-core GPU' },
      { name: 'Memory', value: '16GB Unified Memory' },
      { name: 'Storage', value: '512GB SSD' },
      { name: 'Display', value: '13.6-inch Liquid Retina Display' },
      { name: 'Battery', value: 'Up to 18 hours' }
    ],
    colors: [
      { name: 'Space Gray', hex: '#53555b' },
      { name: 'Midnight', hex: '#1e2430' },
      { name: 'Starlight', hex: '#e3dcd1' }
    ]
  },
  {
    id: 'stx-sony-wh1000xm5',
    name: 'Sony WH-1000XM5',
    category: 'Headphones & Earbuds',
    price: 450000,
    oldPrice: 490000,
    discountBadge: '8%',
    rating: 4.7,
    reviewCount: 76,
    inStock: true,
    isFeatured: true,
    image: '/images/products/sony-wh1000xm5.jpg',
    images: [
      '/images/products/sony-wh1000xm5.jpg'
    ],
    description: 'Industry-leading noise canceling headphones with 2 processors, 8 microphones, and crystal-clear hands-free calling.',
    specs: [
      { name: 'Noise Cancellation', value: 'Auto NC Optimizer' },
      { name: 'Battery Life', value: 'Up to 30 hours' },
      { name: 'Connectivity', value: 'Bluetooth 5.2 / Multipoint' },
      { name: 'Weight', value: '250g Lightweight Design' }
    ],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Silver', hex: '#d1d5db' }
    ]
  },
  {
    id: 'stx-galaxy-buds3-pro',
    name: 'Samsung Galaxy Buds3',
    category: 'Headphones & Earbuds',
    price: 320000,
    oldPrice: 350000,
    discountBadge: '8%',
    rating: 4.6,
    reviewCount: 64,
    inStock: true,
    isFeatured: true,
    image: '/images/products/galaxy-buds3.jpg',
    images: [
      '/images/products/galaxy-buds3.jpg'
    ],
    description: 'Sculpted for sound and comfort with ANC and hi-fi studio audio transparency.',
    specs: [
      { name: 'Audio', value: '24-bit Hi-Fi Sound' },
      { name: 'ANC', value: 'Active Noise Cancelling with AI' },
      { name: 'Play Time', value: 'Up to 30 hours with case' }
    ]
  },
  {
    id: 'stx-apple-watch-s10',
    name: 'Apple Watch Series 10',
    category: 'Smartwatches',
    price: 620000,
    oldPrice: 675000,
    discountBadge: '8%',
    rating: 4.8,
    reviewCount: 62,
    inStock: true,
    isNew: true,
    isFeatured: true,
    image: '/images/products/apple-watch-s10.jpg',
    images: [
      '/images/products/apple-watch-s10.jpg'
    ],
    description: 'Our thinnest watch with our biggest display. Advanced health sensors, sleep apnea notifications, and faster charging.',
    specs: [
      { name: 'Case Size', value: '46mm Aluminum Case' },
      { name: 'Display', value: 'Wide-angle OLED Display' },
      { name: 'Water Resistance', value: '50m WR' }
    ]
  },
  {
    id: 'stx-playstation-5',
    name: 'PlayStation 5',
    category: 'Gaming',
    price: 850000,
    oldPrice: 920000,
    discountBadge: '7%',
    rating: 4.9,
    reviewCount: 110,
    inStock: true,
    isFeatured: true,
    image: '/images/products/playstation-5.jpg',
    images: [
      '/images/products/playstation-5.jpg'
    ],
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
    specs: [
      { name: 'Storage', value: '1TB Custom SSD' },
      { name: 'Graphics', value: '4K 120Hz Ray Tracing' },
      { name: 'Controller', value: 'DualSense Wireless Controller Included' }
    ]
  },
  {
    id: 'stx-anker-power-bank',
    name: 'Anker Power Bank',
    category: 'Power Banks',
    price: 75000,
    oldPrice: 85000,
    discountBadge: '11%',
    rating: 4.6,
    reviewCount: 38,
    inStock: true,
    isFeatured: true,
    image: '/images/products/anker-power-bank.jpg',
    images: [
      '/images/products/anker-power-bank.jpg'
    ],
    description: '24,000mAh Ultra-high capacity portable charger with 140W bi-directional fast charging and smart digital display.',
    specs: [
      { name: 'Capacity', value: '24,000mAh 86.4Wh' },
      { name: 'Output', value: '140W Max Fast Charge' },
      { name: 'Ports', value: '2x USB-C, 1x USB-A' }
    ]
  },
  {
    id: 'stx-logitech-mx-master-3s',
    name: 'Logitech MX Master 3S',
    category: 'Accessories',
    price: 120000,
    oldPrice: 135000,
    discountBadge: '11%',
    rating: 4.7,
    reviewCount: 46,
    inStock: true,
    isFeatured: true,
    image: '/images/products/logitech-mx-master-3s.jpg',
    images: [
      '/images/products/logitech-mx-master-3s.jpg'
    ],
    description: 'An icon remastered. Quiet Clicks, 8K DPI any-surface tracking, MagSpeed electromagnetic scrolling.',
    specs: [
      { name: 'DPI', value: '8000 DPI Darkfield Tracking' },
      { name: 'Battery', value: 'Rechargeable Li-Po 70 Days' },
      { name: 'Connectivity', value: 'Bluetooth & Logi Bolt Receiver' }
    ]
  },
  {
    id: 'stx-samsung-galaxy-s25',
    name: 'Samsung Galaxy S25 Ultra',
    category: 'Smartphones',
    price: 1450000,
    oldPrice: 1600000,
    discountBadge: '9%',
    rating: 4.9,
    reviewCount: 42,
    inStock: true,
    isNew: true,
    image: '/images/products/galaxy-s25.jpg',
    images: [
      '/images/products/galaxy-s25.jpg'
    ],
    description: 'Galaxy AI is here. Epic 200MP camera, Snapdragon 8 Gen 3 for Galaxy, and built-in S Pen.',
    specs: [
      { name: 'Display', value: '6.8" Dynamic AMOLED 2X 120Hz' },
      { name: 'Camera', value: '200MP Main + 50MP Periscope Telephoto' },
      { name: 'Storage', value: '512GB Storage / 12GB RAM' }
    ]
  },
  {
    id: 'stx-dell-ultrasharp-27',
    name: 'Dell UltraSharp 27 4K Monitor',
    category: 'Monitors',
    price: 580000,
    oldPrice: 620000,
    discountBadge: '6%',
    rating: 4.8,
    reviewCount: 31,
    inStock: true,
    image: '/images/products/dell-monitor.jpg',
    images: [
      '/images/products/dell-monitor.jpg'
    ],
    description: '27-inch 4K USB-C Hub monitor with IPS Black panel, 98% DCI-P3 color coverage and 90W Power Delivery.',
    specs: [
      { name: 'Resolution', value: '4K UHD (3840 x 2160) at 60Hz' },
      { name: 'Ports', value: 'USB-C (90W PD), DisplayPort, HDMI, RJ45 Ethernet' }
    ]
  },
  {
    id: 'stx-sony-alpha-7iv',
    name: 'Sony Alpha 7 IV Camera',
    category: 'Cameras',
    price: 2100000,
    oldPrice: 2250000,
    discountBadge: '7%',
    rating: 4.9,
    reviewCount: 28,
    inStock: true,
    image: '/images/products/sony-camera.jpg',
    images: [
      '/images/products/sony-camera.jpg'
    ],
    description: 'An ideal hybrid camera with 33MP Exmor R CMOS sensor, 4K 60p movie recording, and Real-time Eye AF.',
    specs: [
      { name: 'Sensor', value: '33.0MP Full-Frame Exmor R CMOS' },
      { name: 'Video', value: '4K 60p 10-bit 4:2:2 All-Intra' }
    ]
  },
  {
    id: 'stx-mechanical-keyboard',
    name: 'Keychron K2 Wireless Keyboard',
    category: 'Accessories',
    price: 110000,
    oldPrice: 125000,
    discountBadge: '12%',
    rating: 4.7,
    reviewCount: 53,
    inStock: true,
    image: '/images/products/keychron-keyboard.jpg',
    images: [
      '/images/products/keychron-keyboard.jpg'
    ],
    description: 'Compact 75% layout tactile mechanical keyboard with RGB backlighting, Bluetooth 5.1 & Type-C wired mode.',
    specs: [
      { name: 'Switches', value: 'Gateron G Pro Mechanical' },
      { name: 'Battery', value: '4000mAh Rechargeable' }
    ]
  }
];

export const CATEGORIES = [
  { name: 'Smartphones', icon: 'Smartphone', count: '12+ products', image: '/images/categories/smartphones.jpg' },
  { name: 'Laptops', icon: 'Laptop', count: '8+ products', image: '/images/categories/laptops.jpg' },
  { name: 'Headphones & Earbuds', icon: 'Headphones', count: '15+ products', image: '/images/categories/headphones.jpg' },
  { name: 'Smartwatches', icon: 'Watch', count: '10+ products', image: '/images/categories/smartwatches.jpg' },
  { name: 'Accessories', icon: 'Gamepad2', count: '20+ products', image: '/images/categories/accessories.jpg' }
];

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount).replace('NGN', '₦');
}
