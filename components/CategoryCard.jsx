"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductVisual from "./ProductVisual";

// كارد تصنيف — الاسم في منطقة سفلية منفصلة (خلفية صلدة)، مش نص فوق صورة.
// ده بيضمن وضوح الاسم دايمًا (سواء فيه صورة حقيقية أو أيقونة fallback)، بدل ما
// يعتمد على gradient overlay ممكن يضعف الـ contrast حسب الصورة.
// featured=true بيدي منطقة صورة أكبر وخط أوضح (يُستخدم لأول تصنيف بس).
export default function CategoryCard({ category, featured = false, count }) {
  return (
    <Link
      href={`/products/${category.slug}`}
      className="group flex flex-col h-full overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_8px_24px_rgba(14,42,74,0.06)] hover:shadow-[0_16px_36px_rgba(14,42,74,0.12)] active:scale-[0.98] transition-all duration-300"
    >
      <div className={`relative shrink-0 ${featured ? "h-28 sm:h-36" : "h-20 sm:h-24"}`}>
        <ProductVisual icon={category.icon} image={category.image} alt={category.name} className="absolute inset-0 h-full w-full rounded-none" />
      </div>

      <div className={`flex items-center justify-between gap-2 ${featured ? "px-4 py-3.5 sm:px-5 sm:py-4" : "px-3 py-2.5 sm:px-4 sm:py-3"}`}>
        <div className="min-w-0">
          <h3 className={`font-display font-bold text-navy truncate ${featured ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}>
            {category.name}
          </h3>
          {featured && category.description && (
            <p className="text-navy/55 text-xs mt-0.5 line-clamp-1">{category.description}</p>
          )}
          {typeof count === "number" && (
            <p className={`text-emerald font-semibold ${featured ? "text-xs mt-1" : "text-[11px] mt-0.5"}`}>{count} منتج</p>
          )}
        </div>
        <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-navy/5 flex items-center justify-center text-navy/60 group-hover:bg-emerald group-hover:text-ivory transition-colors duration-300">
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </span>
      </div>
    </Link>
  );
}
