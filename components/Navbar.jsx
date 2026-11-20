"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronLeft, ShoppingBag, Search } from "lucide-react";
import LogoMark from "./LogoMark";
import { waLink } from "../data/site";
import { useCart } from "../context/CartContext";

const NAV_LINKS = [
  { label: "الرئيسية", href: "#hero" },
  { label: "خدماتنا", href: "#services" },
  { label: "المنتجات", href: "/categories" },
  { label: "العروض", href: "/offers" },
  { label: "آراء العملاء", href: "#testimonials" },
  { label: "الأسئلة الشائعة", href: "#faq" },
  { label: "اتصل بنا", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, open: openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
      <nav
        className={`mx-auto max-w-6xl px-5 flex items-center justify-between rounded-2xl transition-all duration-500 ${
          scrolled
            ? "bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(14,42,74,0.10)] border border-white/60 py-2"
            : "bg-white/30 backdrop-blur-md border border-white/40 py-3"
        }`}
      >
        <a href="#hero" className="flex items-center gap-3 shrink-0">
          <LogoMark className="w-11 h-11" />
          <div className="leading-tight hidden sm:block">
            <p className="font-display font-bold text-emerald text-sm sm:text-base">صيدلية الدكتور</p>
            <p className="font-display font-extrabold text-navy text-sm sm:text-base -mt-0.5">سالم أحمد فؤاد</p>
          </div>
        </a>

        <ul className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => {
            const isRoute = l.href.startsWith("/");
            const LinkTag = isRoute ? Link : "a";
            return (
              <li key={l.href}>
                <LinkTag
                  href={l.href}
                  className="text-navy/80 hover:text-emerald text-sm font-medium transition-colors relative group"
                >
                  {l.label}
                  <span className="absolute -bottom-1 right-0 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
                </LinkTag>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald bg-emerald/10 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
            مفتوحة الآن
          </span>
          <button onClick={openCart} aria-label="السلة" className="relative p-2 rounded-full text-navy hover:bg-navy/5 transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <a
            href={waLink("مرحبًا، أرغب في حجز طلبي من الصيدلية")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald text-ivory px-5 py-2.5 text-sm font-semibold shadow-[0_10px_25px_rgba(10,75,66,0.35)] hover:bg-navy transition-all duration-300"
          >
            احجز طلبك
            <ChevronLeft className="w-4 h-4" />
          </a>
        </div>

        <div className="flex items-center gap-0.5 lg:hidden">
          <Link href="/categories" aria-label="ابحث عن منتج" className="p-2.5 rounded-lg text-emerald">
            <Search className="w-6 h-6" />
          </Link>
          <button onClick={openCart} aria-label="السلة" className="relative p-2.5 rounded-lg text-emerald">
            <ShoppingBag className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button className="p-2.5 rounded-lg text-emerald" onClick={() => setMenuOpen((v) => !v)} aria-label="القائمة">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="lg:hidden mx-4 mt-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map((l) => {
            const isRoute = l.href.startsWith("/");
            const LinkTag = isRoute ? Link : "a";
            return (
              <LinkTag key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-navy font-medium py-1 border-b border-navy/5 last:border-0">
                {l.label}
              </LinkTag>
            );
          })}
          <a
            href={waLink("مرحبًا، أرغب في حجز طلبي من الصيدلية")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex justify-center items-center gap-2 rounded-full bg-emerald text-ivory px-5 py-3 text-sm font-semibold"
          >
            احجز طلبك عبر واتساب
          </a>
        </div>
      )}
    </header>
  );
}
