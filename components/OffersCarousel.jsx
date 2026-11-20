"use client";

import OfferCard from "./OfferCard";

// على الموبايل: Horizontal snap-scroll carousel — كل card بتاخد جزء من العرض
// وبيظهر جزء بسيط من الـ card التالية عشان المستخدم يحس إن فيه المزيد.
// من md وفوق: بيتحول تلقائيًا لـ grid عادي (مفيش أي منطق JS إضافي، Tailwind بس).
export default function OffersCarousel({ offers }) {
  if (!offers?.length) return null;

  return (
    <div
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="list"
      aria-label="عروض إضافية"
    >
      {offers.map((offer) => (
        <div
          key={offer.id}
          role="listitem"
          className="snap-start shrink-0 w-[78%] sm:w-[46%] md:w-auto"
        >
          <OfferCard offer={offer} compact />
        </div>
      ))}
    </div>
  );
}
