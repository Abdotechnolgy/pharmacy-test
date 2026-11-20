// TEST-ONLY stub for next/server's NextResponse — enough to exercise
// app/api/auth/login and logout route handlers under plain Node, without the
// real Next.js runtime installed (this sandbox has no npm registry access).
// Not part of the shipped app — see __security_tests__/README.md.
class CookieJar {
  constructor() {
    this._cookies = {};
  }
  set(name, value, opts) {
    this._cookies[name] = { value, opts };
  }
  get(name) {
    return this._cookies[name];
  }
}

export const NextResponse = {
  json(body, init = {}) {
    const res = Response.json(body, init);
    res.cookies = new CookieJar();
    return res;
  },
};
