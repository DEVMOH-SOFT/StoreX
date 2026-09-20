// scripts/test-api.mjs
// Automated test runner for StoreX Next.js API Routes

const BASE_URL = 'http://localhost:3000';

async function testApi() {
  console.log('====================================================');
  console.log('🚀 Running StoreX Full-Stack Backend API Test Suite');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Reason: ${err.message}\n`);
      failed++;
    }
  }

  // 1. GET /api/products
  await assertTest('GET /api/products (List all products)', async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.products) || data.products.length < 10) {
      throw new Error(`Invalid response or product count: ${data.products?.length}`);
    }
  });

  // 2. GET /api/products?featured=true
  await assertTest('GET /api/products?featured=true (Featured filter)', async () => {
    const res = await fetch(`${BASE_URL}/api/products?featured=true`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.products.length === 0) throw new Error('No featured products found');
    const allFeatured = data.products.every(p => p.isFeatured);
    if (!allFeatured) throw new Error('Found non-featured product in featured query');
  });

  // 3. GET /api/products?category=Smartphones
  await assertTest('GET /api/products?category=Smartphones (Category filter)', async () => {
    const res = await fetch(`${BASE_URL}/api/products?category=Smartphones`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.products.length === 0) throw new Error('No smartphones found');
    const allPhones = data.products.every(p => p.category.toLowerCase() === 'smartphones');
    if (!allPhones) throw new Error('Non-smartphone item returned');
  });

  // 4. GET /api/products?search=MacBook
  await assertTest('GET /api/products?search=MacBook (Keyword search)', async () => {
    const res = await fetch(`${BASE_URL}/api/products?search=MacBook`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.products.length === 0) throw new Error('Search failed');
    if (!data.products.some(p => p.name.includes('MacBook'))) throw new Error('Expected MacBook not found');
  });

  // 5. GET /api/products?sortBy=price-low
  await assertTest('GET /api/products?sortBy=price-low (Sorting)', async () => {
    const res = await fetch(`${BASE_URL}/api/products?sortBy=price-low`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    for (let i = 0; i < data.products.length - 1; i++) {
      if (data.products[i].price > data.products[i + 1].price) {
        throw new Error('Products not sorted by price ascending');
      }
    }
  });

  // 6. GET /api/products/:id (Existing)
  await assertTest('GET /api/products/stx-iphone-16-pro (Get by ID)', async () => {
    const res = await fetch(`${BASE_URL}/api/products/stx-iphone-16-pro`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.product.id !== 'stx-iphone-16-pro') {
      throw new Error('Product id mismatch');
    }
    if (!Array.isArray(data.product.specs) || data.product.specs.length === 0) {
      throw new Error('Product specs missing');
    }
  });

  // 7. GET /api/products/:id (Non-existent 404)
  await assertTest('GET /api/products/unknown-id (404 handling)', async () => {
    const res = await fetch(`${BASE_URL}/api/products/unknown-id`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    const data = await res.json();
    if (data.success !== false) throw new Error('Expected success: false');
  });

  // 8. GET /api/categories
  await assertTest('GET /api/categories (List categories)', async () => {
    const res = await fetch(`${BASE_URL}/api/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.categories.length === 0) throw new Error('No categories found');
  });

  // 9. POST /api/checkout/validate
  await assertTest('POST /api/checkout/validate (Calculate totals)', async () => {
    const res = await fetch(`${BASE_URL}/api/checkout/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          { productId: 'stx-iphone-16-pro', quantity: 2 },
          { productId: 'stx-anker-power-bank', quantity: 1 }
        ],
        deliveryMethod: 'standard'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Validation failed');
    // iPhone 16 Pro = 1,250,000 * 2 = 2,500,000; Anker = 75,000; Subtotal = 2,575,000; Delivery = 2,000; Total = 2,577,000
    if (data.subtotal !== 2575000) throw new Error(`Expected subtotal 2575000, got ${data.subtotal}`);
    if (data.total !== 2577000) throw new Error(`Expected total 2577000, got ${data.total}`);
    if (data.itemCount !== 3) throw new Error(`Expected itemCount 3, got ${data.itemCount}`);
  });

  // 10. POST /api/payments
  let paymentId = '';
  await assertTest('POST /api/payments (Simulate payment)', async () => {
    const res = await fetch(`${BASE_URL}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 2577000,
        currency: 'NGN',
        method: 'card',
        cardDetails: { cardNumber: '4111222233334444', expiry: '12/28', cvv: '123' }
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.payment.transactionId || data.payment.status !== 'SUCCESS') {
      throw new Error('Payment processing failed');
    }
    paymentId = data.payment.id;
  });

  // 11. GET /api/orders
  await assertTest('GET /api/orders (List seeded orders)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.orders) || data.orders.length === 0) {
      throw new Error('No orders found');
    }
  });

  // 12. POST /api/orders
  let createdOrderId = '';
  await assertTest('POST /api/orders (Create new order with delivery tracking)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'stx-iphone-16-pro', quantity: 1, selectedColor: 'Space Black' }],
        subtotal: 1250000,
        deliveryFee: 2000,
        discount: 0,
        address: {
          fullName: 'Test Buyer',
          phone: '+234 812 000 0000',
          email: 'buyer@test.com',
          address: '5 Commercial Avenue',
          city: 'Yaba',
          state: 'Lagos'
        },
        paymentMethod: 'card',
        deliveryMethod: 'standard'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.order.id) throw new Error('Order creation failed');
    if (!data.order.delivery || !data.order.delivery.trackingNumber) {
      throw new Error('Delivery tracking details missing');
    }
    createdOrderId = data.order.id;
  });

  // 13. GET /api/orders/:id
  await assertTest('GET /api/orders/:id (Retrieve created order)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.order.id !== createdOrderId) {
      throw new Error('Order retrieval mismatch');
    }
  });

  // 14. PATCH /api/orders/:id/status
  await assertTest('PATCH /api/orders/:id/status (Update fulfillment status)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Shipped',
        note: 'Package handed over to courier for transit'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.order.status !== 'Shipped') {
      throw new Error('Order status update failed');
    }
    if (data.order.delivery.status !== 'IN_TRANSIT') {
      throw new Error('Delivery status mapping failed');
    }
  });

  // 15. GET /api/account/profile
  await assertTest('GET /api/account/profile (Customer profile data)', async () => {
    const res = await fetch(`${BASE_URL}/api/account/profile`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.profile.email) {
      throw new Error('Profile retrieval failed');
    }
  });

  console.log('\n====================================================');
  console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

testApi();
