import "./env.mjs";
import test from "node:test";
import { resetTestDb, forceNextError, makeRequest, assert } from "./testDb.mjs";

const { POST: postOrder } = await import("../app/api/orders/route.js");

function orderBody(overrides = {}) {
  return {
    customerName: "محمد أحمد",
    customerPhone: "01012345678",
    customerAddress: "١٠ شارع النصر، دمياط",
    notes: "",
    paymentMethod: "cod",
    items: [{ id: 1, name: "اسم مزيف", price: 1, oldPrice: null, qty: 2 }],
    // client also tries to dictate totals directly — must be ignored server-side
    subtotal: 1,
    total: 1,
    ...overrides,
  };
}

let __ipCounter = 1;
function req(body, extraHeaders = {}) {
  const ip = extraHeaders["x-forwarded-for"] || `10.0.0.${__ipCounter++}`;
  return makeRequest("http://localhost/api/orders", {
    method: "POST",
    body,
    headers: { ...extraHeaders, "x-forwarded-for": ip },
  });
}

test("PRICE TAMPERING: server ignores client price/subtotal/total and recalculates from the DB", async () => {
  resetTestDb();
  const res = await postOrder(req(orderBody({ items: [{ id: 1, price: 1, qty: 2 }], subtotal: 2, total: 2 })));
  assert.equal(res.status, 201);
  const data = await res.json();
  // product 1 real price is 85 -> 85*2 = 170, NOT the client's 1*2=2
  assert.equal(data.subtotal, 170);
  assert.equal(data.total, 170);
  assert.equal(data.items[0].price, 85);
  assert.equal(data.items[0].productName, "فيتامين سي 1000 فوار"); // real DB name, not client-supplied "اسم مزيف"
});

test("OFFER PRICING (numeric product id): live active offer price is used, matching site display", async () => {
  resetTestDb();
  // product 2 has a live offer 220 -> 150
  const res = await postOrder(req(orderBody({ items: [{ id: 2, price: 999, qty: 1 }] })));
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.items[0].price, 150);
  assert.equal(data.items[0].oldPrice, 220);
  assert.equal(data.subtotal, 150);
});

test("OFFER PRICING (offer-<id> cart item): resolves via offers table, not client price", async () => {
  resetTestDb();
  const res = await postOrder(req(orderBody({ items: [{ id: "offer-10", price: 1, qty: 3 }] })));
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.items[0].price, 150);
  assert.equal(data.items[0].productId, 2);
  assert.equal(data.subtotal, 450);
});

test("REJECTS expired offer (offer-11 has an end_date in the past)", async () => {
  resetTestDb();
  const res = await postOrder(req(orderBody({ items: [{ id: "offer-11", qty: 1 }] })));
  assert.equal(res.status, 409);
  const data = await res.json();
  assert.match(data.error, /متاح/);
});

test("REJECTS offer with status != active (offer-12)", async () => {
  resetTestDb();
  const res = await postOrder(req(orderBody({ items: [{ id: "offer-12", qty: 1 }] })));
  assert.equal(res.status, 409);
});

test("REJECTS inactive product (id 3, is_active=false)", async () => {
  resetTestDb();
  const res = await postOrder(req(orderBody({ items: [{ id: 3, qty: 1 }] })));
  assert.equal(res.status, 409);
  const data = await res.json();
  assert.match(data.error, /متاح/);
});

test("REJECTS unknown/non-existent product id", async () => {
  resetTestDb();
  const res = await postOrder(req(orderBody({ items: [{ id: 999999, qty: 1 }] })));
  assert.equal(res.status, 409);
});

test("REJECTS invalid quantities: zero, negative, non-integer, over max", async () => {
  resetTestDb();
  for (const qty of [0, -1, 1.5, 9999, "abc", null]) {
    const res = await postOrder(req(orderBody({ items: [{ id: 1, qty }] })));
    assert.equal(res.status, 400, `qty=${JSON.stringify(qty)} should be rejected`);
  }
});

test("REJECTS malformed item id (not a number, not offer-<id>)", async () => {
  resetTestDb();
  const res = await postOrder(req(orderBody({ items: [{ id: "'; DROP TABLE orders; --", qty: 1 }] })));
  assert.equal(res.status, 400);
});

test("REJECTS empty cart / non-array items / too many items", async () => {
  resetTestDb();
  let res = await postOrder(req(orderBody({ items: [] })));
  assert.equal(res.status, 400);

  res = await postOrder(req(orderBody({ items: "not-an-array" })));
  assert.equal(res.status, 400);

  const tooMany = Array.from({ length: 41 }, () => ({ id: 1, qty: 1 }));
  res = await postOrder(req(orderBody({ items: tooMany })));
  assert.equal(res.status, 400);
});

test("REJECTS invalid phone / missing name-address / bad payment method", async () => {
  resetTestDb();
  let res = await postOrder(req(orderBody({ customerPhone: "123" })));
  assert.equal(res.status, 400);

  res = await postOrder(req(orderBody({ customerName: "" })));
  assert.equal(res.status, 400);

  // unknown payment method silently falls back to "cod" rather than being trusted verbatim
  res = await postOrder(req(orderBody({ paymentMethod: "free-money-please" })));
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.paymentMethod, "cod");
});

test("REJECTS oversized request body (actual body size guard, > 20KB)", async () => {
  resetTestDb();
  // fetch/undici sets Content-Length from the real body, so we test the
  // thing that actually matters: a genuinely oversized payload is rejected
  // (this also implicitly covers a spoofed/absent Content-Length header,
  // since the route re-checks the actual bytes read, not just the header).
  const res = await postOrder(req(orderBody({ notes: "ز".repeat(25_000) })));
  assert.equal(res.status, 413);
});

test("REJECTS malformed JSON body", async () => {
  resetTestDb();
  const res = await postOrder(
    makeRequest("http://localhost/api/orders", {
      method: "POST",
      headers: { "x-forwarded-for": "10.0.0.9" },
      body: "{not-json",
    })
  );
  assert.equal(res.status, 400);
});

test("CUSTOMER-OVERWRITE PROTECTION (Priority 2): existing customer's stored name/address is NOT modified by an unauthenticated order using the same phone", async () => {
  const db = resetTestDb();
  const before = db.customers.find((c) => c.phone === "01011111111");
  assert.equal(before.name, "عميل موجود");
  assert.equal(before.address, "عنوان قديم");

  const res = await postOrder(
    req(
      orderBody({
        customerName: "اسم مزوّر انتحال",
        customerPhone: "01011111111", // same phone as the existing customer
        customerAddress: "عنوان مزوّر",
        items: [{ id: 1, qty: 1 }],
      })
    )
  );
  assert.equal(res.status, 201);

  // the customers "account" record must be untouched
  const after = db.customers.find((c) => c.phone === "01011111111");
  assert.equal(after.name, "عميل موجود");
  assert.equal(after.address, "عنوان قديم");
  assert.equal(db.customers.length, 1); // no duplicate customer row created either

  // the order itself still carries the guest-supplied contact info for this order
  const order = db.orders[db.orders.length - 1];
  assert.equal(order.customer_name, "اسم مزوّر انتحال");
  assert.equal(order.customer_address, "عنوان مزوّر");
  assert.equal(order.customer_id, 100);
});

test("new phone number creates a new customer record (guest checkout keeps working)", async () => {
  const db = resetTestDb();
  const res = await postOrder(req(orderBody({ customerPhone: "01099998888", items: [{ id: 1, qty: 1 }] })));
  assert.equal(res.status, 201);
  const newCust = db.customers.find((c) => c.phone === "01099998888");
  assert.ok(newCust);
  assert.equal(newCust.name, "محمد أحمد");
});

test("ORDER ALWAYS SAVED AS pending, regardless of client-sent status", async () => {
  resetTestDb();
  const res = await postOrder(req(orderBody({ status: "confirmed", items: [{ id: 1, qty: 1 }] })));
  const data = await res.json();
  assert.equal(data.status, "pending");
});

test("SAFE ERROR HANDLING: a raw DB error is never echoed to the client", async () => {
  resetTestDb();
  forceNextError("products", "select", { message: "relation \"products\" secret internal detail leak", code: "42P17", details: "internal", hint: "internal" });
  const res = await postOrder(req(orderBody({ items: [{ id: 1, qty: 1 }] })));
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.doesNotMatch(JSON.stringify(data), /secret internal detail|42P17/);
});

test("COMPENSATING DELETE: if order_items insert fails, the orphan order row is removed", async () => {
  const db = resetTestDb();
  forceNextError("order_items", "insert", { message: "constraint violation detail" });
  const res = await postOrder(req(orderBody({ items: [{ id: 1, qty: 1 }] })));
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.doesNotMatch(JSON.stringify(data), /constraint violation detail/);
  assert.equal(db.orders.length, 0, "orphan order row should have been rolled back");
});

test("RATE LIMITING: 9th order request from the same IP within the window is throttled (limit=8)", async () => {
  resetTestDb();
  const ip = "203.0.113.55";
  let lastStatus;
  for (let i = 0; i < 9; i++) {
    const res = await postOrder(req(orderBody({ items: [{ id: 1, qty: 1 }] }), { "x-forwarded-for": ip }));
    lastStatus = res.status;
  }
  assert.equal(lastStatus, 429);
});

test("RATE LIMITING: a different IP is not affected by another IP's limit", async () => {
  resetTestDb();
  for (let i = 0; i < 8; i++) {
    await postOrder(req(orderBody({ items: [{ id: 1, qty: 1 }] }), { "x-forwarded-for": "198.51.100.1" }));
  }
  const res = await postOrder(req(orderBody({ items: [{ id: 1, qty: 1 }] }), { "x-forwarded-for": "198.51.100.2" }));
  assert.equal(res.status, 201);
});
