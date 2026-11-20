"use client";

import Link from "next/link";
import { ShoppingCart, Check, Tag, Eye } from "lucide-react";
import { useState } from "react";
import ProductVisual from "./ProductVisual";
import ProductModal from "./ProductModal";
import { discountPercent, getOfferCountdown } from "../lib/offersStore";
import { useCart } from "../context/CartContext";

// compact=true بيُستخدم جوه الـ OffersCarousel على الموبايل (card أصغر وأخف).
export default function OfferCard({ offer, compact = false }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [quickView, setQuickView] = useState(false);
  const pct = discountPercent(offer);
  const countdown = getOfferCountdown(offer);
  const endingSoon = countdown && countdown.days === 0;

  const handleAdd = () => {
    addItem({
      id: `offer-${offer.id}`,
      name: offer.name,
      price: offer.newPrice,
      oldPrice: offer.oldPrice,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group h-full rounded-2xl bg-white/70 backdrop-blur-md border border-white/70 shadow-[0_10px_30px_rgba(14,42,74,0.06)] hover:shadow-[0_18px_40px_rgba(14,42,74,0.12)] hover:-translate-y-1 transition-all duration-400 overflow-hidden flex flex-col">
      <div className="relative">
        <ProductVisual
          icon={offer.icon}
          image={offer.image}
          alt={offer.name}
          className={`${compact ? "h-32" : "h-36"} w-full rounded-none`}
        />
        {pct > 0 && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] font-bold tracking-wide text-white bg-emerald rounded-full px-2.5 py-1 shadow-sm">
            <Tag className="w-3 h-3" />
            خصم {pct}%
          </span>
        )}
        {endingSoon && (
          <span className="absolute top-3 left-3 inline-flex items-center text-[10px] font-bold tracking-wide text-navy bg-gold rounded-full px-2.5 py-1 shadow-sm">
            ينتهي قريبًا
          </span>
        )}
        <button
          onClick={() => setQuickView(true)}
          className="absolute inset-0 hidden sm:flex items-center justify-center bg-navy/0 group-hover:bg-navy/30 opacity-0 group-hover:opacity-100 transition-all duration-300"
          aria-label={`معاينة سريعة لـ ${offer.name}`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 text-navy text-xs font-semibold px-3.5 py-2 shadow-md">
            <Eye className="w-3.5 h-3.5" />
            معاينة سريعة
          </span>
        </button>
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/product/${offer.productId}`}>
            <span className="inline-block text-[11px] font-bold tracking-wide text-gold bg-gold/10 rounded-full px-3 py-1 mb-3">
              {offer.category}
            </span>
            <h3 className="font-display font-semibold text-navy text-base leading-snug hover:text-emerald transition-colors line-clamp-2">
              {offer.name}
            </h3>
          </Link>
          {!compact && offer.description && (
            <p className="text-xs text-navy/55 mt-2 leading-relaxed line-clamp-2">{offer.description}</p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <span className="font-display font-bold text-emerald text-lg">{offer.newPrice} ج.م</span>
            <span className="text-sm text-navy/40 line-through">{offer.oldPrice} ج.م</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={handleAdd}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-semibold py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald/30 ${
              added ? "bg-emerald text-ivory" : "bg-navy/5 text-navy hover:bg-emerald hover:text-ivory"
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? "أُضيف" : "أضف للسلة"}
          </button>
          <Link
            href={`/product/${offer.productId}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy/5 text-navy text-sm font-semibold py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 hover:bg-navy hover:text-ivory transition-all duration-300"
          >
            عرض التفاصيل
          </Link>
        </div>
      </div>

      {quickView && (
        <ProductModal
          product={{
            id: offer.productId,
            name: offer.name,
            category: offer.category,
            icon: offer.icon,
            image: offer.image,
            description: offer.description,
            price: offer.newPrice,
            oldPrice: offer.oldPrice,
            badge: pct > 0 ? `خصم ${pct}%` : undefined,
          }}
          onClose={() => setQuickView(false)}
        />
      )}
    </div>
  );
}
