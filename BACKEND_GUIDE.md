# StoreX Backend Architecture & API Guide 🚀

Welcome to the StoreX Backend Guide! This document explains how the StoreX backend works in simple, clear terms, how the data flows, and how to test or extend any endpoint.

---

## 💡 The Core Idea: One Unified Next.js Full-Stack App

Previously, StoreX used two separate projects:
1. A Next.js frontend running on `http://localhost:3000`
2. A separate Express server running on `http://localhost:5000`

### What We Changed:
We deleted the separate `server/` folder and moved the backend **directly into Next.js App Router API Routes**.

Now, **everything runs together on port `3000`**:
- When you run `npm run dev`, it serves both your visual web pages (`/`, `/products`, `/checkout`) and all your backend API routes (`/api/products`, `/api/orders`, etc.).
- There are **no CORS issues**, **no second terminal window needed**, and **no port conflicts**.

---

## 🗂️ Backend Folder Structure

```
StoreX/
├── app/
│   └── api/                        # 🌐 ALL BACKEND ENDPOINTS LIVE HERE
│       ├── products/
│       │   ├── route.ts            # GET /api/products (list, filter, search, sort)
│       │   └── [id]/
│       │       └── route.ts        # GET /api/products/:id
│       ├── categories/
│       │   └── route.ts            # GET /api/categories
│       ├── checkout/
│       │   └── validate/
│       │       └── route.ts        # POST /api/checkout/validate (secure cart pricing)
│       ├── payments/
│       │   └── route.ts            # POST /api/payments (transaction processing)
│       ├── orders/
│       │   ├── route.ts            # GET /api/orders & POST /api/orders
│       │   └── [id]/
│       │       ├── route.ts        # GET /api/orders/:id
│       │       └── status/
│       │           └── route.ts    # PATCH /api/orders/:id/status (delivery updates)
│       └── account/
│           └── profile/
│               └── route.ts        # GET /api/account/profile
│
├── lib/
│   ├── supabase.ts                 # 🗄️ Database query engine (queries Supabase + fallback)
│   ├── seedData.ts                 # 📦 12 StoreX products, categories & demo orders
│   └── api.ts                      # 🔌 Frontend API client helper (fetches /api/*)
│
├── utils/supabase/
│   ├── server.ts                   # 🖥️ Server-side Supabase client (with cookies)
│   ├── client.ts                   # 💻 Browser-side Supabase client
│   └── middleware.ts               # 🔄 Session refresh logic
│
├── middleware.ts                   # 🛡️ Next.js edge middleware refreshing Supabase tokens
├── supabase/
│   └── schema.sql                  # 📜 PostgreSQL DDL script for Supabase SQL Editor
└── scripts/
    └── test-api.mjs                # 🧪 15-point automated test suite for all endpoints
```

---

## 🔄 How the Data Flow Works

Whenever a page or API is requested:

```
[Browser / User]
       │
       ▼  (e.g., fetch('/api/products?featured=true'))
[Next.js App Router Route Handler (app/api/products/route.ts)]
       │
       ▼
[lib/supabase.ts: fetchProducts()]
       │
       ├── 1. Attempt query to Supabase Database (products table)
       │      │
       │      ├── If connected & table exists ────► Returns Supabase database rows
       │      │
       │      └── If table not created yet ──────► Gracefully returns catalog from lib/seedData.ts
       │
       ▼
[JSON Response: { success: true, count: 12, products: [...] }]
```

> **Why this design is great:**
> Even before you execute the SQL script in your Supabase dashboard, StoreX will work 100% smoothly with zero crashes because of the built-in fallback. Once your Supabase tables are created, it automatically uses the live cloud database!

---

## 📡 API Reference Cheatsheet

### 1. Products API

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/products` | `GET` | `category`, `search`, `minPrice`, `maxPrice`, `sortBy`, `deals`, `featured` | Returns product catalog with filtering & sorting |
| `/api/products/:id` | `GET` | — | Returns full product details, specs, and available colors |

#### Examples:
- **Featured products**: `GET /api/products?featured=true`
- **Smartphones category**: `GET /api/products?category=Smartphones`
- **Search keyword**: `GET /api/products?search=MacBook`
- **Price sorting**: `GET /api/products?sortBy=price-low` (or `price-high`, `rating`, `newest`)
- **Single item**: `GET /api/products/stx-iphone-16-pro`

---

### 2. Categories API

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/categories` | `GET` | Returns list of 5 product categories with icons and item counts |

---

### 3. Checkout & Pricing API

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/checkout/validate` | `POST` | Validates cart items against database prices and calculates delivery fee & total |

#### Sample Request Body:
```json
{
  "items": [
    { "productId": "stx-iphone-16-pro", "quantity": 1, "selectedColor": "Space Black" },
    { "productId": "stx-anker-power-bank", "quantity": 1 }
  ],
  "deliveryMethod": "standard"
}
```

#### Sample Response:
```json
{
  "success": true,
  "subtotal": 1325000,
  "deliveryFee": 2000,
  "discount": 0,
  "total": 1327000,
  "itemCount": 2,
  "items": [...]
}
```

---

### 4. Payments API

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/payments` | `POST` | Simulates payment verification and generates verified transaction ID (`TXN-...`) |

#### Sample Request Body:
```json
{
  "amount": 1327000,
  "currency": "NGN",
  "method": "card",
  "cardDetails": { "cardNumber": "4111222233334444", "expiry": "12/28", "cvv": "123" }
}
```

---

### 5. Orders API

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/orders` | `GET` | Returns all orders |
| `/api/orders` | `POST` | Creates a new order with auto-generated order ID, tracking number, and delivery events |
| `/api/orders/:id` | `GET` | Returns an order by ID |
| `/api/orders/:id/status` | `PATCH` | Updates order fulfillment status (`Processing`, `Shipped`, `Out for Delivery`, `Delivered`) |

#### Creating an Order (`POST /api/orders`):
```json
{
  "items": [{ "productId": "stx-iphone-16-pro", "quantity": 1 }],
  "subtotal": 1250000,
  "deliveryFee": 2000,
  "address": {
    "fullName": "John Doe",
    "phone": "+234 801 234 5678",
    "email": "john@example.com",
    "address": "12 Freedom St",
    "city": "Ikeja",
    "state": "Lagos"
  },
  "paymentMethod": "card",
  "deliveryMethod": "standard"
}
```

---

### 6. Customer Account API

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/account/profile` | `GET` | Returns customer profile, default delivery address, and account creation date |

---

## ⚡ How to Connect Live Tables in Supabase (1 Minute Setup)

1. Go to your Supabase project: [https://supabase.com/dashboard/project/zvogggrpxeuphpzwwiyh](https://supabase.com/dashboard/project/zvogggrpxeuphpzwwiyh)
2. In the left navigation, click on **SQL Editor**.
3. Click **New Query**.
4. Open [supabase/schema.sql](file:///c:/Users/makin/Desktop/StoreX/supabase/schema.sql), copy everything, and paste it into the editor.
5. Click **Run** (green button).
6. That's it! Your PostgreSQL tables (`products`, `categories`, `orders`, `payments`, `profiles`) and all seed data are now live in the cloud.

---

## 🧪 How to Run Automated Tests Anytime

You can test all 15 endpoints at any time with a single command:

```bash
npm run test:api
```

### What It Verifies:
- Catalog listing & counts
- Search by keyword
- Filtering by category, deals, and featured flags
- Price sorting
- Single product retrieval + 404 handling
- Categories listing
- Checkout calculation and price tampering prevention
- Payment simulation and transaction ID generation
- Order creation with live tracking events
- Order status updates & courier delivery mapping
- Customer profile retrieval
