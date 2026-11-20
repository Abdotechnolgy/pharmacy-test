"use client";

import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import CategoryCard from "./CategoryCard";
import ViewAllButton from "./ViewAllButton";
import { SEED_CATEGORIES } from "../data/categories";
import { PRODUCTS as SEED_PRODUCTS } from "../data/products";
import { loadCategories, getHomepageCategories, countProductsInCategory, loadHomepageLimit } from "../lib/categoriesStore";
import { loadProducts } from "../lib/productsStore";

// واجهة اكتشاف سريعة للتصنيفات: كارد مميز واحد + باقي التصنيفات جنبه.
// على الموبايل: Horizontal snap carousel (سريع الفهم، ما ياخدش مساحة رأسية كبيرة).
// على الشاشات الأكبر: Bento grid (كارد كبير + شبكة كروت أصغر).
// بيعرض حد أقصى (homepageLimit، افتراضيًا 8) بغض النظر عن عدد التصنيفات الكلي —
// عشان الصفحة الرئيسية تفضل قصيرة حتى لو بقى عندنا 15 أو 20 تصنيف مستقبلًا.
export default function CategoryShowcase() {
  const [allHomepageCategories, setAllHomepageCategories] = useState(getHomepageCategories(SEED_CATEGORIES));
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [limit, setLimit] = useState(null);

  useEffect(() => {
    (async () => {
      const [cats, prods, homepageLimit] = await Promise.all([
        loadCategories(SEED_CATEGORIES),
        loadProducts(SEED_PRODUCTS),
        loadHomepageLimit(),
      ]);
      setAllHomepageCategories(getHomepageCategories(cats));
      setProducts(prods);
      setLimit(homepageLimit);
    })();
  }, []);

  const categories = useMemo(
    () => (limit ? allHomepageCategories.slice(0, limit) : allHomepageCategories),
    [allHomepageCategories, limit]
  );
  const hasMore = allHomepageCategories.length > categories.length;

  const featured = useMemo(() => categories.find((c) => c.featured) || categories[0], [categories]);
  const rest = useMemo(() => categories.filter((c) => c.id !== featured?.id), [categories, featured]);

  if (!categories.length) return null;

  return (
    <section className="pt-14 sm:pt-20 px-4 sm:px-6 bg-ivory" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-5 sm:mb-7 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 text-center sm:text-right">
          <div>
            <h2 id="categories-heading" className="font-display font-bold text-xl sm:text-2xl text-navy">
              تسوق حسب القسم
            </h2>
            <p className="text-navy/55 text-sm mt-1">تصفّح حسب القسم اللي يناسبك</p>
          </div>
          {hasMore && (
            <div className="hidden sm:block">
              <ViewAllButton href="/categories" label="عرض كل الأقسام" />
            </div>
          )}
        </Reveal>

        {/* Mobile: horizontal snap carousel */}
        <Reveal className="sm:hidden -mx-4 px-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {featured && (
            <div className="w-[78%] shrink-0 snap-start">
              <CategoryCard category={featured} featured count={countProductsInCategory(products, featured.name)} />
            </div>
          )}
          {rest.map((c) => (
            <div key={c.id} className="w-[55%] shrink-0 snap-start">
              <CategoryCard category={c} count={countProductsInCategory(products, c.name)} />
            </div>
          ))}
          {hasMore && (
            <div className="w-[55%] shrink-0 snap-start">
              <ViewAllCategoryCard />
            </div>
          )}
        </Reveal>

        {/* Desktop / tablet: bento layout */}
        <Reveal className="hidden sm:grid grid-cols-3 gap-4">
          {featured && (
            <div className="col-span-3 md:col-span-2 md:row-span-2">
              <CategoryCard category={featured} featured count={countProductsInCategory(products, featured.name)} />
            </div>
          )}
          {rest.map((c) => (
            <div key={c.id} className="col-span-3 sm:col-span-1">
              <CategoryCard category={c} count={countProductsInCategory(products, c.name)} />
            </div>
          ))}
        </Reveal>

        {hasMore && (
          <div className="flex sm:hidden justify-center mt-5">
            <ViewAllButton href="/categories" label="عرض كل الأقسام" />
          </div>
        )}
      </div>
    </section>
  );
}

// كارد صغير بديل داخل الـ carousel نفسه على الموبايل لو فيه تصنيفات مخفية أكتر من الحد —
// بيدّي المستخدم مخرج واضح لصفحة كل الأقسام من غير ما يحتاج يلاقي زرار منفصل تحت.
function ViewAllCategoryCard() {
  return (
    <a
      href="/categories"
      className="group flex flex-col items-center justify-center gap-2 h-32 sm:h-40 rounded-2xl border border-dashed border-navy/20 bg-navy/[0.03] hover:bg-navy/[0.06] transition-colors duration-300 text-navy/70"
    >
      <span className="text-sm font-semibold">عرض كل الأقسام</span>
      <span className="text-xs text-navy/40">←</span>
    </a>
  );
}
