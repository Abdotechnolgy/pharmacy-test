"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ShoppingCart, MessageCircle, Check } from "lucide-react";
import ProductVisual from "./ProductVisual";
import { waLink } from "../data/site";
import { useCart } from "../context/CartContext";

// بيتفتح عن طريق React Portal مباشرة جوه <body> — عشان أي كارد بيستدعيه ممكن يكون
// فيه backdrop-blur أو transform (زي الكاردز في الموقع كله)، واللي بيعمل containing
// block جديد لأي عنصر "fixed" جواه فيحبسه داخل حدود الكارد بدل ما يغطي الشاشة كلها.
export default function ProductModal({ product, onClose }) {
  const { addItem } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!product || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`معاينة سريعة: ${product.name}`}
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-ivory rounded-3xl shadow-2xl overflow-hidden animate-[fadeIn_0.25s_ease]">
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-navy hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald/50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="group">
          <ProductVisual icon={product.icon} image={product.image} alt={product.name} className="h-56 w-full rounded-none" />
        </div>

        <div className="p-6 sm:p-8">
          {product.badge && (
            <span className="inline-block text-[11px] font-bold tracking-wide text-navy bg-gold/20 rounded-full px-3 py-1 mb-3">
              {product.badge}
            </span>
          )}
          <span className="block text-xs font-semibold text-gold mb-1">{product.category}</span>
          <h2 className="font-display font-bold text-xl text-navy mb-2">{product.name}</h2>
          <p className="text-sm text-navy/60 leading-relaxed mb-4">{product.description}</p>
          <div className="flex items-center gap-3 mb-6">
            <p className="font-display font-bold text-emerald text-2xl">{product.price} ج.م</p>
            {product.oldPrice && <p className="text-navy/40 line-through text-base">{product.oldPrice} ج.م</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                addItem(product);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-navy/5 text-navy font-semibold py-3 hover:bg-emerald hover:text-ivory transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald/40"
            >
              <ShoppingCart className="w-4 h-4" />
              أضف للسلة
            </button>
            <a
              href={waLink(`مرحبًا، أرغب في طلب: ${product.name} (${product.price} ج.م)`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white font-semibold py-3 hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald/40"
            >
              <MessageCircle className="w-4 h-4" />
              اطلب عبر واتساب
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
