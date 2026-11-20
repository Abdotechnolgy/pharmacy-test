"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, Sparkles, ListOrdered } from "lucide-react";
import ProductVisual from "../../../../components/ProductVisual";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";
import { useToast } from "../../../../components/admin/Toast";
import { PRODUCTS as SEED_PRODUCTS } from "../../../../data/products";
import { loadProducts } from "../../../../lib/productsStore";
import {
  loadLatestProductsConfig,
  saveLatestProductsConfig,
  resetLatestProductsConfig,
  resolveLatestProducts,
} from "../../../../lib/latestProductsStore";

const LIMIT = 6;

export default function AdminLatestProductsPage() {
  const { show } = useToast();
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState({ mode: "auto", entries: [] });
  const [addValue, setAddValue] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    (async () => {
      const [prods, cfg] = await Promise.all([loadProducts(SEED_PRODUCTS), loadLatestProductsConfig()]);
      setProducts(prods);
      setConfig(cfg);
      setMounted(true);
    })();
  }, []);

  const persist = async (next) => {
    setConfig(next);
    try {
      await saveLatestProductsConfig(next);
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const selectedIds = new Set(config.entries.map((e) => e.productId));
  const availableToAdd = products.filter((p) => !selectedIds.has(p.id));

  const enabledCount = config.entries.filter((e) => e.enabled).length;
  const previewProducts = mounted ? resolveLatestProducts(config, products, LIMIT) : [];

  const setMode = (mode) => persist({ ...config, mode });

  const handleAdd = () => {
    const id = Number(addValue);
    if (!id || selectedIds.has(id)) return;
    persist({ ...config, entries: [...config.entries, { productId: id, enabled: true }] });
    setAddValue("");
  };

  const handleRemove = (productId) => {
    persist({ ...config, entries: config.entries.filter((e) => e.productId !== productId) });
  };

  const toggleEnabled = (productId) => {
    persist({
      ...config,
      entries: config.entries.map((e) => (e.productId === productId ? { ...e, enabled: !e.enabled } : e)),
    });
  };

  const move = (index, direction) => {
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= config.entries.length) return;
    const next = [...config.entries];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    persist({ ...config, entries: next });
  };

  const handleResetConfirmed = async () => {
    try {
      const reset = await resetLatestProductsConfig();
      setConfig(reset);
      show("تم الرجوع للوضع التلقائي", "info");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الاسترجاع", "error");
    }
    setConfirmReset(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-navy text-xl">أحدث المنتجات</h1>
        <p className="text-xs text-navy/50 mt-1">تحكم فيما يظهر في قسم "أحدث المنتجات" بالصفحة الرئيسية (أول {LIMIT} فقط بيظهروا)</p>
      </div>

      {/* Mode toggle */}
      <div className="rounded-2xl bg-white border border-navy/10 p-5 mb-6">
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => setMode("auto")}
            className={`text-right rounded-xl border p-4 transition-colors ${
              config.mode === "auto" ? "border-emerald bg-emerald/5" : "border-navy/10 hover:border-navy/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald" />
              <span className="font-semibold text-navy text-sm">تلقائي</span>
            </div>
            <p className="text-xs text-navy/50">أحدث المنتجات حسب وقت الإضافة — بيتحدث لوحده مع أي منتج جديد.</p>
          </button>
          <button
            onClick={() => setMode("manual")}
            className={`text-right rounded-xl border p-4 transition-colors ${
              config.mode === "manual" ? "border-emerald bg-emerald/5" : "border-navy/10 hover:border-navy/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <ListOrdered className="w-4 h-4 text-emerald" />
              <span className="font-semibold text-navy text-sm">تحديد يدوي</span>
            </div>
            <p className="text-xs text-navy/50">اختار المنتجات وترتيبها بنفسك من القائمة تحت.</p>
          </button>
        </div>

        {config.mode === "manual" && enabledCount === 0 && (
          <p className="text-xs text-navy bg-gold/10 rounded-lg px-3 py-2 mt-4">
            لسه مفيش منتجات مفعّلة في القائمة اليدوية — الموقع هيعرض الوضع التلقائي مؤقتًا لحد ما تضيف منتج واحد على الأقل.
          </p>
        )}
      </div>

      {/* Manual selection */}
      {config.mode === "manual" && (
        <div className="rounded-2xl bg-white border border-navy/10 p-5 mb-6">
          <label className="block text-xs font-semibold text-navy/60 mb-2">إضافة منتج للقائمة</label>
          <div className="flex gap-2">
            <select
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              className="flex-1 rounded-lg border border-navy/10 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald/40"
            >
              <option value="">اختر منتج...</option>
              {availableToAdd.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.category}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={!addValue}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald text-ivory px-4 py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-navy transition-colors"
            >
              <Plus className="w-4 h-4" />
              إضافة
            </button>
          </div>

          {config.entries.length === 0 ? (
            <p className="text-center text-navy/40 text-sm py-8">مفيش منتجات مضافة للقائمة اليدوية لسه.</p>
          ) : (
            <ul className="mt-5 grid gap-2">
              {config.entries.map((entry, i) => {
                const product = productById.get(entry.productId);
                return (
                  <li
                    key={entry.productId}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                      entry.enabled ? "border-navy/10 bg-white" : "border-navy/5 bg-navy/[0.02] opacity-60"
                    }`}
                  >
                    <ProductVisual
                      icon={product?.icon}
                      image={product?.image}
                      alt={product?.name || ""}
                      className="w-11 h-11 rounded-lg shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-navy truncate">{product ? product.name : "منتج محذوف"}</p>
                      {product && <p className="text-xs text-navy/45">{product.category} — {product.price} ج.م</p>}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => move(i, "up")} disabled={i === 0} aria-label="لأعلى" className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 disabled:opacity-20 disabled:pointer-events-none">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => move(i, "down")} disabled={i === config.entries.length - 1} aria-label="لأسفل" className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 disabled:opacity-20 disabled:pointer-events-none">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleEnabled(entry.productId)}
                        aria-label={entry.enabled ? "إخفاء من القسم" : "إظهار في القسم"}
                        className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5"
                      >
                        {entry.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleRemove(entry.productId)} aria-label="إزالة" className="p-1.5 rounded-lg text-navy/50 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Live preview */}
      <div className="rounded-2xl bg-white border border-navy/10 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-navy text-sm">معاينة — اللي هيظهر فعليًا في الصفحة الرئيسية دلوقتي</h2>
          <button onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/60 hover:text-navy">
            <RotateCcw className="w-3.5 h-3.5" />
            رجوع للتلقائي
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {previewProducts.map((p) => (
            <div key={p.id} className="text-center">
              <ProductVisual icon={p.icon} image={p.image} alt={p.name} className="w-full aspect-square rounded-lg mb-1" />
              <p className="text-[11px] text-navy/60 truncate">{p.name}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-navy/40 leading-relaxed">
        ملاحظة: لو منتج اتحذف من صفحة المنتجات وهو موجود في القائمة اليدوية، هيتجاهل تلقائيًا من غير ما يكسر القسم.
      </p>

      <ConfirmDialog
        open={confirmReset}
        title="الرجوع للوضع التلقائي؟"
        message="هيتم تجاهل القائمة اليدوية والرجوع لعرض أحدث المنتجات تلقائيًا حسب وقت الإضافة."
        confirmLabel="رجوع للتلقائي"
        danger={false}
        onConfirm={handleResetConfirmed}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
