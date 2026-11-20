"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import CategoryCard from "./CategoryCard";
import { SEED_CATEGORIES } from "../data/categories";
import { PRODUCTS as SEED_PRODUCTS } from "../data/products";
import { loadCategories, getActiveCategories, countProductsInCategory } from "../lib/categoriesStore";
import { loadProducts } from "../lib/productsStore";

// صفحة "كل الأقسام" — مسؤوليتها الوحيدة إنها تعرض كل التصنيفات النشطة، من غير أي
// حد أقصى (على عكس الصفحة الرئيسية). Grid مريح من عمودين على الموبايل، وأكتر على
// الشاشات الأكبر. مفيش Search/Filter هنا — البحث والفلترة داخل كل تصنيف لوحده.
export default function AllCategoriesClient() {
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      const [cats, prods] = await Promise.all([loadCategories(SEED_CATEGORIES), loadProducts(SEED_PRODUCTS)]);
      setCategories(getActiveCategories(cats));
      setProducts(prods);
      setMounted(true);
    })();
  }, []);

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
              كل الأقسام
            </li>
          </ol>
        </nav>

        <div className="mb-8 sm:mb-10 text-center sm:text-right">
          <h1 className="font-display font-bold text-navy text-2xl sm:text-3xl">كل الأقسام</h1>
          <p className="text-navy/60 mt-2 max-w-xl mx-auto sm:mx-0">اختر القسم اللي يناسبك وابدأ التسوق.</p>
          {mounted && (
            <p className="text-xs sm:text-sm text-emerald font-semibold mt-2">{categories.length} قسم</p>
          )}
        </div>

        {mounted && categories.length === 0 ? (
          <div className="text-center py-16 text-navy/50 text-sm sm:text-base">
            <LayoutGrid className="w-10 h-10 mx-auto mb-3 text-navy/25" />
            مفيش أقسام متاحة حاليًا.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} count={countProductsInCategory(products, c.name)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
