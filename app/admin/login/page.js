"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import LogoMark from "../../../components/LogoMark";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حصل خطأ أثناء تسجيل الدخول");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("مقدرناش نوصل للسيرفر، حاول تاني");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4" dir="rtl">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-8 text-center">
        <LogoMark className="w-14 h-14 mx-auto mb-4" />
        <h1 className="font-display font-bold text-ivory text-lg mb-1">لوحة تحكم الصيدلية</h1>
        <p className="text-ivory/50 text-xs mb-6">تسجيل دخول حقيقي عن طريق Supabase Auth</p>

        <div className="relative mb-3">
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/40" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="الإيميل"
            aria-label="الإيميل"
            required
            autoFocus
            className="w-full rounded-xl bg-white/10 border border-white/15 text-ivory placeholder:text-ivory/30 pr-11 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>

        <div className="relative mb-3">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory/40" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة السر"
            aria-label="كلمة السر"
            required
            className="w-full rounded-xl bg-white/10 border border-white/15 text-ivory placeholder:text-ivory/30 pr-11 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>

        {error && (
          <p role="alert" className="text-red-300 text-xs mb-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gold text-navy font-semibold py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "جاري الدخول..." : "دخول"}
        </button>

        <div className="flex items-start gap-1.5 text-ivory/35 text-[11px] mt-5 text-right leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>حساب حقيقي مُدار عن طريق Supabase Auth — لازم يكون متسجّل كأدمن في قاعدة البيانات.</span>
        </div>

        <Link href="/" className="inline-flex items-center gap-1.5 text-ivory/50 text-xs mt-4 hover:text-ivory">
          <ArrowRight className="w-3.5 h-3.5" />
          الرجوع للموقع
        </Link>
      </form>
    </div>
  );
}
