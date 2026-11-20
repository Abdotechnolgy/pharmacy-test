"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, ShoppingCart, MessageCircle, Check } from "lucide-react";
import ProductVisual from "./ProductVisual";
import { loadProducts } from "../lib/productsStore";
import { waLink } from "../data/site";
import { useCart } from "../context/CartContext";

export default function ProductDetailClient({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    loadProducts([]).then((all) => {
      setRelated(all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3));
    });
  }, [product.category, product.id]);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 min-h-screen bg-ivory">
      <div className="mx-auto max-w-3xl">
        <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm text-navy/60 hover:text-emerald mb-8">
          <ChevronRight className="w-4 h-4" />
          الرجوع للمنتجات
        </Link>

        <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/70 shadow-[0_15px_40px_rgba(14,42,74,0.08)] overflow-hidden">
          <ProductVisual icon={product.icon} image={product.image} alt={product.name} className="h-56 sm:h-64 w-full rounded-none group" />

          <div className="p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="inline-block text-xs font-bold tracking-wide text-gold bg-gold/10 rounded-full px-3 py-1.5">
                {product.category}
              </span>
              {product.badge && (
                <span className="inline-block text-xs font-bold tracking-wide text-navy bg-gold/20 rounded-full px-3 py-1.5">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-navy mb-3">{product.name}</h1>
            <p className="font-display font-bold text-emerald text-2xl mb-6">{product.price} ج.م</p>

            <p className="text-navy/65 leading-relaxed mb-8">
              {product.description} متوفر الآن في صيدلية الدكتور سالم أحمد فؤاد بمدينة أبو المطامير، محافظة
              البحيرة، مع إمكانية التوصيل السريع أو الطلب المباشر عبر واتساب.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={handleAdd}
                className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold py-3.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald/30 ${
                  added ? "bg-emerald text-ivory" : "bg-navy/5 text-navy hover:bg-emerald hover:text-ivory"
                }`}
              >
                {added ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {added ? "أُضيف للسلة" : "أضف للسلة"}
              </button>
              <a
                href={waLink(`مرحبًا، أرغب في طلب: ${product.name} (${product.price} ج.م)`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-semibold py-3.5 hover:opacity-90 transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
                اطلب عبر واتساب
              </a>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display font-bold text-lg text-navy mb-5">منتجات مشابهة</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="rounded-2xl bg-white/60 border border-white/70 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <ProductVisual icon={p.icon} image={p.image} alt={p.name} className="h-24 w-full rounded-none" />
                  <div className="p-4">
                    <p className="font-display font-semibold text-navy text-sm">{p.name}</p>
                    <p className="font-display font-bold text-emerald text-sm mt-2">{p.price} ج.م</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
