import "./env.mjs";
import test from "node:test";
import { resetTestDb, forceNextError, makeRequest, adminCookieHeader, assert } from "./testDb.mjs";

const { PUT: putProduct } = await import("../app/api/products/[id]/route.js");
const { GET: getCustomers } = await import("../app/api/customers/route.js");
const { GET: getCustomerById } = await import("../app/api/customers/[id]/route.js");
const { GET: getCategories, PUT: putCategoriesBulk } = await import("../app/api/categories/route.js");
const { POST: login } = await import("../app/api/auth/login/route.js");

function adminReq(url, { method = "GET", body, cookie = adminCookieHeader(), origin, ip } = {}) {
  const headers = {};
  if (origin !== undefined) headers["origin"] = origin;
  if (ip) headers["x-forwarded-for"] = ip;
  return makeRequest(url, { method, body, cookie, headers });
}

test("UNAUTHORIZED ACCESS: admin-only routes reject requests with no session cookie, with a normal error shape", async () => {
  resetTestDb();
  const res = await putProduct(adminReq("http://localhost/api/products/1", { method: "PUT", body: { price: 10 }, cookie: null }), {
    params: { id: "1" },
  });
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(typeof data.error, "string");
});

test("UNAUTHORIZED ACCESS: GET /api/customers (sensitive PII) requires admin", async () => {
  resetTestDb();
  const noAuth = await getCustomers(makeRequest("http://localhost/api/customers"));
  assert.equal(noAuth.status, 401);

  const withAuth = await getCustomers(adminReq("http://localhost/api/customers"));
  assert.equal(withAuth.status, 200);
  const data = await withAuth.json();
  assert.ok(Array.isArray(data));
});

test("UNAUTHORIZED ACCESS: GET /api/customers/:id (single customer record) requires admin", async () => {
  resetTestDb();
  const noAuth = await getCustomerById(makeRequest("http://localhost/api/customers/100"), { params: { id: "100" } });
  assert.equal(noAuth.status, 401);
});

test("CSRF DEFENSE-IN-DEPTH: a valid admin cookie is rejected on a cross-origin write (mismatched Origin header)", async () => {
  resetTestDb();
  const res = await putProduct(
    adminReq("http://localhost/api/products/1", { method: "PUT", body: { price: 999 }, origin: "https://evil-attacker.example" }),
    { params: { id: "1" } }
  );
  assert.equal(res.status, 401);
});

test("CSRF DEFENSE-IN-DEPTH: same-origin admin write still works normally", async () => {
  const db = resetTestDb();
  const res = await putProduct(adminReq("http://localhost/api/products/1", { method: "PUT", body: { price: 99 }, origin: "http://localhost" }), {
    params: { id: "1" },
  });
  assert.equal(res.status, 200);
  assert.equal(db.products.find((p) => p.id === 1).price, 99);
});

test("CSRF DEFENSE-IN-DEPTH: a write request with NO Origin header at all is still allowed through to the auth check (not blocked outright)", async () => {
  resetTestDb();
  // some legitimate same-site requests omit Origin; the route must fall back
  // to the normal cookie/role check rather than blocking everything with no
  // Origin header.
  const res = await putProduct(adminReq("http://localhost/api/products/1", { method: "PUT", body: { price: 77 } }), { params: { id: "1" } });
  assert.equal(res.status, 200);
});

test("SAFE ERRORS: forced DB failure on an admin route returns a generic message, not the raw Postgres error", async () => {
  resetTestDb();
  forceNextError("categories", "select", { message: "column categories.sort_order does not exist — SUPER SECRET SCHEMA DETAIL", code: "42703" });
  const res = await getCategories();
  assert.equal(res.status, 500);
  const data = await res.json();
  assert.doesNotMatch(JSON.stringify(data), /SUPER SECRET SCHEMA DETAIL|42703/);
  assert.equal(typeof data.error, "string");
});

test("SAFE ERRORS: unique-constraint conflicts still return their specific, intentional message (not swallowed by the generic handler)", async () => {
  const db = resetTestDb();
  db.categories.push({ id: 1, name: "أدوية", slug: "medicine", sort_order: 1 });
  db.categories.push({ id: 2, name: "أخرى", slug: "other", sort_order: 2 });
  forceNextError("categories", "update", { message: "duplicate key value violates unique constraint", code: "23505" });
  const { PUT: putCategoryById } = await import("../app/api/categories/[id]/route.js");
  const res = await putCategoryById(adminReq("http://localhost/api/categories/2", { method: "PUT", body: { slug: "medicine" } }), {
    params: { id: "2" },
  });
  assert.equal(res.status, 409);
  const data = await res.json();
  assert.match(data.error, /مستخدم بالفعل/);
});

test("RESPONSE FORMAT UNCHANGED: bulk categories PUT still returns an array of camelCase rows on success", async () => {
  const db = resetTestDb();
  db.categories.push({ id: 1, name: "أدوية", slug: "medicine", sort_order: 1 });
  const res = await putCategoriesBulk(adminReq("http://localhost/api/categories", { method: "PUT", body: [{ id: 1, sortOrder: 5 }] }));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.equal(data[0].sortOrder, 5);
});

test("LOGIN: wrong password returns generic 401, right password + admin role returns success with httpOnly cookie set", async () => {
  resetTestDb();
  const bad = await login(makeRequest("http://localhost/api/auth/login", { method: "POST", body: { email: "admin@example.test", password: "wrong" } }));
  assert.equal(bad.status, 401);

  const good = await login(
    makeRequest("http://localhost/api/auth/login", { method: "POST", body: { email: "admin@example.test", password: "correct-password" } })
  );
  assert.equal(good.status, 200);
  assert.ok(good.cookies.get("sb-access-token"));
  assert.equal(good.cookies.get("sb-access-token").opts.httpOnly, true);
});

test("LOGIN RATE LIMITING: 11th login attempt from the same IP within the window is throttled (limit=10)", async () => {
  resetTestDb();
  let lastStatus;
  for (let i = 0; i < 11; i++) {
    const res = await login(
      makeRequest("http://localhost/api/auth/login", {
        method: "POST",
        headers: { "x-forwarded-for": "192.0.2.50" },
        body: { email: "admin@example.test", password: "wrong" },
      })
    );
    lastStatus = res.status;
  }
  assert.equal(lastStatus, 429);
});

test("LOGIN: non-admin Supabase user (valid credentials, no admin role) is rejected with 403, not given a session", async () => {
  resetTestDb();
  globalThis.__TEST_AUTH__.credentials["staff@example.test"] = {
    password: "pw12345",
    token: "staff-token",
    user: { id: "staff-uuid-1", email: "staff@example.test" },
  };
  // no user_roles row for staff-uuid-1 -> not an admin
  const res = await login(
    makeRequest("http://localhost/api/auth/login", { method: "POST", body: { email: "staff@example.test", password: "pw12345" } })
  );
  assert.equal(res.status, 403);
});
