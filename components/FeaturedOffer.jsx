"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Check, Tag, ArrowLeft } from "lucide-react";
import ProductVisual from "./ProductVisual";
import OfferCountdown from "./OfferCountdown";
import { discountPercent } from "../lib/offersStore";
import { useCart } from "../context/CartContext";

// بانر العرض الرئيسي (Hero Offer) — أول حاجة تلفت النظر في قسم العروض.
// بيستخدم نفس الـ design tokens بتاعة باقي المشروع (emerald/navy/gold/ivory)
// عشان يبان جزء أصيل من الهوية مش عنصر مُقحم على التصميم.
export default function FeaturedOffer({ offer }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const pct = discountPercent(offer);

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
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-navy via-navy to-emerald-dark shadow-[0_25px_60px_rgba(14,42,74,0.25)]">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: "radial-gradient(circle, #C9A24B 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />
      <div
        className="absolute -top-20 -left-16 w-64 h-64 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, #C9A24B, transparent 70%)" }}
      />

      <div className="relative grid md:grid-cols-2 items-center gap-6 sm:gap-8 p-5 sm:p-8 md:p-10">
        {/* Text side */}
        <div className="order-2 md:order-1 text-center md:text-right">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 text-gold-light text-[11px] sm:text-xs font-bold tracking-wide px-3 py-1.5">
            <Tag className="w-3.5 h-3.5" />
            عرض الأسبوع
          </span>

          <h3 className="font-display font-extrabold text-ivory text-xl sm:text-2xl md:text-3xl mt-4 leading-snug">
            {offer.name}
          </h3>

          {offer.description && (
            <p className="text-ivory/60 text-sm mt-2.5 leading-relaxed max-w-md mx-auto md:mx-0">{offer.description}</p>
          )}

          <div className="flex items-center gap-3 justify-center md:justify-start mt-5">
            <span className="font-display font-extrabold text-gold-light text-3xl sm:text-4xl">
              {offer.newPrice} <span className="text-lg sm:text-xl">ج.م</span>
            </span>
            <span className="text-ivory/40 line-through text-base sm:text-lg">{offer.oldPrice} ج.م</span>
            {pct > 0 && (
              <span className="inline-flex items-center rounded-full bg-gold text-navy text-xs sm:text-sm font-bold px-2.5 py-1">
                خصم {pct}%
              </span>
            )}
          </div>

          <div className="mt-5 flex justify-center md:justify-start">
            <OfferCountdown offer={offer} tone="dark" />
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <button
              onClick={handleAdd}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/40 ${
                added ? "bg-gold text-navy" : "bg-ivory text-navy hover:bg-gold hover:text-navy"
              }`}
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              {added ? "أُضيف للسلة" : "اطلب الآن"}
            </button>
            <Link
              href="/offers"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ivory/25 text-ivory px-6 py-3.5 text-sm font-semibold hover:bg-ivory/10 transition-all duration-300"
            >
              كل العروض
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Visual side */}
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64">
            <ProductVisual
              icon={offer.icon}
              image={offer.image}
              alt={offer.name}
              className="w-full h-full rounded-3xl ring-4 ring-ivory/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
