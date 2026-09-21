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

## 👁️ ThirdEye Security Integration

StoreX connects directly to the **ThirdEye Continuous Trust Layer** to protect third-party API traffic and AI Agent tool execution.

### 1. Connecting StoreX to ThirdEye via Autonomous Agent Skill

Run the ThirdEye Agent Skill CLI to auto-discover StoreX API routes (`/api/payments`, `/api/delivery`, `/api/analytics`, `/api/campaigns`, `/api/agent`) and connect to ThirdEye:

```bash
npm run thirdeye:connect
```

This generates `thirdeye.config.json` and registers project `te_proj_storex_99a8b7c6` with ThirdEye (`http://localhost:4000`).

### 2. Connected APIs & Security Simulation

Once connected, all StoreX integrations are monitored live on the **ThirdEye Security Dashboard** (`http://localhost:3000`). Executing security simulations on `/simulator` (e.g. 3-year stale key leak or AI Agent prompt drift) automatically escalates threat risk levels and places misbehaving integrations into **QUARANTINE**.

---

### Running Locally

```bash
npm install
npm run dev               # Run StoreX storefront
npm run thirdeye:connect  # Run ThirdEye Agent Skill to discover & connect APIs
```

Open [http://localhost:3000](http://localhost:3000) for ThirdEye Dashboard and StoreX storefront.
