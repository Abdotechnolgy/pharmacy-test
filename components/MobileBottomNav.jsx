"use client";

import Link from "next/link";
import { Home, Package, ShoppingBag, Tag, MessageCircle } from "lucide-react";
import { waLink } from "../data/site";
import { useCart } from "../context/CartContext";

export default function MobileBottomNav() {
  const { count, open } = useCart();

  const items = [
    { label: "الرئيسية", icon: Home, href: "/" },
    { label: "المنتجات", icon: Package, href: "/categories" },
    { label: "العروض", icon: Tag, href: "/offers" },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-t border-navy/10 shadow-[0_-8px_24px_rgba(14,42,74,0.08)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="التنقل السريع"
    >
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-1 py-2.5 text-navy/60 hover:text-emerald transition-colors">
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}

        <button onClick={open} className="relative flex flex-col items-center justify-center gap-1 py-2.5 text-navy/60 hover:text-emerald transition-colors">
          <span className="relative">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-gold text-navy text-[9px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </span>
          <span className="text-[10px] font-semibold">السلة</span>
        </button>

        <a
          href={waLink("مرحبًا، أرغب في التواصل مع الصيدلية")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[#25D366] hover:opacity-80 transition-opacity"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-semibold">واتساب</span>
        </a>
      </div>
    </nav>
  );
}
