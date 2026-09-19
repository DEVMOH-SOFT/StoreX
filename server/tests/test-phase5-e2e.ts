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

async function runPhase5E2ETest() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 5: COMPLETE END-TO-END SHOPPING JOURNEY');
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
        // Step 1: Health
        console.log('🔹 Step 1: Checking Backend Service Health...');
        const resHealth = await fetch(`${baseUrl}/health`);
        assert(resHealth.status === 200, 'Backend /health responds HTTP 200');

        // Step 2: Browse Catalog
        console.log('\n🔹 Step 2: Browsing Product Catalog (Smartphones)...');
        const resCatalog = await fetch(`${baseUrl}/api/products?category=Smartphones`);
        assert(resCatalog.status === 200, 'Catalog endpoint returns HTTP 200');
        const dataCatalog: any = await resCatalog.json();
        assert(dataCatalog.products.length > 0, `Smartphones found: ${dataCatalog.products.length}`);

        // Step 3: Product Detail
        console.log('\n🔹 Step 3: Viewing Gadget Details...');
        const chosenProduct = dataCatalog.products[0];
        const resDetail = await fetch(`${baseUrl}/api/products/${chosenProduct.id}`);
        assert(resDetail.status === 200, 'Product details fetched successfully');
        const dataDetail: any = await resDetail.json();
        assert(dataDetail.product.id === chosenProduct.id, 'Product ID confirmed');

        // Step 4: Checkout Validation
        console.log('\n🔹 Step 4: Validating Shopping Cart & Shipping Fees...');
        const cartItems = [
          { productId: chosenProduct.id, quantity: 1, selectedColor: 'Space Black' }
        ];
        const resVal = await fetch(`${baseUrl}/api/checkout/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems, deliveryMethod: 'standard' })
        });
        assert(resVal.status === 200, 'Cart validated successfully');
        const dataVal: any = await resVal.json();
        const expectedTotal = chosenProduct.price + 2000;
        assert(dataVal.total === expectedTotal, `Validated total ₦${dataVal.total.toLocaleString()} matches product + delivery fee`);

        // Step 5: Authorize Payment
        console.log('\n🔹 Step 5: Authorizing Simulated Card Payment...');
        const resPayment = await fetch(`${baseUrl}/api/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: dataVal.total,
            currency: 'NGN',
            method: 'card',
            cardDetails: {
              cardNumber: '5399 4812 9042 4281',
              expiry: '08/28',
              cvv: '842'
            }
          })
        });
        assert(resPayment.status === 201, 'Payment authorization succeeded (HTTP 201)');
        const dataPayment: any = await resPayment.json();
        assert(dataPayment.payment.status === 'succeeded', 'Payment transaction status is "succeeded"');

        // Step 6: Create Order
        console.log('\n🔹 Step 6: Placing Customer Order...');
        const orderPayload = {
          items: [
            { product: chosenProduct, quantity: 1, selectedColor: 'Space Black' }
          ],
          subtotal: dataVal.subtotal,
          deliveryFee: dataVal.deliveryFee,
          discount: 0,
          paymentMethod: 'card',
          deliveryMethod: 'standard',
          address: {
            fullName: 'Muhammed Adegoke',
            phone: '+234 801 234 5678',
            email: 'muhammed@example.com',
            address: '12, Freedom Street, Ikeja',
            city: 'Ikeja',
            state: 'Lagos'
          }
        };
        const resOrder = await fetch(`${baseUrl}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        });
        assert(resOrder.status === 201, 'Order created successfully (HTTP 201)');
        const dataOrder: any = await resOrder.json();
        const newOrderId = dataOrder.order.id;
        assert(Boolean(newOrderId), `Created Order ID: #${newOrderId}`);

        // Step 7: Live Tracking & Status Progression
        console.log('\n🔹 Step 7: Tracking Live Delivery Milestone Progression...');
        const resTrack = await fetch(`${baseUrl}/api/orders/${newOrderId}`);
        assert(resTrack.status === 200, 'Order tracking details retrieved');
        const dataTrack: any = await resTrack.json();
        assert(dataTrack.order.delivery.trackingNumber.startsWith('TRK-'), `Tracking number assigned: ${dataTrack.order.delivery.trackingNumber}`);

        // Advance to Out for Delivery
        const resAdvance = await fetch(`${baseUrl}/api/orders/${newOrderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Out for Delivery' })
        });
        assert(resAdvance.status === 200, 'Milestone advanced to "Out for Delivery"');

        // Advance to Delivered
        const resDelivered = await fetch(`${baseUrl}/api/orders/${newOrderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Delivered' })
        });
        assert(resDelivered.status === 200, 'Milestone finalized as "Delivered"');

        // Step 8: Account Profile Verification
        console.log('\n🔹 Step 8: Verifying Customer Account Dashboard Metrics...');
        const resProfile = await fetch(`${baseUrl}/api/account/profile`);
        assert(resProfile.status === 200, 'Profile retrieved');
        const dataProfile: any = await resProfile.json();
        assert(dataProfile.profile.metrics.totalOrders >= 3, `Account reflects updated order count: ${dataProfile.profile.metrics.totalOrders}`);

      } catch (err: any) {
        assert(false, 'Phase 5 E2E Execution', err.message);
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
    console.log(`🎉 ALL ${results.length} END-TO-END VERIFICATION STEPS PASSED 100%!`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error(`❌ ${failed.length} OF ${results.length} E2E STEPS FAILED.`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

runPhase5E2ETest().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
