"use client";

import Link from "next/link";
import { ShoppingCart, Check, Eye, MessageCircle, Tag } from "lucide-react";
import { useState } from "react";
import ProductVisual from "./ProductVisual";
import { waLink } from "../data/site";
import { useCart } from "../context/CartContext";

// كارد منتج موحّد يُستخدم في: preview الصفحة الرئيسية، صفحة التصنيف، ونتائج البحث.
// offer (اختياري): لو فيه عرض حقيقي شغال على المنتج ده، بيوصل هنا مُجهّز مسبقًا
// (مفيش أي حساب خصم وهمي جوه الكارد نفسه).
// ملحوظة مهمة: الـ Quick View بيتفتح من المكوّن الأب (ProductGrid) مش من هنا —
// لأن الكارد ده فيه backdrop-blur (CSS filter)، وأي عنصر "fixed" جواه هيتحبس
// جوه حدود الكارد بدل ما يغطي الشاشة كلها (بيعمل containing block جديد).
export default function ProductCard({ product, offer, onQuickView, compact = false }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const hasOffer = Boolean(offer);
  const displayPrice = hasOffer ? offer.newPrice : product.price;
  const pct = hasOffer && offer.oldPrice ? Math.round((1 - offer.newPrice / offer.oldPrice) * 100) : 0;

  const handleAdd = () => {
    addItem({ ...product, price: displayPrice });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group h-full rounded-2xl bg-white/70 backdrop-blur-md border border-white/70 shadow-[0_10px_30px_rgba(14,42,74,0.06)] hover:shadow-[0_18px_40px_rgba(14,42,74,0.12)] hover:-translate-y-1 transition-all duration-400 overflow-hidden flex flex-col">
      <button
        onClick={() => onQuickView?.(product, offer)}
        className="relative block w-full text-right"
        aria-label={`معاينة سريعة لـ ${product.name}`}
      >
        <ProductVisual
          icon={product.icon}
          image={product.image}
          alt={product.name}
          className={`${compact ? "h-24 sm:h-32" : "h-28 sm:h-36"} w-full rounded-none`}
        />
        {pct > 0 ? (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold tracking-wide text-white bg-emerald rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-sm">
            <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            خصم {pct}%
          </span>
        ) : (
          product.badge && (
            <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] font-bold tracking-wide text-navy bg-gold/90 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 shadow-sm">
              {product.badge}
            </span>
          )
        )}
        <span className="absolute inset-0 hidden sm:flex items-center justify-center bg-navy/0 group-hover:bg-navy/30 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 text-navy text-xs font-semibold px-3.5 py-2 shadow-md">
            <Eye className="w-3.5 h-3.5" />
            معاينة سريعة
          </span>
        </span>
      </button>

      <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/product/${product.id}`}>
            <span className="inline-block text-[10px] sm:text-[11px] font-bold tracking-wide text-gold bg-gold/10 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 mb-2 sm:mb-3">
              {product.category}
            </span>
            <h3 className="font-display font-semibold text-navy text-sm sm:text-base leading-snug hover:text-emerald transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 flex-wrap">
            <p className="font-display font-bold text-emerald text-base sm:text-lg">{displayPrice} ج.م</p>
            {hasOffer && <p className="text-navy/40 line-through text-xs sm:text-sm">{offer.oldPrice} ج.م</p>}
          </div>
        </div>

        <div className="mt-3 sm:mt-5 flex items-center gap-2">
          <button
            onClick={handleAdd}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-full text-xs sm:text-sm font-semibold py-2.5 min-h-[42px] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald/30 ${
              added ? "bg-emerald text-ivory" : "bg-emerald text-ivory hover:bg-navy"
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? "أُضيف" : "أضف للسلة"}
          </button>
          <a
            href={waLink(`مرحبًا، أرغب في طلب: ${product.name} (${displayPrice} ج.م)`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل عبر واتساب لطلب هذا المنتج"
            className="shrink-0 inline-flex items-center justify-center rounded-full bg-navy/5 text-navy w-[42px] h-[42px] hover:bg-[#25D366] hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald/30"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
