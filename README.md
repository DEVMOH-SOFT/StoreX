# 🛒 StoreX

> **Smart Gadgets. Better Shopping.**

StoreX is a simulated gadget e-commerce platform built for the **ICSC Conference 2nd Edition** project.

StoreX provides the realistic shopping environment that powers our **Third Eye** security system.

The application simulates real e-commerce activities such as:

- Product browsing
- Shopping cart
- Checkout
- Payments
- Orders
- Delivery
- Customer activity
- Third-party integrations

The goal is to generate realistic API activity that can be observed, logged and analyzed by Third Eye.

---

# 🎯 1. PROJECT GOAL

StoreX is NOT intended to be a full-scale Jumia/Amazon clone.

We only need enough e-commerce functionality to create realistic activity.

The main flow is:

```text
Customer
   ↓
Browse Products
   ↓
Add to Cart
   ↓
Checkout
   ↓
Payment
   ↓
Order Created
   ↓
Delivery
   ↓
Order Tracking
```

---

## 🛠️ Tech Stack & Setup

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom StoreX Deep Blue Design Tokens
- **Icons**: `lucide-react`
- **State Management**: React Context Stores (`CartContext`, `WishlistContext`, `OrderContext`)

### Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3002`) to view the platform.
