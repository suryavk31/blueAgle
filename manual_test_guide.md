# Manual Test Guide & Report

Use this document to manually verify each of the new enhancements. Once you complete a test case, mark the corresponding box as `[x]` for Pass or leave notes if it Failed.

---

## 🔐 1. Authentication & Login Bypass
**Objective**: Verify that the new Staff Email login toggle works and bypasses Firebase OTP for testing.

*   **Step 1**: Navigate to `http://localhost:5173/login`.
*   **Step 2**: Click the "Staff Email" toggle button.
*   **Step 3**: Enter Email: `admin@blueeagle.com` and Password: `admin123`.
*   **Step 4**: Click "Login as Staff".
*   **Expected**: You should see a "Welcome, Admin!" toast notification and be redirected to the Home page or Profile page.

**Result**:
- [ ] **Pass**
- [ ] **Fail**
*Notes:* 

---

## 🎟 2. Advanced Coupon Logic & Cart
**Objective**: Verify unauthenticated warnings and case-insensitive, percentage-based coupon calculations.

*   **Step 1**: **(While Logged Out)** Add a product to your cart, open the Cart Sidebar, and enter `SAVE10`. Click Apply.
    *   **Expected**: UI should not crash. A toast warning "Please login to apply coupons" should appear.
*   **Step 2**: **(While Logged In)** Add a product to your cart, open the Cart Sidebar.
*   **Step 3**: Enter `save10` (lowercase) and click Apply.
    *   **Expected**: The system should accept the lowercase code (case-insensitive) and dynamically apply a 10% discount to your cart total.

**Result**:
- [ ] **Pass**
- [ ] **Fail**
*Notes:* 

---

## 🔍 3. Search & Filter Expansion
**Objective**: Verify that product filtering by price, category, and sorting works as expected.

*   **Step 1**: Navigate to `http://localhost:5173/products`.
*   **Step 2**: Notice the initial load—you should see **Skeleton loading screens** rather than sudden flashes.
*   **Step 3**: Click the "Filter" button to open the drawer.
*   **Step 4**: Set Minimum Price to `100` and Maximum Price to `500`. Click "Apply Filters".
    *   **Expected**: The product list should update to only show items within this price range.
*   **Step 5**: Change the Sort dropdown to "Price: High to Low".
    *   **Expected**: The most expensive items (under 500) should appear first.

**Result**:
- [ ] **Pass**
- [ ] **Fail**
*Notes:* 

---

## 📦 4. Visual Order Tracking
**Objective**: Verify that the Order Status Timeline renders correctly in the user's profile.

*   **Step 1**: Ensure you are logged in as `admin@blueeagle.com`. 
*   **Step 2**: Navigate to `http://localhost:5173/profile`.
*   **Step 3**: Click on the "Order History" tab. You should see the test order we seeded earlier (Status: Processing).
*   **Step 4**: Click the "V" chevron icon on the right side of the order card to expand it.
    *   **Expected**: A visual timeline should appear showing steps: Order Placed (Green) -> Processing (Orange/Active) -> Shipped (Gray) -> Out for Delivery (Gray) -> Delivered (Gray).

**Result**:
- [ ] **Pass**
- [ ] **Fail**
*Notes:* 

---

## 📈 5. Ad Tracking Resilience
**Objective**: Verify that backend `AdAnalytics` tracking doesn't throw 500 errors when scrolling past ads.

*   **Step 1**: Open your Browser's Developer Tools -> **Network Tab** (Filter by `Fetch/XHR`).
*   **Step 2**: Navigate to the Home page (`http://localhost:5173/`).
*   **Step 3**: Scroll down the page past the banner ads.
*   **Expected**: You should see network requests to `/api/ads/track`. Select them and verify they return a `200 OK` status, not a `500 Internal Server Error`.

**Result**:
- [ ] **Pass**
- [ ] **Fail**
*Notes:* 

---

## 🌐 6. SEO Meta Tags (React Helmet)
**Objective**: Verify that the Document Title dynamically changes based on the product.

*   **Step 1**: Navigate to `http://localhost:5173/products`.
*   **Expected**: Look at the actual Browser Tab name at the very top of your window. It should say `All Products | Premium E-commerce` instead of the default `Zepto Clone`.
*   **Step 2**: Click on a specific product (e.g., "Wood Pressed Groundnut Oil").
*   **Expected**: Once the page loads, the Browser Tab name should update to match the specific product's name (e.g., `Wood Pressed Groundnut Oil | Premium E-commerce`).

**Result**:
- [ ] **Pass**
- [ ] **Fail**
*Notes:* 
