"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tag, ArrowRight } from "lucide-react";
import Seal from "./Seal";
import OfferCard from "./OfferCard";
import { PRODUCTS } from "../data/products";
import { OFFERS as SEED_OFFERS } from "../data/offers";
import { loadOffers, enrichOffer, isOfferLive } from "../lib/offersStore";
import { loadProducts } from "../lib/productsStore";

export default function OffersPageClient() {
  const [liveOffers, setLiveOffers] = useState(null); // null = still loading

  useEffect(() => {
    (async () => {
      const [offers, products] = await Promise.all([loadOffers(SEED_OFFERS), loadProducts(PRODUCTS)]);
      const enriched = offers
        .filter(isOfferLive)
        .map((o) => enrichOffer(o, products))
        .filter(Boolean);
      setLiveOffers(enriched);
    })();
  }, []);

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 min-h-screen bg-ivory">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center mb-14">
          <Seal className="w-12 h-12 mb-4" />
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy">العروض والخصومات</h1>
          <p className="text-navy/60 mt-3 max-w-lg">أحدث العروض النشطة من صيدلية الدكتور سالم أحمد فؤاد، لفترة محدودة.</p>
        </div>

        {liveOffers === null ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-white/50 animate-pulse" />
            ))}
          </div>
        ) : liveOffers.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-5">
              <Tag className="w-7 h-7 text-gold" />
            </div>
            <h2 className="font-display font-semibold text-navy text-lg mb-2">مفيش عروض نشطة دلوقتي</h2>
            <p className="text-navy/55 text-sm max-w-sm mb-7">
              تابعنا أول بأول — أي عرض جديد هيظهر هنا فورًا. تقدر كمان تتصفح كل منتجاتنا بالأسعار العادية.
            </p>
            <Link href="/categories" className="inline-flex items-center gap-2 rounded-full bg-emerald text-ivory px-6 py-3 text-sm font-semibold hover:bg-navy transition-colors">
              <ArrowRight className="w-4 h-4" />
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
