"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Layers,
  Users,
  Newspaper,
  Settings,
  Sparkles,
  Clock3,
  Menu,
  X,
  ArrowRight,
  LogOut,
} from "lucide-react";
import LogoMark from "../LogoMark";

const NAV = [
  { label: "الرئيسية", href: "/admin", icon: LayoutDashboard },
  { label: "المنتجات", href: "/admin/products", icon: Package },
  { label: "الطلبات", href: "/admin/orders", icon: ShoppingCart },
  { label: "العروض", href: "/admin/offers", icon: Tag },
  { label: "التصنيفات", href: "/admin/categories", icon: Layers },
  { label: "الخدمات", href: "/admin/services", icon: Sparkles },
  { label: "أحدث المنتجات", href: "/admin/latest-products", icon: Clock3 },
  { label: "العملاء", href: "/admin/customers", icon: Users },
  { label: "المدونة", href: "/admin/blog", icon: Newspaper },
  { label: "الإعدادات", href: "/admin/settings", icon: Settings },
];

function SidebarContent({ pathname, onNavigate }) {
  return (
    <>
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3 px-2 mb-8">
        <LogoMark className="w-10 h-10" />
        <div className="leading-tight">
          <p className="font-display font-bold text-ivory text-sm">لوحة تحكم</p>
          <p className="font-display font-extrabold text-gold text-sm -mt-0.5">صيدلية د. سالم</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-gold text-navy" : "text-ivory/70 hover:bg-white/10 hover:text-ivory"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-1">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ivory/60 hover:bg-white/10 hover:text-ivory transition-colors">
          <ArrowRight className="w-[18px] h-[18px]" />
          فتح الموقع
        </Link>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ivory/60 hover:bg-white/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          تسجيل الخروج
        </button>
      </div>
    </>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage = NAV.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(n.href)));

  return (
    <div className="min-h-screen bg-mist lg:flex" dir="rtl">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-navy px-4 py-6 flex-col fixed inset-y-0 right-0 z-30">
        <SidebarContent pathname={pathname} onNavigate={() => {}} />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-72 bg-navy px-4 py-6 flex flex-col shadow-2xl">
            <button onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة" className="self-start p-2 mb-2 text-ivory/60 hover:text-ivory">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:mr-64">
        <header className="lg:hidden sticky top-0 z-20 bg-navy px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="w-8 h-8" />
            <span className="font-display font-bold text-ivory text-sm">{currentPage?.label || "لوحة التحكم"}</span>
          </div>
          <button onClick={() => setMobileOpen(true)} aria-label="فتح القائمة" className="p-2 text-ivory">
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="px-4 sm:px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
