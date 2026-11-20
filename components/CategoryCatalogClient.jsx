"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronLeft } from "lucide-react";
import CategoryHeader from "./CategoryHeader";
import ProductGrid from "./ProductGrid";
import { PRODUCTS as SEED_PRODUCTS } from "../data/products";
import { SEED_CATEGORIES } from "../data/categories";
import { OFFERS as SEED_OFFERS } from "../data/offers";
import { loadProducts } from "../lib/productsStore";
import { loadOffers, getActiveOffersMap } from "../lib/offersStore";
import { loadCategories, getCategoryBySlug } from "../lib/categoriesStore";

const SORTS = [
  { id: "featured", label: "الأكثر طلبًا" },
  { id: "price_asc", label: "السعر: الأقل أولاً" },
  { id: "price_desc", label: "السعر: الأعلى أولاً" },
];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/60 border border-white/70 overflow-hidden animate-pulse">
          <div className="h-28 sm:h-36 w-full bg-navy/5" />
          <div className="p-3 sm:p-5 space-y-2">
            <div className="h-3 w-16 bg-navy/10 rounded-full" />
            <div className="h-4 w-3/4 bg-navy/10 rounded" />
            <div className="h-4 w-1/3 bg-navy/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// صفحة التصنيف المستقلة: تجربة متجر كاملة (بحث + فلتر + ترتيب) داخل التصنيف ده بس.
// التصنيف نفسه بيتحل من الـ slug وقت التحميل في المتصفح (Supabase عن طريق API) عشان أي تصنيف
// يضيفه الأدمن بعد أول نشر للموقع يفضل شغال بنفس الطريقة، من غير ما يحتاج build جديد.
export default function CategoryCatalogClient({ slug }) {
  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [offersMap, setOffersMap] = useState({});
  const [query, setQuery] = useState("");
  const [discountedOnly, setDiscountedOnly] = useState(false);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    (async () => {
      try {
        const [cats, prods, offers] = await Promise.all([
          loadCategories(SEED_CATEGORIES),
          loadProducts(SEED_PRODUCTS),
          loadOffers(SEED_OFFERS),
        ]);
        setCategory(getCategoryBySlug(cats, slug));
        setProducts(prods);
        setOffersMap(getActiveOffersMap(offers));
      } finally {
        setMounted(true);
      }
    })();
  }, [slug]);

  const categoryProducts = useMemo(
    () => (category ? products.filter((p) => p.category === category.name) : []),
    [products, category]
  );

  const visible = useMemo(() => {
    let list = categoryProducts.filter((p) => p.name.includes(query.trim()));
    if (discountedOnly) list = list.filter((p) => Boolean(offersMap[p.id]));

    const withOffer = (p) => (offersMap[p.id] ? 1 : 0);
    if (sort === "price_asc") {
      list = [...list].sort((a, b) => (offersMap[a.id]?.newPrice ?? a.price) - (offersMap[b.id]?.newPrice ?? b.price));
    } else if (sort === "price_desc") {
      list = [...list].sort((a, b) => (offersMap[b.id]?.newPrice ?? b.price) - (offersMap[a.id]?.newPrice ?? a.price));
    } else {
      list = [...list].sort((a, b) => (withOffer(b) + (b.badge ? 1 : 0)) - (withOffer(a) + (a.badge ? 1 : 0)));
    }
    return list;
  }, [categoryProducts, query, discountedOnly, sort, offersMap]);

  const discountedCount = categoryProducts.filter((p) => offersMap[p.id]).length;

  if (mounted && !category) {
    return (
      <div className="pt-32 pb-24 px-4 text-center text-navy/60">
        <p className="mb-4">هذا التصنيف غير موجود أو تم إخفاؤه.</p>
        <Link href="/" className="text-emerald font-semibold hover:underline">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 min-h-screen bg-ivory">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-5 sm:mb-6">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-navy/50 flex-wrap">
            <li>
              <Link href="/" className="hover:text-emerald transition-colors">
                الرئيسية
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronLeft className="w-3.5 h-3.5" />
            </li>
            <li className="text-navy font-semibold" aria-current="page">
              {category?.name || "..."}
            </li>
          </ol>
        </nav>

        <div className="mb-8 sm:mb-10">
          <CategoryHeader
            title={category?.name || ""}
            description={category?.description}
            count={mounted ? categoryProducts.length : undefined}
            icon={category?.icon}
            image={category?.image}
            size="page"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10 sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`ابحث داخل ${category?.name || ""}...`}
              aria-label={`ابحث داخل ${category?.name || ""}`}
              className="w-full rounded-full bg-white border border-navy/10 pr-11 pl-4 py-3 text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-emerald/40 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {discountedCount > 0 && (
              <button
                onClick={() => setDiscountedOnly((v) => !v)}
                aria-pressed={discountedOnly}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 min-h-[42px] text-xs sm:text-sm font-semibold border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald/30 ${
                  discountedOnly
                    ? "bg-emerald text-ivory border-emerald"
                    : "bg-white text-navy/70 border-navy/10 hover:border-emerald/40 hover:text-emerald"
                }`}
              >
                عليها خصم فقط
              </button>
            )}

            <div className="relative">
              <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-navy/40 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="ترتيب المنتجات"
                className="appearance-none rounded-full bg-white border border-navy/10 pr-9 pl-4 py-2.5 min-h-[42px] text-xs sm:text-sm font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-emerald/30 shadow-sm"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!mounted ? (
          <SkeletonGrid />
        ) : (
          <ProductGrid
            products={visible}
            offersMap={offersMap}
            emptyMessage="لا توجد منتجات مطابقة — جرّب كلمة بحث مختلفة أو ألغِ فلتر الخصم."
          />
        )}
      </div>
    </div>
  );
}
