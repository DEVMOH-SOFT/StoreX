-- =========================================================================
-- StoreX E-Commerce Supabase Schema & Seed Script
-- Run this in your Supabase Project SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- 1. Create Tables

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  discount_badge TEXT,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  specs JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  count TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Processing',
  payment_method TEXT NOT NULL DEFAULT 'card',
  delivery JSONB NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  transaction_id TEXT NOT NULL,
  method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address JSONB,
  wallet_balance NUMERIC DEFAULT 0,
  saved_addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Allow public read for storefront, authenticated/anon inserts for checkout)
DROP POLICY IF EXISTS "Public products read access" ON public.products;
CREATE POLICY "Public products read access" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public categories read access" ON public.categories;
CREATE POLICY "Public categories read access" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public orders read access" ON public.orders;
CREATE POLICY "Public orders read access" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public orders insert access" ON public.orders;
CREATE POLICY "Public orders insert access" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public orders update access" ON public.orders;
CREATE POLICY "Public orders update access" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public payments insert access" ON public.payments;
CREATE POLICY "Public payments insert access" ON public.payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public profiles read access" ON public.profiles;
CREATE POLICY "Public profiles read access" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public profiles update access" ON public.profiles;
CREATE POLICY "Public profiles update access" ON public.profiles FOR ALL USING (true);

-- 4. Seed Data: Categories
INSERT INTO public.categories (name, icon, count, image)
VALUES
  ('Smartphones', 'Smartphone', '12+ products', '/images/categories/smartphones.jpg'),
  ('Laptops', 'Laptop', '8+ products', '/images/categories/laptops.jpg'),
  ('Headphones & Earbuds', 'Headphones', '15+ products', '/images/categories/headphones.jpg'),
  ('Smartwatches', 'Watch', '10+ products', '/images/categories/smartwatches.jpg'),
  ('Accessories', 'Gamepad2', '20+ products', '/images/categories/accessories.jpg')
ON CONFLICT (name) DO NOTHING;

-- 5. Seed Data: Products
INSERT INTO public.products (
  id, name, category, price, old_price, discount_badge, rating, review_count, in_stock, is_new, is_featured, image, images, description, specs, colors
) VALUES
(
  'stx-iphone-16-pro',
  'iPhone 16 Pro',
  'Smartphones',
  1250000,
  1350000,
  '8%',
  4.8,
  120,
  true,
  true,
  true,
  '/images/products/iphone-16-pro.jpg',
  '["/images/products/iphone-16-pro.jpg"]'::jsonb,
  'The iPhone 16 Pro delivers powerful performance, pro-grade cameras and a stunning display. Built for creators, professionals and everyday users.',
  '[{"name":"Display","value":"6.3-inch Super Retina XDR display"},{"name":"Processor","value":"A18 Pro chip"},{"name":"Storage","value":"256GB storage"},{"name":"OS","value":"iOS 18"},{"name":"Warranty","value":"1 Year Apple Official Warranty"}]'::jsonb,
  '[{"name":"Space Black","hex":"#232325"},{"name":"Natural Titanium","hex":"#a8a6a1"},{"name":"White Titanium","hex":"#f0f0ed"}]'::jsonb
),
(
  'stx-macbook-air-m3',
  'MacBook Air M3',
  'Laptops',
  1350000,
  1500000,
  '10%',
  4.9,
  89,
  true,
  false,
  true,
  '/images/products/macbook-air-m3.jpg',
  '["/images/products/macbook-air-m3.jpg"]'::jsonb,
  'Supercharged by M3, the ultra-thin MacBook Air speeds through work and play. Up to 18 hours of battery life.',
  '[{"name":"Processor","value":"Apple M3 8-core CPU / 10-core GPU"},{"name":"Memory","value":"16GB Unified Memory"},{"name":"Storage","value":"512GB SSD"},{"name":"Display","value":"13.6-inch Liquid Retina Display"},{"name":"Battery","value":"Up to 18 hours"}]'::jsonb,
  '[{"name":"Space Gray","hex":"#53555b"},{"name":"Midnight","hex":"#1e2430"},{"name":"Starlight","hex":"#e3dcd1"}]'::jsonb
),
(
  'stx-sony-wh1000xm5',
  'Sony WH-1000XM5',
  'Headphones & Earbuds',
  450000,
  490000,
  '8%',
  4.7,
  76,
  true,
  false,
  true,
  '/images/products/sony-wh1000xm5.jpg',
  '["/images/products/sony-wh1000xm5.jpg"]'::jsonb,
  'Industry-leading noise canceling headphones with 2 processors, 8 microphones, and crystal-clear hands-free calling.',
  '[{"name":"Noise Cancellation","value":"Auto NC Optimizer"},{"name":"Battery Life","value":"Up to 30 hours"},{"name":"Connectivity","value":"Bluetooth 5.2 / Multipoint"},{"name":"Weight","value":"250g Lightweight Design"}]'::jsonb,
  '[{"name":"Black","hex":"#111111"},{"name":"Silver","hex":"#d1d5db"}]'::jsonb
),
(
  'stx-galaxy-buds3-pro',
  'Samsung Galaxy Buds3',
  'Headphones & Earbuds',
  320000,
  350000,
  '8%',
  4.6,
  64,
  true,
  false,
  true,
  '/images/products/galaxy-buds3.jpg',
  '["/images/products/galaxy-buds3.jpg"]'::jsonb,
  'Sculpted for sound and comfort with ANC and hi-fi studio audio transparency.',
  '[{"name":"Audio","value":"24-bit Hi-Fi Sound"},{"name":"ANC","value":"Active Noise Cancelling with AI"},{"name":"Play Time","value":"Up to 30 hours with case"}]'::jsonb,
  '[]'::jsonb
),
(
  'stx-apple-watch-s10',
  'Apple Watch Series 10',
  'Smartwatches',
  620000,
  675000,
  '8%',
  4.8,
  62,
  true,
  true,
  true,
  '/images/products/apple-watch-s10.jpg',
  '["/images/products/apple-watch-s10.jpg"]'::jsonb,
  'Our thinnest watch with our biggest display. Advanced health sensors, sleep apnea notifications, and faster charging.',
  '[{"name":"Case Size","value":"46mm Aluminum Case"},{"name":"Display","value":"Wide-angle OLED Display"},{"name":"Water Resistance","value":"50m WR"}]'::jsonb,
  '[]'::jsonb
),
(
  'stx-playstation-5',
  'PlayStation 5',
  'Gaming',
  850000,
  920000,
  '7%',
  4.9,
  110,
  true,
  false,
  true,
  '/images/products/playstation-5.jpg',
  '["/images/products/playstation-5.jpg"]'::jsonb,
  'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.',
  '[{"name":"Storage","value":"1TB Custom SSD"},{"name":"Graphics","value":"4K 120Hz Ray Tracing"},{"name":"Controller","value":"DualSense Wireless Controller Included"}]'::jsonb,
  '[]'::jsonb
),
(
  'stx-anker-power-bank',
  'Anker Power Bank',
  'Power Banks',
  75000,
  85000,
  '11%',
  4.6,
  38,
  true,
  false,
  true,
  '/images/products/anker-power-bank.jpg',
  '["/images/products/anker-power-bank.jpg"]'::jsonb,
  '24,000mAh Ultra-high capacity portable charger with 140W bi-directional fast charging and smart digital display.',
  '[{"name":"Capacity","value":"24,000mAh 86.4Wh"},{"name":"Output","value":"140W Max Fast Charge"},{"name":"Ports","value":"2x USB-C, 1x USB-A"}]'::jsonb,
  '[]'::jsonb
),
(
  'stx-logitech-mx-master-3s',
  'Logitech MX Master 3S',
  'Accessories',
  120000,
  135000,
  '11%',
  4.7,
  46,
  true,
  false,
  true,
  '/images/products/logitech-mx-master-3s.jpg',
  '["/images/products/logitech-mx-master-3s.jpg"]'::jsonb,
  'An icon remastered. Quiet Clicks, 8K DPI any-surface tracking, MagSpeed electromagnetic scrolling.',
  '[{"name":"DPI","value":"8000 DPI Darkfield Tracking"},{"name":"Battery","value":"Rechargeable Li-Po 70 Days"},{"name":"Connectivity","value":"Bluetooth & Logi Bolt Receiver"}]'::jsonb,
  '[]'::jsonb
),
(
  'stx-samsung-galaxy-s25',
  'Samsung Galaxy S25 Ultra',
  'Smartphones',
  1450000,
  1600000,
  '9%',
  4.9,
  42,
  true,
  true,
  false,
  '/images/products/galaxy-s25.jpg',
  '["/images/products/galaxy-s25.jpg"]'::jsonb,
  'Galaxy AI is here. Epic 200MP camera, Snapdragon 8 Gen 3 for Galaxy, and built-in S Pen.',
  '[{"name":"Display","value":"6.8-inch Dynamic AMOLED 2X 120Hz"},{"name":"Camera","value":"200MP Main + 50MP Periscope Telephoto"},{"name":"Storage","value":"512GB Storage / 12GB RAM"}]'::jsonb,
  '[]'::jsonb
),
(
  'stx-dell-ultrasharp-27',
  'Dell UltraSharp 27 4K Monitor',
  'Monitors',
  580000,
  620000,
  '6%',
  4.8,
  31,
  true,
  false,
  false,
  '/images/products/dell-monitor.jpg',
  '["/images/products/dell-monitor.jpg"]'::jsonb,
  '27-inch 4K USB-C Hub monitor with IPS Black panel, 98% DCI-P3 color coverage and 90W Power Delivery.',
  '[{"name":"Resolution","value":"4K UHD (3840 x 2160) at 60Hz"},{"name":"Ports","value":"USB-C (90W PD), DisplayPort, HDMI, RJ45 Ethernet"}]'::jsonb,
  '[]'::jsonb
),
(
  'stx-sony-alpha-7iv',
  'Sony Alpha 7 IV Camera',
  'Cameras',
  2100000,
  2250000,
  '7%',
  4.9,
  28,
  true,
  false,
  false,
  '/images/products/sony-camera.jpg',
  '["/images/products/sony-camera.jpg"]'::jsonb,
  'An ideal hybrid camera with 33MP Exmor R CMOS sensor, 4K 60p movie recording, and Real-time Eye AF.',
  '[{"name":"Sensor","value":"33.0MP Full-Frame Exmor R CMOS"},{"name":"Video","value":"4K 60p 10-bit 4:2:2 All-Intra"}]'::jsonb,
  '[]'::jsonb
),
(
  'stx-mechanical-keyboard',
  'Keychron K2 Wireless Keyboard',
  'Accessories',
  110000,
  125000,
  '12%',
  4.7,
  53,
  true,
  false,
  false,
  '/images/products/keychron-keyboard.jpg',
  '["/images/products/keychron-keyboard.jpg"]'::jsonb,
  'Compact 75% layout tactile mechanical keyboard with RGB backlighting, Bluetooth 5.1 & Type-C wired mode.',
  '[{"name":"Switches","value":"Gateron G Pro Mechanical"},{"name":"Battery","value":"4000mAh Rechargeable"}]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Profile
INSERT INTO public.profiles (id, name, email, phone, address, wallet_balance, saved_addresses)
VALUES (
  'cust_storex_001',
  'Muhammed Adegoke',
  'muhammed@example.com',
  '+234 801 234 5678',
  '{"fullName":"Muhammed Adegoke","phone":"+234 801 234 5678","email":"muhammed@example.com","address":"12, Freedom Street, Ikeja","city":"Ikeja","state":"Lagos","postalCode":"100001"}'::jsonb,
  0,
  '[{"fullName":"Muhammed Adegoke","phone":"+234 801 234 5678","email":"muhammed@example.com","address":"12, Freedom Street, Ikeja","city":"Ikeja","state":"Lagos","postalCode":"100001"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
