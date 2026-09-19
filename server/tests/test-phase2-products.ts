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

async function runPhase2Tests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING PHASE 2 VERIFICATION: Products & Categories API');
  console.log('======================================================\n');

  // Initialize DB
  await initDatabase();

  const app = createApp();
  const testServer = http.createServer(app);

  await new Promise<void>((resolve) => {
    testServer.listen(0, async () => {
      const address = testServer.address();
      const port = typeof address === 'object' && address ? address.port : 5000;
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        // Test 1: GET /api/products (All)
        console.log('🔹 1. Testing GET /api/products (Full Catalog)...');
        const resAll = await fetch(`${baseUrl}/api/products`);
        assert(resAll.status === 200, 'GET /api/products returns HTTP 200');
        const dataAll: any = await resAll.json();
        assert(dataAll.success === true, 'Response payload has success: true');
        assert(dataAll.count >= 12, `Total products returned >= 12 (got: ${dataAll.count})`);

        // Test 2: Category Filter
        console.log('\n🔹 2. Testing Category Filter (?category=Smartphones)...');
        const resCat = await fetch(`${baseUrl}/api/products?category=Smartphones`);
        assert(resCat.status === 200, 'Category filter returns HTTP 200');
        const dataCat: any = await resCat.json();
        assert(dataCat.products.length > 0, 'Category filter returned results');
        const allSmartphones = dataCat.products.every((p: any) => p.category === 'Smartphones');
        assert(allSmartphones, 'All returned items have category === "Smartphones"');

        // Test 3: Search Query
        console.log('\n🔹 3. Testing Search Query (?search=macbook)...');
        const resSearch = await fetch(`${baseUrl}/api/products?search=macbook`);
        assert(resSearch.status === 200, 'Search query returns HTTP 200');
        const dataSearch: any = await resSearch.json();
        assert(dataSearch.products.length >= 1, 'Search found matching product');
        assert(dataSearch.products[0].name.toLowerCase().includes('macbook'), 'Matched product contains "MacBook"');

        // Test 4: Price Filter
        console.log('\n🔹 4. Testing Max Price Filter (?maxPrice=500000)...');
        const resPrice = await fetch(`${baseUrl}/api/products?maxPrice=500000`);
        assert(resPrice.status === 200, 'Price filter returns HTTP 200');
        const dataPrice: any = await resPrice.json();
        const allUnder500k = dataPrice.products.every((p: any) => p.price <= 500000);
        assert(allUnder500k, 'All returned products have price <= ₦500,000');

        // Test 5: Sorting (Price Low to High)
        console.log('\n🔹 5. Testing Sort by Price Ascending (?sortBy=price-low)...');
        const resSortLow = await fetch(`${baseUrl}/api/products?sortBy=price-low`);
        const dataSortLow: any = await resSortLow.json();
        const isSortedAsc = dataSortLow.products.every((val: any, idx: number, arr: any[]) =>
          idx === 0 || arr[idx - 1].price <= val.price
        );
        assert(isSortedAsc, 'Products are correctly sorted in ascending price order');

        // Test 6: Sorting (Rating Descending)
        console.log('\n🔹 6. Testing Sort by Top Rated (?sortBy=rating)...');
        const resSortRating = await fetch(`${baseUrl}/api/products?sortBy=rating`);
        const dataSortRating: any = await resSortRating.json();
        const isSortedRating = dataSortRating.products.every((val: any, idx: number, arr: any[]) =>
          idx === 0 || arr[idx - 1].rating >= val.rating
        );
        assert(isSortedRating, 'Products are correctly sorted by top ratings');

        // Test 7: Deals Filter
        console.log('\n🔹 7. Testing Deals Filter (?deals=true)...');
        const resDeals = await fetch(`${baseUrl}/api/products?deals=true`);
        const dataDeals: any = await resDeals.json();
        assert(dataDeals.products.length > 0, 'Deals filter returned discounted items');

        // Test 8: Featured Filter
        console.log('\n🔹 8. Testing Featured Filter (?featured=true)...');
        const resFeatured = await fetch(`${baseUrl}/api/products?featured=true`);
        const dataFeatured: any = await resFeatured.json();
        const allFeatured = dataFeatured.products.every((p: any) => p.isFeatured === true);
        assert(allFeatured, 'All returned items have isFeatured === true');

        // Test 9: GET /api/products/:id (Existing)
        console.log('\n🔹 9. Testing GET /api/products/:id (Valid ID)...');
        const resDetail = await fetch(`${baseUrl}/api/products/stx-iphone-16-pro`);
        assert(resDetail.status === 200, 'Fetch by ID returns HTTP 200');
        const dataDetail: any = await resDetail.json();
        assert(dataDetail.product.id === 'stx-iphone-16-pro', 'Product ID matches requested parameter');
        assert(dataDetail.product.specs.length > 0, 'Product specifications returned');

        // Test 10: GET /api/products/:id (404 Nonexistent)
        console.log('\n🔹 10. Testing GET /api/products/:id (Nonexistent ID)...');
        const res404 = await fetch(`${baseUrl}/api/products/invalid-id-xyz-404`);
        assert(res404.status === 404, 'Nonexistent product returns HTTP 404');
        const data404: any = await res404.json();
        assert(data404.code === 'NOT_FOUND', '404 error response contains code "NOT_FOUND"');

        // Test 11: POST /api/products (Create Product)
        console.log('\n🔹 11. Testing POST /api/products (Create Gadget)...');
        const newGadget = {
          name: 'StoreX Quantum Drone 4K',
          category: 'Accessories',
          price: 380000,
          description: 'Autonomous 4K obstacle avoiding smart drone.',
          specs: [{ name: 'Flight Time', value: '45 mins' }],
        };
        const resCreate = await fetch(`${baseUrl}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGadget),
        });
        assert(resCreate.status === 201, 'POST /api/products returns HTTP 201 Created');
        const dataCreate: any = await resCreate.json();
        const createdId = dataCreate.product.id;
        assert(Boolean(createdId), `New product assigned ID: ${createdId}`);

        // Verify newly created product is fetchable
        const resVerifyNew = await fetch(`${baseUrl}/api/products/${createdId}`);
        assert(resVerifyNew.status === 200, 'Newly created product can be fetched via GET');

        // Test 12: GET /api/categories
        console.log('\n🔹 12. Testing GET /api/categories...');
        const resCatList = await fetch(`${baseUrl}/api/categories`);
        assert(resCatList.status === 200, 'GET /api/categories returns HTTP 200');
        const dataCatList: any = await resCatList.json();
        assert(dataCatList.categories.length >= 5, `Returned ${dataCatList.categories.length} categories with live counts`);

      } catch (err: any) {
        assert(false, 'Phase 2 Test Execution', err.message);
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
    console.log(`🎉 ALL ${results.length} PHASE 2 VERIFICATION TESTS PASSED SUCCESSFULLY!`);
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.error(`❌ ${failed.length} OF ${results.length} TESTS FAILED.`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

runPhase2Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
