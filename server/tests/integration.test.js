import test from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import app from "../app.js";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.model.js";
import { Product } from "../models/Product.model.js";
import { Order } from "../models/Order.model.js";

// Set node environment to test
process.env.NODE_ENV = "test";

const originalUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/GaramBazaar";
let testUri;
try {
  // Use URL to safely set the pathname (DB name); this preserves query/options if present.
  const url = new URL(originalUri);
  // Ensure pathname is exactly the test DB (no double segments)
  url.pathname = "/GaramBazaar_test";
  testUri = url.toString();
} catch (err) {
  // Fallback for any unexpected URI formats: replace last path segment (if present) or append.
  if (originalUri.includes("?")) {
    const [base, query] = originalUri.split("?");
    const baseNoDb = base.replace(/\/[^\/]*$/, ""); // remove trailing DB segment if any
    testUri = `${baseNoDb}/GaramBazaar_test?${query}`;
  } else {
    testUri = originalUri.replace(/\/[^\/]*$/, "") + "/GaramBazaar_test";
  }
}
process.env.MONGODB_URI = testUri;

let server;
let baseUrl;

// Helper to parse cookies from headers
function parseCookies(cookieHeaders) {
  if (!cookieHeaders) return {};
  const cookies = {};
  cookieHeaders.forEach(header => {
    const parts = header.split(";")[0].split("=");
    cookies[parts[0].trim()] = parts[1].trim();
  });
  return cookies;
}

test.before(async () => {
  await connectDB();
  // Clear the database tables for test run
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({})
  ]);

  // Start server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
});

test("Integration Test Suite: Auth, Webhooks, and Multi-Vendor Order Isolation", async (t) => {
  let sellerACookie = "";
  let sellerBCookie = "";
  let customerCookie = "";
  
  let sellerAProduct;
  let sellerBProduct;
  let orderNumber;

  await t.test("1. Register Seller A and Seller B", async () => {
    const resA = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Seller A",
        email: "sellerA@test.com",
        password: "password123",
        role: "seller"
      })
    });
    assert.strictEqual(resA.status, 201);
    const cookiesA = parseCookies(resA.headers.getSetCookie());
    assert.ok(cookiesA.token, "Should return authentication token cookie for Seller A");
    sellerACookie = `token=${cookiesA.token}`;

    const resB = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Seller B",
        email: "sellerB@test.com",
        password: "password123",
        role: "seller"
      })
    });
    assert.strictEqual(resB.status, 201);
    const cookiesB = parseCookies(resB.headers.getSetCookie());
    assert.ok(cookiesB.token, "Should return authentication token cookie for Seller B");
    sellerBCookie = `token=${cookiesB.token}`;
  });

  await t.test("2. Register Customer", async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Customer",
        email: "customer@test.com",
        password: "password123",
        role: "user"
      })
    });
    assert.strictEqual(res.status, 201);
    const cookies = parseCookies(res.headers.getSetCookie());
    assert.ok(cookies.token, "Should return authentication token cookie for customer");
    customerCookie = `token=${cookies.token}`;
  });

  await t.test("3. Create products for Sellers A and B", async () => {
    // Seller A creates product
    const sellerA = await User.findOne({ email: "sellerA@test.com" });
    sellerAProduct = await Product.create({
      name: "Seller A Item",
      slug: "seller-a-item",
      description: "Item from Seller A",
      category: "Organic Fruits",
      price: 150,
      seller: sellerA._id,
      inStock: true,
      stockCount: 10,
      isPublished: true
    });

    // Seller B creates product
    const sellerB = await User.findOne({ email: "sellerB@test.com" });
    sellerBProduct = await Product.create({
      name: "Seller B Item",
      slug: "seller-b-item",
      description: "Item from Seller B",
      category: "Organic Vegetables",
      price: 300,
      seller: sellerB._id,
      inStock: true,
      stockCount: 5,
      isPublished: true
    });

    assert.ok(sellerAProduct._id);
    assert.ok(sellerBProduct._id);
  });

  await t.test("4. Create Multi-Vendor Order (Customer placing order)", async () => {
    const res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": customerCookie
      },
      body: JSON.stringify({
        items: [
          { productId: sellerAProduct._id.toString(), quantity: 2 },
          { productId: sellerBProduct._id.toString(), quantity: 1 }
        ],
        shippingAddress: {
          name: "Test Customer",
          phone: "9876543210",
          line1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        },
        paymentMethod: "cod"
      })
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.data.order.orderNumber);
    orderNumber = data.data.order.orderNumber;
  });

  await t.test("5. Tenant isolation: Seller A cannot update Seller B's item status, and vice versa", async () => {
    // Seller A updates status of their item in the order to 'On the Way'
    const res = await fetch(`${baseUrl}/seller/orders/${orderNumber}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": sellerACookie
      },
      body: JSON.stringify({
        status: "On the Way"
      })
    });

    assert.strictEqual(res.status, 200);
    
    // Check order state in DB
    const orderObj = await Order.findOne({ orderNumber }).lean();
    
    // Seller A product item should be 'On the Way'
    const itemA = orderObj.items.find(i => i.productId.toString() === sellerAProduct._id.toString());
    assert.strictEqual(itemA.fulfillmentStatus, "On the Way");

    // Seller B product item should remain 'Processing'
    const itemB = orderObj.items.find(i => i.productId.toString() === sellerBProduct._id.toString());
    assert.strictEqual(itemB.fulfillmentStatus, "Processing");

    // The global order status should still be 'Processing' since item B is still Processing
    assert.strictEqual(orderObj.status, "Processing");
  });

  await t.test("6. Webhook safety: webhook endpoint blocks requests without correct signature", async () => {
    const res = await fetch(`${baseUrl}/payment/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "invalid-signature"
      },
      body: JSON.stringify({
        event: "payment.captured"
      })
    });

    // Should return 400 Bad Request or 403 Forbidden due to invalid signature
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  await t.test("7. Security hardening: query string token in URL is rejected for authentication", async () => {
    // Attempting to stream notifications with token in query string (without cookie/header)
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.somesignature";
    const res = await fetch(`${baseUrl}/notifications/stream?token=${fakeToken}`);
    assert.strictEqual(res.status, 401);
  });

  await t.test("8. Atomic Stock Isolation: placing order exceeding remaining stock fails cleanly", async () => {
    // Create a product with only 1 item in stock
    const sellerA = await User.findOne({ email: "sellerA@test.com" });
    const scarceProduct = await Product.create({
      name: "Scarce Item",
      slug: "scarce-item",
      description: "Only 1 available",
      category: "Pantry",
      price: 500,
      seller: sellerA._id,
      inStock: true,
      stockCount: 1,
      isPublished: true
    });

    // Attempt to order 2 units of scarce product
    const res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": customerCookie
      },
      body: JSON.stringify({
        items: [
          { productId: scarceProduct._id.toString(), quantity: 2 }
        ],
        shippingAddress: {
          name: "Test Customer",
          phone: "9876543210",
          line1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        },
        paymentMethod: "cod"
      })
    });

    const data = await res.json();
    assert.strictEqual(res.status, 500); // Thrown error captured by errorHandler or 400
    assert.strictEqual(data.success, false);
    
    // Check that stock was preserved at 1 and not decremented into negative numbers
    const rechecked = await Product.findById(scarceProduct._id);
    assert.strictEqual(rechecked.stockCount, 1);
  });

  await t.test("9. IDOR Protection: Guest orders require valid guestAccessToken to view and cancel", async () => {
    const sellerA = await User.findOne({ email: "sellerA@test.com" });
    const product = await Product.create({
      name: "Guest Purchasable Item",
      slug: "guest-purchasable-item",
      description: "Available item",
      category: "Pantry",
      price: 250,
      seller: sellerA._id,
      inStock: true,
      stockCount: 10,
      isPublished: true,
    });

    // 1. Create a guest order (no auth cookie)
    const createRes = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ productId: product._id.toString(), quantity: 1 }],
        shippingAddress: {
          name: "Guest Shopper",
          phone: "9123456780",
          line1: "404 Stealth Lane",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
        },
        paymentMethod: "cod",
      }),
    });

    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    const guestToken = createData.data?.guestAccessToken;
    assert.ok(guestToken, "Guest order response should provide a guestAccessToken");
    const guestOrderNum = createData.data.order.orderNumber || createData.data.order.id;

    // 2. Unauthenticated attacker attempts to read guest order without token -> 403 Forbidden
    const unauthReadRes = await fetch(`${baseUrl}/orders/${guestOrderNum}`);
    assert.strictEqual(unauthReadRes.status, 403, "Unauthenticated fetch without guestToken must be 403 Forbidden");

    // 3. Unauthenticated attacker attempts to cancel guest order without token -> 403 Forbidden
    const unauthCancelRes = await fetch(`${baseUrl}/orders/${guestOrderNum}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    assert.strictEqual(unauthCancelRes.status, 403, "Unauthenticated cancel without guestToken must be 403 Forbidden");

    // 4. Fetch guest order with valid guestToken -> 200 OK
    const authReadRes = await fetch(`${baseUrl}/orders/${guestOrderNum}?guestToken=${guestToken}`);
    assert.strictEqual(authReadRes.status, 200, "Fetch with valid guestToken must return 200 OK");
    const authReadData = await authReadRes.json();
    assert.strictEqual(authReadData.data.order.id, guestOrderNum);

    // 5. Cancel guest order with valid guestToken -> 200 OK
    const authCancelRes = await fetch(`${baseUrl}/orders/${guestOrderNum}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-guest-token": guestToken,
      },
    });
    assert.strictEqual(authCancelRes.status, 200, "Cancel with valid guestToken must return 200 OK");
    const authCancelData = await authCancelRes.json();
    assert.strictEqual(authCancelData.data.order.status, "Cancelled");
  });

  await t.test("10. Security: Password reset tokens are stored as SHA-256 hashes", async () => {
    // Set up user with a known raw reset token
    const crypto = await import("crypto");
    const rawResetToken = "raw_sample_secret_token_1234567890abcdef";
    const hashedResetToken = crypto.createHash("sha256").update(rawResetToken).digest("hex");

    const user = await User.findOne({ email: "customer@test.com" });
    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    // Verify stored token in MongoDB is the 64-char SHA-256 hash, not the raw token
    const reloadedUser = await User.findOne({ email: "customer@test.com" });
    assert.strictEqual(reloadedUser.passwordResetToken, hashedResetToken);
    assert.strictEqual(reloadedUser.passwordResetToken.length, 64);

    // Attempting to reset using the hash string itself must fail (server hashes the input)
    const failRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: hashedResetToken,
        password: "brandNewSecurePassword123!",
      }),
    });
    assert.strictEqual(failRes.status, 400);

    // Resetting with the raw unhashed token succeeds
    const successRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: rawResetToken,
        password: "brandNewSecurePassword123!",
      }),
    });
    assert.strictEqual(successRes.status, 200);

    // Token must be cleared after use
    const updatedUser = await User.findOne({ email: "customer@test.com" });
    assert.strictEqual(updatedUser.passwordResetToken, undefined);
  });

  await t.test("11. Webhook Raw Buffer: Valid HMAC SHA-256 signature passes verification", async () => {
    const crypto = await import("crypto");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "ci_mock_placeholder_webhook_secret_key";

    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test_valid_123",
            order_id: "order_test_valid_123",
          },
        },
      },
    });

    const validSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    const res = await fetch(`${baseUrl}/payment/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": validSignature,
      },
      body: payload,
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, "Webhook processed.");
  });
});
