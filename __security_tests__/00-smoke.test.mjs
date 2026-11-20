import "./env.mjs";
import test from "node:test";
import { resetTestDb, makeRequest, adminCookieHeader, assert } from "./testDb.mjs";

test("smoke: real orders route module loads and GET works with admin cookie", async () => {
  resetTestDb();
  const { GET } = await import("../app/api/orders/route.js");
  const req = makeRequest("http://localhost/api/orders", {
    method: "GET",
    cookie: adminCookieHeader(),
  });
  const res = await GET(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data));
});

test("smoke: GET /api/orders without admin cookie is rejected", async () => {
  resetTestDb();
  const { GET } = await import("../app/api/orders/route.js");
  const req = makeRequest("http://localhost/api/orders", { method: "GET" });
  const res = await GET(req);
  assert.equal(res.status, 401);
});
