"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Seal from "./Seal";
import Reveal from "./Reveal";
import FeaturedOffer from "./FeaturedOffer";
import OffersCarousel from "./OffersCarousel";
import { PRODUCTS } from "../data/products";
import { OFFERS as SEED_OFFERS } from "../data/offers";
import { loadOffers, enrichOffer, isOfferLive, discountPercent } from "../lib/offersStore";
import { loadProducts } from "../lib/productsStore";

export default function OffersSection() {
  const [liveOffers, setLiveOffers] = useState([]);

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

  // العرض المميز هو صاحب أعلى نسبة خصم — بيبان في بانر كبير أعلى القسم.
  const { featured, rest } = useMemo(() => {
    if (liveOffers.length === 0) return { featured: null, rest: [] };
    const sorted = [...liveOffers].sort((a, b) => discountPercent(b) - discountPercent(a));
    return { featured: sorted[0], rest: sorted.slice(1) };
  }, [liveOffers]);

  if (liveOffers.length === 0) return null;

  return (
    <section id="offers" className="py-16 sm:py-24 px-4 sm:px-6 bg-mist">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <Seal className="w-12 h-12 mb-4" />
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy">عروض مميزة</h2>
          <p className="text-navy/60 mt-3 max-w-lg">أفضل عروضنا الحالية — لفترة محدودة، اطلبها قبل ما تخلص.</p>
        </Reveal>

        {featured && (
          <Reveal className="mb-8 sm:mb-10">
            <FeaturedOffer offer={featured} />
          </Reveal>
        )}

        {rest.length > 0 && (
          <Reveal>
            <OffersCarousel offers={rest.slice(0, 8)} />
          </Reveal>
        )}

        {(rest.length > 8 || liveOffers.length > 6) && (
          <div className="flex justify-center mt-8 sm:mt-10">
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 rounded-full bg-emerald text-ivory px-6 py-3 text-sm font-semibold hover:bg-navy transition-colors min-h-[44px]"
            >
              شاهد كل العروض
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
