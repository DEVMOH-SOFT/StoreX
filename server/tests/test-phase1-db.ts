import { initDatabase, getRepository } from '../src/db/index.js';
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

async function runPhase1Tests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 1 VERIFICATION: Database & Server Bootstrap');
  console.log('======================================================\n');

  // Test 1: Database Initialization
  console.log('🔹 1. Testing Database Repository Initialization...');
  const repo = await initDatabase();
  assert(repo !== null && repo !== undefined, 'Repository instance created');
  assert(repo.driverName === 'memory', `Default active driver is 'memory' (got: ${repo.driverName})`);

  // Test 2: Seed Products Integrity
  console.log('\n🔹 2. Testing Seed Products Integrity...');
  const products = await repo.getProducts();
  assert(products.length === 12, `All 12 seed gadgets are present (found: ${products.length})`);

  const iphone = await repo.getProductById('stx-iphone-16-pro');
  assert(iphone !== null, "Product 'stx-iphone-16-pro' exists");
  assert(iphone?.price === 1250000, `iPhone price is ₦1,250,000 (got: ${iphone?.price})`);
  assert(Boolean(iphone?.specs && iphone.specs.length > 0), 'iPhone specs are properly seeded');
  assert(Boolean(iphone?.colors && iphone.colors.length > 0), 'iPhone colorways are properly seeded');

  // Test 3: Categories Integrity
  console.log('\n🔹 3. Testing Categories & Counts...');
  const categories = await repo.getCategories();
  assert(categories.length >= 5, `Categories loaded (found: ${categories.length})`);
  const smartPhonesCat = categories.find(c => c.name === 'Smartphones');
  assert(smartPhonesCat !== undefined, 'Smartphones category exists');
  assert(Boolean(smartPhonesCat?.count && smartPhonesCat.count.includes('+')), `Dynamic category count rendered: ${smartPhonesCat?.count}`);

  // Test 4: Demo Orders Integrity
  console.log('\n🔹 4. Testing Demo Orders & Tracking Events...');
  const orders = await repo.getOrders();
  assert(orders.length >= 2, `Demo orders exist (found: ${orders.length})`);

  const order7842 = await repo.getOrderById('STX-7842');
  assert(order7842 !== null, "Demo order 'STX-7842' exists");
  assert(order7842?.status === 'Out for Delivery', `Order status is 'Out for Delivery' (got: ${order7842?.status})`);
  assert(Boolean(order7842?.delivery && order7842.delivery.events.length >= 4), 'Milestone tracking events exist for order');

  // Test 5: Customer Profile Integrity
  console.log('\n🔹 5. Testing Demo Customer Profile...');
  const customer = await repo.getCustomer();
  assert(customer !== null, 'Customer profile exists');
  assert(customer?.name === 'Muhammed Adegoke', `Customer name is 'Muhammed Adegoke' (got: ${customer?.name})`);

  // Test 6: Express Server & Health Endpoint
  console.log('\n🔹 6. Testing Express Server & Health Check Endpoint...');
  const app = createApp();
  const testServer = http.createServer(app);

  await new Promise<void>((resolve) => {
    testServer.listen(0, async () => {
      const address = testServer.address();
      const port = typeof address === 'object' && address ? address.port : 5000;

      try {
        const response = await fetch(`http://127.0.0.1:${port}/health`);
        assert(response.status === 200, `GET /health returned HTTP 200 (got: ${response.status})`);

        const data: any = await response.json();
        assert(data.status === 'ok', `Response contains status 'ok' (got: ${data.status})`);
        assert(data.driver === 'memory', `Health reports active driver 'memory' (got: ${data.driver})`);
      } catch (err: any) {
        assert(false, 'GET /health fetch', err.message);
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
    console.log(`🎉 ALL ${results.length} PHASE 1 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error(`❌ ${failed.length} OF ${results.length} TESTS FAILED.`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

runPhase1Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
