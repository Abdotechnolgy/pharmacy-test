"use client";

import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const { items, total, isOpen, close, removeItem, setQty } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 bg-navy/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />
      <aside
        className={`fixed top-0 bottom-0 right-0 w-full sm:w-96 bg-ivory z-[70] shadow-2xl transition-transform duration-400 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-navy/10">
          <h3 className="font-display font-bold text-navy flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald" />
            سلة الطلبات
          </h3>
          <button onClick={close} aria-label="إغلاق" className="p-1.5 rounded-full hover:bg-navy/5">
            <X className="w-5 h-5 text-navy" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="text-center text-navy/50 mt-16">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
              السلة فاضية دلوقتي
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b border-navy/5 pb-4">
                  <div className="flex-1">
                    <p className="font-display font-semibold text-sm text-navy">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-emerald font-semibold">{item.price} ج.م</p>
                      {item.oldPrice && <p className="text-xs text-navy/35 line-through">{item.oldPrice} ج.م</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => setQty(item.id, item.qty - 1)}
                        className="w-6 h-6 rounded-full bg-navy/5 flex items-center justify-center hover:bg-navy/10"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        className="w-6 h-6 rounded-full bg-navy/5 flex items-center justify-center hover:bg-navy/10"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} aria-label="حذف" className="p-2 text-navy/30 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-navy/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-navy/60">الإجمالي</span>
              <span className="font-display font-bold text-lg text-emerald">{total} ج.م</span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="block text-center rounded-full bg-emerald text-ivory py-3 font-semibold hover:bg-navy transition-colors duration-300"
            >
              إتمام الطلب
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
