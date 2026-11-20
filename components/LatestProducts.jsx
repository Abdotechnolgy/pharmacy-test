"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { PRODUCTS as SEED_PRODUCTS } from "../data/products";
import { OFFERS as SEED_OFFERS } from "../data/offers";
import { loadProducts } from "../lib/productsStore";
import { loadOffers, getActiveOffersMap } from "../lib/offersStore";
import { loadLatestProductsConfig, resolveLatestProducts } from "../lib/latestProductsStore";

const LATEST_COUNT = 6;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// قسم "أحدث المنتجات" — Discovery بس، مش صفحة منتجات مصغّرة: مفيش Search/Filter/Sort
// هنا خالص. الأدمن يقدر يحدد المنتجات وترتيبها يدويًا من /admin/latest-products.
// لو مفيش تحديد يدوي (أو المنتجات المختارة اتحذفت)، بيرجع تلقائيًا للـ fallback:
// الأحدث حسب الـ id (الأدمن بيدي أي منتج جديد id = أكبر id + 1، فالـ id الأكبر
// = المنتج المُضاف لاحقًا فعليًا — مفيش تاريخ وهمي).
export default function LatestProducts() {
  const [products, setProducts] = useState([]);
  const [offersMap, setOffersMap] = useState({});
  const [quickView, setQuickView] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [loaded, config, offers] = await Promise.all([
        loadProducts(SEED_PRODUCTS),
        loadLatestProductsConfig(),
        loadOffers(SEED_OFFERS),
      ]);
      setProducts(resolveLatestProducts(config, loaded, LATEST_COUNT));
      setOffersMap(getActiveOffersMap(offers));
    })();
  }, []);

  if (products.length === 0) return null;

  const scrollByStep = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.8) * direction;
    el.scrollBy({ left: step, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const handleQuickView = (product, offer) => setQuickView({ product, offer });
  const modalPrice = quickView && (quickView.offer ? quickView.offer.newPrice : quickView.product.price);

  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6 bg-ivory">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-2xl md:text-3xl text-navy">أحدث المنتجات</h2>
            <p className="text-navy/55 text-xs sm:text-sm mt-1">وصل حديثًا إلى الصيدلية</p>
          </div>
          <Link
            href="/categories"
            className="shrink-0 inline-flex items-center gap-1.5 text-emerald text-xs sm:text-sm font-semibold hover:gap-2 transition-all duration-300"
          >
            عرض الكل
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="relative">
          {/* أسهم التنقل — Desktop/Tablet بس، مفيش لمس يلغيها */}
          <button
            type="button"
            onClick={() => scrollByStep(1)}
            aria-label="السابق"
            className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-white border border-navy/10 text-navy shadow-md hover:bg-emerald hover:text-ivory hover:border-emerald transition-colors focus:outline-none focus:ring-2 focus:ring-emerald/40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByStep(-1)}
            aria-label="التالي"
            className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-white border border-navy/10 text-navy shadow-md hover:bg-emerald hover:text-ivory hover:border-emerald transition-colors focus:outline-none focus:ring-2 focus:ring-emerald/40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={trackRef}
            role="list"
            aria-label="أحدث المنتجات"
            className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 -mx-4 px-4 sm:mx-0 sm:px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {products.map((p) => (
              <div key={p.id} role="listitem" className="shrink-0 snap-start w-[78%] sm:w-[46%] md:w-[31%] lg:w-[24%]">
                <ProductCard product={p} offer={offersMap[p.id]} onQuickView={handleQuickView} compact />
              </div>
            ))}
          </div>
        </div>
      </div>

      {quickView && (
        <ProductModal
          product={{
            ...quickView.product,
            price: modalPrice,
            oldPrice: quickView.offer ? quickView.offer.oldPrice : undefined,
          }}
          onClose={() => setQuickView(null)}
        />
      )}
    </section>
  );
}
