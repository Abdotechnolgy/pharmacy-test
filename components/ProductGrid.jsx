"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

// Grid موحّد: عمودين من أول 360px، 3 أعمدة من lg وفوق.
// بيتقبل offersMap اختياري { productId: offer } عشان يبين خصم حقيقي لو موجود.
// الـ Quick View modal بيتفتح من هنا (مش من جوه الكارد نفسه) عشان الكارد فيه
// backdrop-blur (CSS filter) وأي "fixed" جواه هيتحبس جوه حدود الكارد.
export default function ProductGrid({ products, offersMap = {}, emptyMessage }) {
  const [quickView, setQuickView] = useState(null);

  if (!products?.length) {
    return (
      <div className="text-center py-14 sm:py-16 text-navy/50 text-sm sm:text-base">
        {emptyMessage || "لا توجد منتجات لعرضها حاليًا."}
      </div>
    );
  }

  const handleQuickView = (product, offer) => setQuickView({ product, offer });
  const displayPrice = quickView && (quickView.offer ? quickView.offer.newPrice : quickView.product.price);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} offer={offersMap[p.id]} onQuickView={handleQuickView} />
        ))}
      </div>

      {quickView && (
        <ProductModal
          product={{
            ...quickView.product,
            price: displayPrice,
            oldPrice: quickView.offer ? quickView.offer.oldPrice : undefined,
          }}
          onClose={() => setQuickView(null)}
        />
      )}
    </>
  );
}
