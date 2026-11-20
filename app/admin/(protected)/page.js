"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ShoppingCart, Wallet, Users, Tag, Layers, Plus, ExternalLink, ArrowLeft } from "lucide-react";
import StatCard from "../../../components/admin/StatCard";
import OfferCard from "../../../components/OfferCard";
import { PRODUCTS as SEED_PRODUCTS } from "../../../data/products";
import { SEED_CATEGORIES } from "../../../data/categories";
import { OFFERS as SEED_OFFERS } from "../../../data/offers";
import { loadProducts } from "../../../lib/productsStore";
import { loadOffers, isOfferLive, enrichOffer } from "../../../lib/offersStore";
import { loadCategories } from "../../../lib/categoriesStore";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [liveOffers, setLiveOffers] = useState([]);
  const [categoriesCount, setCategoriesCount] = useState(SEED_CATEGORIES.length);

  // --- حالات جديدة للإحصائيات الحقيقية المربوطة بقاعدة البيانات ---
  const [orders, setOrders] = useState([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    (async () => {
      // 1. جلب البيانات الأساسية (المنتجات، العروض، التصنيفات)
      const [p, offers, cats] = await Promise.all([
        loadProducts(SEED_PRODUCTS),
        loadOffers(SEED_OFFERS),
        loadCategories(SEED_CATEGORIES),
      ]);
      setProducts(p);
      setLiveOffers(
        offers
          .filter(isOfferLive)
          .map((o) => enrichOffer(o, p))
          .filter(Boolean)
      );
      setCategoriesCount(cats.length);

      // 2. جلب بيانات الطلبات والعملاء من الـ APIs الخاصة بقاعدة البيانات
      try {
        const [ordersRes, customersRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/customers')
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);

          // حساب إجمالي المبيعات (نستبعد الطلبات الملغاة أو المرفوضة)
          const sales = ordersData
            .filter(order => order.status !== 'cancelled' && order.status !== 'ملغي')
            .reduce((acc, order) => acc + Number(order.total || 0), 0);
          setTotalSales(sales);
        }

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setCustomersCount(customersData.length);
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات الإحصائيات:", error);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-navy text-xl sm:text-2xl">لوحة تحكم صيدلية د. سالم أحمد فؤاد</h1>
        <p className="text-sm text-navy/50 mt-1">نظرة عامة سريعة على المتجر</p>
      </div>

      {/* Stat cards - تم فك الأقفال وربط البيانات الحقيقية */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Package} label="إجمالي المنتجات" value={products.length} />
        <StatCard icon={Tag} label="العروض النشطة" value={liveOffers.length} />
        <StatCard icon={Layers} label="التصنيفات" value={categoriesCount} />
        
        <StatCard
          icon={ShoppingCart}
          label="إجمالي الطلبات"
          value={orders.length}
        />
        <StatCard 
          icon={Wallet} 
          label="إجمالي المبيعات" 
          value={`EGP ${totalSales.toLocaleString()}`} 
        />
        <StatCard 
          icon={Users} 
          label="عدد العملاء" 
          value={customersCount} 
        />
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl bg-white border border-navy/10 p-5 mb-10">
        <h2 className="font-display font-semibold text-navy text-sm mb-4">إجراءات سريعة</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          <Link href="/admin/products" className="flex items-center justify-center gap-2 rounded-xl bg-emerald text-ivory py-3 text-sm font-semibold hover:bg-navy transition-colors">
            <Plus className="w-4 h-4" />
            إضافة منتج
          </Link>
          <Link href="/admin/offers" className="flex items-center justify-center gap-2 rounded-xl bg-gold text-navy py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            إضافة عرض
          </Link>
          <Link href="/admin/orders" className="flex items-center justify-center gap-2 rounded-xl bg-navy/5 text-navy py-3 text-sm font-semibold hover:bg-navy/10 transition-colors">
            <ShoppingCart className="w-4 h-4" />
            عرض الطلبات
          </Link>
          <Link href="/" target="_blank" className="flex items-center justify-center gap-2 rounded-xl bg-navy/5 text-navy py-3 text-sm font-semibold hover:bg-navy/10 transition-colors">
            <ExternalLink className="w-4 h-4" />
            فتح الموقع
          </Link>
        </div>
      </div>

      {/* Active offers preview */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-navy text-sm">العروض النشطة</h2>
          <Link href="/admin/offers" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald hover:text-navy">
            إدارة العروض
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
        {liveOffers.length === 0 ? (
          <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-8 text-center text-navy/50 text-sm">
            مفيش عروض نشطة دلوقتي —{" "}
            <Link href="/admin/offers" className="text-emerald font-semibold hover:underline">
              أضف عرضك الأول
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveOffers.slice(0, 3).map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>

      {/* Orders / top sellers — تم تفعيل قسم آخر الطلبات ليعرض بيانات حية */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-navy/10 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-navy text-sm mb-4">آخر الطلبات</h2>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div>
                    <p className="text-sm font-semibold">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-emerald block">EGP {order.total}</span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{order.status === 'pending' ? 'قيد المراجعة' : order.status}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <Link href="/admin/orders" className="text-xs font-semibold text-emerald hover:underline">
                  إدارة كل الطلبات
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-xs text-navy/50 leading-relaxed text-center py-4">
              لا توجد طلبات مسجلة حتى الآن.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-6">
          <h2 className="font-display font-semibold text-navy text-sm mb-2">أكثر المنتجات مبيعًا</h2>
          <p className="text-xs text-navy/50 leading-relaxed">
            يتم الآن تتبع المبيعات الحقيقية من قاعدة البيانات. سيتم تفعيل عرض المنتجات الأكثر مبيعاً هنا بناءً على تفاصيل الطلبات المكتملة.
          </p>
        </div>
      </div>
    </div>
  );
}