// TEST-ONLY stub for next/headers. Only cookies() is used, and only by
// lib/adminAuth.js's getAdminUser() (the next/headers-based helper used by
// Server Components/Actions) — the API route tests in __security_tests__
// exercise getAdminUserFromRequest() instead, which reads headers off the
// Request object directly and never calls this. This stub just needs to
// exist so the top-level `import { cookies } from "next/headers"` in
// lib/adminAuth.js doesn't crash module loading under plain Node.
// Not part of the shipped app — see __security_tests__/README.md.
export function cookies() {
  return { get: () => undefined };
}
