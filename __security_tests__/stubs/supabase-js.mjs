// ============================================================================
// TEST-ONLY fake for @supabase/supabase-js, used solely by the security test
// harness in __security_tests__ (not part of the shipped app — this file is
// never resolved unless __security_tests__/esm-loader.mjs is registered).
//
// This lets the *real, unmodified* app/api/**/route.js and lib/*.js files be
// imported and executed by the test scripts against an in-memory database,
// without any network access or the real Supabase SDK installed (this
// sandbox has no npm registry access).
//
// IMPORTANT — this is NOT a substitute for testing against real Postgres/RLS.
// It implements just enough of the query-builder surface that this project's
// route files actually use (select/eq/in/order/single/maybeSingle/insert/
// update/delete, plus a minimal auth mock). It does NOT enforce Row Level
// Security, constraints, foreign keys, or unique indexes. Anything asserted
// purely against this fake is a "mocked integration test" of the route
// handlers' own logic (auth checks, price recalculation, validation, error
// handling) — never proof that the RLS policies in supabase/schema*.sql
// actually behave a given way on a real database. See
// __security_tests__/README.md for the full breakdown of test categories.
// ============================================================================

function getDb() {
  if (!globalThis.__TEST_DB__) {
    throw new Error("__TEST_DB__ not initialized — call resetTestDb() before using supabaseAdmin in a test");
  }
  return globalThis.__TEST_DB__;
}

function getErrorPlan() {
  globalThis.__TEST_FORCE_ERRORS__ = globalThis.__TEST_FORCE_ERRORS__ || [];
  return globalThis.__TEST_FORCE_ERRORS__;
}

function maybeForcedError(table, mode) {
  const plan = getErrorPlan();
  const idx = plan.findIndex((e) => e.table === table && e.mode === mode);
  if (idx === -1) return null;
  const [entry] = plan.splice(idx, 1); // one-shot
  return entry.error || { message: "simulated failure", code: entry.code || "SIMULATED" };
}

function pick(row, colsSpec) {
  if (!colsSpec || colsSpec === "*") return { ...row };
  // supports "a, b, c" (nested "foo(bar)" join syntax is stripped and
  // exposed as null — this project only uses that for products.categories(),
  // which isn't exercised by the orders/customers/auth tests)
  const out = {};
  const parts = colsSpec.split(",").map((s) => s.trim());
  for (const part of parts) {
    const joinMatch = part.match(/^(\w+)\(([^)]*)\)$/);
    if (joinMatch) {
      out[joinMatch[1]] = row[joinMatch[1]] ?? null;
      continue;
    }
    if (part in row) out[part] = row[part];
  }
  return out;
}

const idCounters = {};
function nextId(table, db) {
  if (!idCounters[table]) {
    const existingMax = (db[table] || []).reduce((m, r) => (typeof r.id === "number" && r.id > m ? r.id : m), 0);
    idCounters[table] = existingMax;
  }
  idCounters[table] += 1;
  return idCounters[table];
}

class QueryBuilder {
  constructor(db, table) {
    this.db = db;
    this.table = table;
    this._filters = [];
    this._mode = null; // 'select' | 'insert' | 'update' | 'delete'
    this._selectCols = null;
    this._order = null;
    this._insertPayload = null;
    this._updatePayload = null;
    this._single = false;
    this._maybeSingle = false;
    this._countHead = false;
  }

  select(cols, opts) {
    if (this._mode === null) this._mode = "select";
    this._selectCols = cols || this._selectCols;
    if (opts && opts.count) this._countHead = Boolean(opts.head);
    return this;
  }

  eq(col, val) {
    // loose equality: mimics Postgres/PostgREST coercing a route param
    // string ("3") against a numeric column (3), which real Supabase
    // handles transparently.
    // eslint-disable-next-line eqeqeq
    this._filters.push((r) => r[col] == val);
    return this;
  }

  in(col, vals) {
    // eslint-disable-next-line eqeqeq
    this._filters.push((r) => vals.some((v) => v == r[col]));
    return this;
  }

  order(col, { ascending = true } = {}) {
    this._order = { col, ascending };
    return this;
  }

  insert(payload) {
    this._mode = "insert";
    this._insertPayload = payload;
    return this;
  }

  update(payload) {
    this._mode = "update";
    this._updatePayload = payload;
    return this;
  }

  delete() {
    this._mode = "delete";
    return this;
  }

  single() {
    this._single = true;
    return this._exec();
  }

  maybeSingle() {
    this._maybeSingle = true;
    return this._exec();
  }

  then(resolve, reject) {
    return this._exec().then(resolve, reject);
  }

  async _exec() {
    const forced = maybeForcedError(this.table, this._mode || "select");
    if (forced) {
      if (this._countHead) return { data: null, error: forced, count: null };
      return { data: null, error: forced };
    }

    const table = this.db[this.table] || (this.db[this.table] = []);
    const mode = this._mode || "select";

    if (mode === "select") {
      let rows = table.filter((r) => this._filters.every((f) => f(r)));
      if (this._countHead) return { data: null, error: null, count: rows.length };
      if (this._order) {
        rows = [...rows].sort((a, b) => {
          const av = a[this._order.col];
          const bv = b[this._order.col];
          if (av === bv) return 0;
          if (av == null) return this._order.ascending ? -1 : 1;
          if (bv == null) return this._order.ascending ? 1 : -1;
          return (av < bv ? -1 : 1) * (this._order.ascending ? 1 : -1);
        });
      }
      const projected = rows.map((r) => pick(r, this._selectCols));
      if (this._single) {
        if (projected.length !== 1) return { data: null, error: { message: "no rows / multiple rows", code: "PGRST116" } };
        return { data: projected[0], error: null };
      }
      if (this._maybeSingle) {
        if (projected.length === 0) return { data: null, error: null };
        if (projected.length > 1) return { data: null, error: { message: "multiple rows" } };
        return { data: projected[0], error: null };
      }
      return { data: projected, error: null };
    }

    if (mode === "insert") {
      const items = Array.isArray(this._insertPayload) ? this._insertPayload : [this._insertPayload];
      const inserted = items.map((item) => {
        const row = {
          id: item.id != null ? item.id : nextId(this.table, this.db),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...item,
        };
        table.push(row);
        return row;
      });
      const projected = inserted.map((r) => pick(r, this._selectCols));
      if (this._single) return { data: projected[0], error: null };
      return { data: projected, error: null };
    }

    if (mode === "update") {
      const matched = table.filter((r) => this._filters.every((f) => f(r)));
      matched.forEach((r) => Object.assign(r, this._updatePayload, { updated_at: new Date().toISOString() }));
      const projected = matched.map((r) => pick(r, this._selectCols));
      if (this._single) {
        if (projected.length !== 1) return { data: null, error: { message: "no rows / multiple rows", code: "PGRST116" } };
        return { data: projected[0], error: null };
      }
      return { data: projected, error: null };
    }

    if (mode === "delete") {
      this.db[this.table] = table.filter((r) => !this._filters.every((f) => f(r)));
      return { data: null, error: null };
    }

    throw new Error(`FakeSupabase: unsupported mode ${mode}`);
  }
}

function makeAuth() {
  return {
    async getUser(token) {
      const auth = globalThis.__TEST_AUTH__ || { tokens: {} };
      const user = auth.tokens[token];
      if (!user) return { data: { user: null }, error: { message: "invalid token" } };
      return { data: { user }, error: null };
    },
    async signInWithPassword({ email, password }) {
      const auth = globalThis.__TEST_AUTH__ || { credentials: {} };
      const rec = auth.credentials[email];
      if (!rec || rec.password !== password) {
        return { data: { session: null, user: null }, error: { message: "invalid credentials" } };
      }
      return { data: { session: { access_token: rec.token, expires_in: 3600 }, user: rec.user }, error: null };
    },
  };
}

function makeStorage() {
  return {
    from(bucket) {
      return {
        async upload(path, buffer) {
          const db = getDb();
          db.__storage = db.__storage || {};
          db.__storage[bucket] = db.__storage[bucket] || {};
          db.__storage[bucket][path] = { buffer };
          return { data: { path }, error: null };
        },
        getPublicUrl(path) {
          return { data: { publicUrl: `https://fake-storage.test/${bucket}/${path}` } };
        },
        async remove(paths) {
          const db = getDb();
          db.__storage = db.__storage || {};
          db.__storage[bucket] = db.__storage[bucket] || {};
          for (const p of paths) delete db.__storage[bucket][p];
          return { data: null, error: null };
        },
      };
    },
  };
}

export function createClient() {
  return {
    from(table) {
      return new QueryBuilder(getDb(), table);
    },
    auth: makeAuth(),
    storage: makeStorage(),
  };
}
