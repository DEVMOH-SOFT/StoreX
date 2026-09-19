import { initDatabase } from '../src/db/index.js';
import { createApp } from '../src/app.js';
import http from 'http';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, failureReason?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    results.push({ name: testName, passed: true });
  } else {
    console.error(`  ❌ [FAIL] ${testName} - ${failureReason || 'Assertion failed'}`);
    results.push({ name: testName, passed: false, error: failureReason });
  }
}

async function runPhase4Tests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 4 VERIFICATION: Orders & Tracking API');
  console.log('======================================================\n');

  await initDatabase();
  const app = createApp();
  const testServer = http.createServer(app);

  await new Promise<void>((resolve) => {
    testServer.listen(0, async () => {
      const address = testServer.address();
      const port = typeof address === 'object' && address ? address.port : 5000;
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        // Test 1: GET /api/orders (Initial)
        console.log('🔹 1. Testing GET /api/orders...');
        const resOrders = await fetch(`${baseUrl}/api/orders`);
        assert(resOrders.status === 200, 'GET /api/orders returns HTTP 200');
        const dataOrders: any = await resOrders.json();
        assert(dataOrders.count >= 2, `Existing demo orders returned (count: ${dataOrders.count})`);

        // Test 2: POST /api/orders (Create Order)
        console.log('\n🔹 2. Testing POST /api/orders (Create Order Flow)...');
        const newOrderPayload = {
          items: [
            {
              product: {
                id: 'stx-iphone-16-pro',
                name: 'iPhone 16 Pro',
                price: 1250000,
                image: '/images/products/iphone-16-pro.jpg',
                category: 'Smartphones'
              },
              quantity: 1,
              selectedColor: 'Natural Titanium'
            }
          ],
          subtotal: 1250000,
          deliveryFee: 2000,
          discount: 0,
          paymentMethod: 'card',
          deliveryMethod: 'standard',
          address: {
            fullName: 'Muhammed Adegoke',
            phone: '+234 801 234 5678',
            email: 'muhammed@example.com',
            address: '12, Freedom Street, Ikeja',
            city: 'Ikeja',
            state: 'Lagos',
            postalCode: '100001'
          }
        };

        const resCreate = await fetch(`${baseUrl}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrderPayload)
        });

        assert(resCreate.status === 201, 'POST /api/orders returns HTTP 201 Created');
        const dataCreate: any = await resCreate.json();
        const createdOrder = dataCreate.order;
        const newOrderId = createdOrder.id;

        assert(Boolean(newOrderId) && newOrderId.startsWith('STX-'), `Assigned StoreX Order ID: ${newOrderId}`);
        assert(createdOrder.status === 'Processing', 'Initial order status is "Processing"');
        assert(createdOrder.total === 1252000, `Calculated total matches: ₦1,252,000 (got: ${createdOrder.total})`);

        // Delivery specifics
        assert(Boolean(createdOrder.delivery.trackingNumber), `Generated tracking number: ${createdOrder.delivery.trackingNumber}`);
        assert(createdOrder.delivery.status === 'PROCESSING', 'Delivery status is "PROCESSING"');
        assert(createdOrder.delivery.events.length === 4, '4 Milestone tracking events attached to order');

        // Test 3: GET /api/orders/:id (Retrieve Newly Created Order)
        console.log('\n🔹 3. Testing GET /api/orders/:id...');
        const resGetOrder = await fetch(`${baseUrl}/api/orders/${newOrderId}`);
        assert(resGetOrder.status === 200, 'GET /api/orders/:id returns HTTP 200');
        const dataGetOrder: any = await resGetOrder.json();
        assert(dataGetOrder.order.id === newOrderId, 'Fetched order matches created ID');
        assert(dataGetOrder.order.items[0].selectedColor === 'Natural Titanium', 'Color selection preserved');

        // Test 4: PATCH /api/orders/:id/status (Advance to "Out for Delivery")
        console.log('\n🔹 4. Testing PATCH /api/orders/:id/status (Progress Milestone)...');
        const resPatchOut = await fetch(`${baseUrl}/api/orders/${newOrderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'Out for Delivery',
            note: 'Rider on bike with package'
          })
        });
        assert(resPatchOut.status === 200, 'PATCH /api/orders/:id/status returns HTTP 200');
        const dataPatchOut: any = await resPatchOut.json();
        assert(dataPatchOut.order.status === 'Out for Delivery', 'Order status updated to "Out for Delivery"');
        assert(dataPatchOut.order.delivery.status === 'OUT_FOR_DELIVERY', 'Delivery status updated to "OUT_FOR_DELIVERY"');

        // Test 5: PATCH /api/orders/:id/status (Advance to "Delivered")
        console.log('\n🔹 5. Testing PATCH /api/orders/:id/status (Complete Delivery)...');
        const resPatchDelivered = await fetch(`${baseUrl}/api/orders/${newOrderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Delivered' })
        });
        assert(resPatchDelivered.status === 200, 'Order marked as Delivered');
        const dataDelivered: any = await resPatchDelivered.json();
        assert(dataDelivered.order.status === 'Delivered', 'Order status is "Delivered"');
        assert(dataDelivered.order.delivery.status === 'DELIVERED', 'Delivery status is "DELIVERED"');

        // Test 6: 404 Nonexistent Order
        console.log('\n🔹 6. Testing Order Error Handling...');
        const res404 = await fetch(`${baseUrl}/api/orders/STX-NONEXISTENT-999`);
        assert(res404.status === 404, 'Nonexistent order returns HTTP 404');

        // Test 7: Invalid Order Creation (Empty Items)
        const resBadOrder = await fetch(`${baseUrl}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [] })
        });
        assert(resBadOrder.status === 400, 'Order with empty items rejected with HTTP 400');

        // Test 8: GET /api/account/profile
        console.log('\n🔹 7. Testing GET /api/account/profile...');
        const resProfile = await fetch(`${baseUrl}/api/account/profile`);
        assert(resProfile.status === 200, 'GET /api/account/profile returns HTTP 200');
        const dataProfile: any = await resProfile.json();
        assert(dataProfile.profile.name === 'Muhammed Adegoke', 'Customer profile name is "Muhammed Adegoke"');
        assert(typeof dataProfile.profile.metrics.totalOrders === 'number', 'Calculated totalOrders metric exists');
        assert(dataProfile.profile.savedAddresses.length > 0, 'Saved delivery addresses exist');

      } catch (err: any) {
        assert(false, 'Phase 4 Test Execution', err.message);
      } finally {
        testServer.close();
        resolve();
      }
    });
  });

  // Summary
  console.log('\n======================================================');
  const failed = results.filter(r => !r.passed);
  if (failed.length === 0) {
    console.log(`🎉 ALL ${results.length} PHASE 4 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error(`❌ ${failed.length} OF ${results.length} TESTS FAILED.`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

runPhase4Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
