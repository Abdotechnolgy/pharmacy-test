// Shared helpers for the mocked-integration test harness. Resets
// globalThis.__TEST_DB__ (read by node_modules/@supabase/supabase-js's fake
// createClient) and globalThis.__TEST_AUTH__ (fake Supabase Auth users) to a
// known baseline before each test file/case.
import { strict as assert } from "node:assert";

export function resetTestDb(overrides = {}) {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const todayStr = iso(today);
  const future = iso(new Date(today.getTime() + 30 * 86400000));
  const past = iso(new Date(today.getTime() - 30 * 86400000));

  const base = {
    products: [
      { id: 1, name: "فيتامين سي 1000 فوار", category: "مكملات غذائية", price: 85, is_active: true, created_at: new Date().toISOString() },
      { id: 2, name: "أوميجا 3 كبسولات", category: "مكملات غذائية", price: 220, is_active: true, created_at: new Date().toISOString() },
      { id: 3, name: "منتج متوقف", category: "أدوية", price: 50, is_active: false, created_at: new Date().toISOString() },
    ],
    offers: [
      // live offer on product 2: 220 -> 150
      { id: 10, product_id: 2, old_price: 220, new_price: 150, status: "active", start_date: null, end_date: null, description: "" },
      // expired offer on product 1 (should NOT apply)
      { id: 11, product_id: 1, old_price: 85, new_price: 40, status: "active", start_date: past, end_date: past, description: "" },
      // inactive-status offer on product 1
      { id: 12, product_id: 1, old_price: 85, new_price: 60, status: "inactive", start_date: null, end_date: null, description: "" },
    ],
    customers: [{ id: 100, name: "عميل موجود", phone: "01011111111", address: "عنوان قديم", notes: "", created_at: new Date().toISOString() }],
    orders: [],
    order_items: [],
    user_roles: [{ user_id: "admin-uuid-1", role: "admin" }],
    categories: [],
    services: [],
    blog_posts: [],
    site_settings: [{ id: 1, whatsapp_primary: "201000000000" }],
    latest_products_config: [{ id: 1, mode: "auto", entries: [] }],
  };

  globalThis.__TEST_DB__ = { ...base, ...overrides };
  globalThis.__TEST_FORCE_ERRORS__ = [];
  globalThis.__TEST_AUTH__ = {
    tokens: { "valid-admin-token": { id: "admin-uuid-1", email: "admin@example.test" } },
    credentials: {
      "admin@example.test": { password: "correct-password", token: "valid-admin-token", user: { id: "admin-uuid-1", email: "admin@example.test" } },
    },
  };

  return globalThis.__TEST_DB__;
}

export function forceNextError(table, mode, error) {
  globalThis.__TEST_FORCE_ERRORS__ = globalThis.__TEST_FORCE_ERRORS__ || [];
  globalThis.__TEST_FORCE_ERRORS__.push({ table, mode, error });
}

export function makeRequest(url, { method = "GET", headers = {}, body, cookie } = {}) {
  const h = { ...headers };
  // A real HTTP server always populates Host from the request line; a
  // hand-built Request object in Node does not, so we set it explicitly to
  // faithfully exercise the same-origin (CSRF) check in lib/requireAdmin.js.
  h["host"] = h["host"] || new URL(url).host;
  if (cookie) h["cookie"] = cookie;
  let bodyStr;
  if (body !== undefined) {
    bodyStr = typeof body === "string" ? body : JSON.stringify(body);
    h["content-type"] = h["content-type"] || "application/json";
    h["content-length"] = String(Buffer.byteLength(bodyStr));
  }
  return new Request(url, { method, headers: h, body: bodyStr });
}

export function adminCookieHeader(token = "valid-admin-token") {
  return `sb-access-token=${token}`;
}

export { assert };
