import { NextResponse } from "next/server";

// حماية أولى سريعة على مستوى الـ Edge: أي حد يفتح /admin/* من غير الـ session
// cookie بيتحوّل فورًا لصفحة الدخول، قبل ما أي كود أو بيانات إدارية تتحمّل خالص.
// ده مش بديل للتحقق الكامل (اللي بيحصل في app/admin/(protected)/layout.js
// وبيتأكد كمان إن المستخدم عنده دور admin فعلي في قاعدة البيانات) — ده بس أول
// خط دفاع سريع.
const SESSION_COOKIE = "sb-access-token";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
