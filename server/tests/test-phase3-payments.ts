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

async function runPhase3Tests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 3 VERIFICATION: Checkout & Payments API');
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
        // Test 1: Validate standard checkout
        console.log('🔹 1. Testing POST /api/checkout/validate (Standard Delivery)...');
        const cartPayload = {
          items: [
            { productId: 'stx-iphone-16-pro', quantity: 1, selectedColor: 'Space Black' },
            { productId: 'stx-sony-wh1000xm5', quantity: 2 }
          ],
          deliveryMethod: 'standard'
        };

        const resVal = await fetch(`${baseUrl}/api/checkout/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cartPayload)
        });

        assert(resVal.status === 200, 'POST /api/checkout/validate returns HTTP 200');
        const dataVal: any = await resVal.json();
        // 1,250,000 + (450,000 * 2) = 2,150,000
        assert(dataVal.subtotal === 2150000, `Subtotal accurately calculated: ₦2,150,000 (got: ${dataVal.subtotal})`);
        assert(dataVal.deliveryFee === 2000, `Standard delivery fee is ₦2,000 (got: ${dataVal.deliveryFee})`);
        assert(dataVal.total === 2152000, `Total is ₦2,152,000 (got: ${dataVal.total})`);
        assert(dataVal.itemCount === 3, 'Total items counted correctly');

        // Test 2: Express Delivery Fee
        console.log('\n🔹 2. Testing Delivery Methods (Express vs Pickup)...');
        const resExpress = await fetch(`${baseUrl}/api/checkout/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ productId: 'stx-iphone-16-pro', quantity: 1 }],
            deliveryMethod: 'express'
          })
        });
        const dataExpress: any = await resExpress.json();
        assert(dataExpress.deliveryFee === 4000, `Express delivery fee is ₦4,000 (got: ${dataExpress.deliveryFee})`);

        // Test 3: Pickup Fee (Free)
        const resPickup = await fetch(`${baseUrl}/api/checkout/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [{ productId: 'stx-iphone-16-pro', quantity: 1 }],
            deliveryMethod: 'pickup'
          })
        });
        const dataPickup: any = await resPickup.json();
        assert(dataPickup.deliveryFee === 0, `Store pickup fee is ₦0 (got: ${dataPickup.deliveryFee})`);

        // Test 4: Security / Price Tamper Check
        console.log('\n🔹 3. Testing Price Tamper Prevention...');
        const tamperedPayload = {
          items: [
            // Client maliciously attempts to set price to ₦50 instead of ₦1,250,000
            { productId: 'stx-iphone-16-pro', price: 50, quantity: 1 }
          ],
          deliveryMethod: 'standard'
        };
        const resTamper = await fetch(`${baseUrl}/api/checkout/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tamperedPayload)
        });
        const dataTamper: any = await resTamper.json();
        assert(
          dataTamper.subtotal === 1250000,
          `Tampered client price overridden by DB verified price (got: ₦${dataTamper.subtotal})`
        );

        // Test 5: Empty Cart Validation
        console.log('\n🔹 4. Testing Empty / Invalid Cart Validation...');
        const resEmpty = await fetch(`${baseUrl}/api/checkout/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [] })
        });
        assert(resEmpty.status === 400, 'Empty cart rejected with HTTP 400');

        // Test 6: Nonexistent Product in Cart
        const resBadProduct = await fetch(`${baseUrl}/api/checkout/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ productId: 'non-existent-product' }] })
        });
        assert(resBadProduct.status === 404, 'Nonexistent cart product rejected with HTTP 404');

        // Test 7: Card Payment
        console.log('\n🔹 5. Testing Payment Gateway - Card Payment Simulation...');
        const cardPaymentPayload = {
          orderId: 'STX-TEST-001',
          amount: 1252000,
          currency: 'NGN',
          method: 'card',
          cardDetails: {
            cardNumber: '5399 4812 9042 4281',
            expiry: '08/28',
            cvv: '842'
          }
        };
        const resCardPay = await fetch(`${baseUrl}/api/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cardPaymentPayload)
        });
        assert(resCardPay.status === 201, 'Card payment simulation returns HTTP 201 Created');
        const dataCardPay: any = await resCardPay.json();
        const paymentId = dataCardPay.payment.id;
        assert(Boolean(paymentId), `Payment ID created: ${paymentId}`);
        assert(dataCardPay.payment.status === 'succeeded', 'Payment status is "succeeded"');
        assert(dataCardPay.payment.transactionId.startsWith('tx_stripe_'), 'Stripe simulated transaction ID generated');

        // Test 8: Bank Transfer Payment
        console.log('\n🔹 6. Testing Payment Gateway - Bank Transfer Simulation...');
        const transferPayload = {
          orderId: 'STX-TEST-002',
          amount: 450000,
          method: 'transfer'
        };
        const resTransfer = await fetch(`${baseUrl}/api/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transferPayload)
        });
        assert(resTransfer.status === 201, 'Transfer payment simulation returns HTTP 201');
        const dataTransfer: any = await resTransfer.json();
        assert(dataTransfer.payment.transactionId.startsWith('tx_zenith_bank_'), 'Bank transfer reference generated');

        // Test 9: Wallet Payment
        console.log('\n🔹 7. Testing Payment Gateway - Wallet Payment Simulation...');
        const walletPayload = {
          orderId: 'STX-TEST-003',
          amount: 75000,
          method: 'wallet'
        };
        const resWallet = await fetch(`${baseUrl}/api/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(walletPayload)
        });
        assert(resWallet.status === 201, 'Wallet payment simulation returns HTTP 201');
        const dataWallet: any = await resWallet.json();
        assert(dataWallet.payment.transactionId.startsWith('tx_wallet_'), 'Wallet transaction ID generated');

        // Test 10: Invalid Payment Amount (Negative/Zero)
        console.log('\n🔹 8. Testing Payment Edge Cases & Receipt Lookup...');
        const resBadAmount = await fetch(`${baseUrl}/api/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: -500, method: 'card' })
        });
        assert(resBadAmount.status === 400, 'Negative/Zero payment rejected with HTTP 400');

        // Test 11: GET /api/payments/:id
        const resGetPay = await fetch(`${baseUrl}/api/payments/${paymentId}`);
        assert(resGetPay.status === 200, 'Payment receipt lookup returns HTTP 200');
        const dataGetPay: any = await resGetPay.json();
        assert(dataGetPay.payment.id === paymentId, 'Payment receipt ID matches requested parameter');

        // Test 12: GET /api/payments/:id (404 Nonexistent)
        const resGetBadPay = await fetch(`${baseUrl}/api/payments/pay_nonexistent_999`);
        assert(resGetBadPay.status === 404, 'Nonexistent payment returns HTTP 404');

        // Test 13: Refund
        console.log('\n🔹 9. Testing POST /api/payments/refund...');
        const resRefund = await fetch(`${baseUrl}/api/payments/refund`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, reason: 'Customer cancelled order' })
        });
        assert(resRefund.status === 200, 'Payment refund returns HTTP 200');
        const dataRefund: any = await resRefund.json();
        assert(dataRefund.status === 'refunded', 'Refund status updated to "refunded"');

      } catch (err: any) {
        assert(false, 'Phase 3 Test Execution', err.message);
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
    console.log(`🎉 ALL ${results.length} PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error(`❌ ${failed.length} OF ${results.length} TESTS FAILED.`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

runPhase3Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
