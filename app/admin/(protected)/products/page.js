"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, RotateCcw, Save, X, ImagePlus, Link2 } from "lucide-react";
import ProductVisual from "../../../../components/ProductVisual";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";
import { useToast } from "../../../../components/admin/Toast";
import { PRODUCTS as SEED_PRODUCTS } from "../../../../data/products";
import { SEED_CATEGORIES } from "../../../../data/categories";
import { loadProducts, saveProducts, createProduct, deleteProduct, resetProducts } from "../../../../lib/productsStore";
import { loadCategories, sortCategories } from "../../../../lib/categoriesStore";

const MAX_IMAGE_BYTES = 350 * 1024;

function emptyForm(defaultCategoryId) {
  return { id: null, name: "", categoryId: defaultCategoryId || null, price: "", image: "" };
}

export default function AdminProductsPage() {
  const { show } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [imageError, setImageError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    (async () => {
      const [prods, cats] = await Promise.all([loadProducts(SEED_PRODUCTS), loadCategories(SEED_CATEGORIES)]);
      const activeCats = sortCategories(cats).filter((c) => c.isActive);
      setProducts(prods);
      setCategories(activeCats);
      setForm(emptyForm(activeCats[0]?.id));
    })();
  }, []);

  const persist = async (next) => {
    setProducts(next);
    try {
      await saveProducts(next);
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;

    try {
      if (editingId) {
        await persist(products.map((p) => (p.id === editingId ? { ...p, ...form, price: Number(form.price) } : p)));
        show("تم حفظ تعديل المنتج", "success");
      } else {
        const { id, ...withoutId } = form;
        const created = await createProduct({ ...withoutId, price: Number(form.price) });
        setProducts((prev) => [...prev, created]);
        show("تم إضافة المنتج بنجاح", "success");
      }
      setForm(emptyForm(categories[0]?.id));
      setEditingId(null);
      setImageError("");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const handleEdit = (p) => {
    setForm({ id: p.id, name: p.name, categoryId: p.categoryId, price: String(p.price), image: p.image || "" });
    setEditingId(p.id);
    setImageError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteProduct(confirmDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      if (editingId === confirmDelete.id) {
        setForm(emptyForm());
        setEditingId(null);
      }
      show(`تم حذف "${confirmDelete.name}"`, "success");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحذف", "error");
    }
    setConfirmDelete(null);
  };

  const handleResetConfirmed = async () => {
    try {
      const reset = await resetProducts(SEED_PRODUCTS);
      setProducts(reset);
      show("تم إرجاع قائمة المنتجات الافتراضية", "info");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الاسترجاع", "error");
    }
    setConfirmReset(false);
  };

  const handleImageUrl = (e) => {
    setImageError("");
    setForm((f) => ({ ...f, image: e.target.value }));
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");

    if (!file.type.startsWith("image/")) {
      setImageError("الملف المختار مش صورة");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("الصورة كبيرة أوي — استخدم صورة أصغر من 350 كيلوبايت تقريبًا");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.onerror = () => setImageError("حصل خطأ أثناء قراءة الصورة");
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-navy text-xl">المنتجات</h1>
          <p className="text-xs text-navy/50 mt-1">{products.length} منتج</p>
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/60 hover:text-navy bg-white rounded-full px-3 py-2 border border-navy/10"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          استرجاع الافتراضي
        </button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-navy/10 p-5 mb-8 grid gap-4">
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">اسم المنتج</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
              placeholder="مثال: فيتامين سي"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">القسم</label>
            <select
              value={form.categoryId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">السعر (ج.م)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-[auto_1fr] gap-4 items-start pt-1 border-t border-navy/5">
          <div className="pt-4">
            <ProductVisual image={form.image} alt={form.name || "معاينة المنتج"} className="w-24 h-24 rounded-xl" />
          </div>

          <div className="pt-4 grid gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-navy/60 mb-1.5">
                <Link2 className="w-3.5 h-3.5" />
                رابط صورة المنتج (اختياري)
              </label>
              <input
                type="url"
                value={form.image?.startsWith("data:") ? "" : form.image}
                onChange={handleImageUrl}
                placeholder="https://example.com/product.jpg"
                dir="ltr"
                className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-navy/60 mb-1.5">
                <ImagePlus className="w-3.5 h-3.5" />
                أو ارفع صورة من جهازك
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="w-full text-xs text-navy/60 file:ml-3 file:rounded-full file:border-0 file:bg-emerald/10 file:text-emerald file:px-3 file:py-1.5 file:text-xs file:font-semibold"
              />
            </div>

            {imageError && (
              <p role="alert" className="text-xs text-red-500">
                {imageError}
              </p>
            )}
            {form.image && (
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, image: "" }))}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/50 hover:text-red-500 w-fit"
              >
                <X className="w-3.5 h-3.5" />
                إزالة الصورة (رجوع لأيقونة القسم)
              </button>
            )}
            <p className="text-[11px] text-navy/40 leading-relaxed">
              الصور المرفوعة من الجهاز بتتحفظ محليًا في متصفحك فقط — للاستخدام الدائم لكل الزوار، الأفضل تحط
              رابط صورة مستضافة (زي Cloudinary)، أو صورة من مجلد
              <code className="mx-1 bg-navy/5 rounded px-1">public/products</code> بعد رفع المشروع.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-emerald text-ivory px-5 py-2.5 text-sm font-semibold hover:bg-navy transition-colors">
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? "حفظ التعديل" : "إضافة منتج"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm());
                setEditingId(null);
                setImageError("");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 text-navy px-5 py-2.5 text-sm font-semibold"
            >
              <X className="w-4 h-4" />
              إلغاء
            </button>
          )}
        </div>
      </form>

      {products.length === 0 ? (
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">
          مفيش منتجات لسه — أضف أول منتج من الفورم فوق.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-navy/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy/5 text-navy/60 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-semibold w-16">صورة</th>
                <th className="text-right px-4 py-3 font-semibold">المنتج</th>
                <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">القسم</th>
                <th className="text-right px-4 py-3 font-semibold">السعر</th>
                <th className="text-right px-4 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-navy/5">
                  <td className="px-4 py-3">
                    <ProductVisual icon={p.icon} image={p.image} alt={p.name} className="w-10 h-10 rounded-lg" />
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">{p.name}</td>
                  <td className="px-4 py-3 text-navy/60 hidden sm:table-cell">{p.category}</td>
                  <td className="px-4 py-3 text-emerald font-semibold">{p.price} ج.م</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(p)} aria-label="تعديل" className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-emerald">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(p)} aria-label="حذف" className="p-1.5 rounded-lg text-navy/50 hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-navy/40 mt-4 leading-relaxed">
        ملاحظة: الصور المرفوعة كملف من جهازك بتتحفظ كـ base64 في قاعدة البيانات نفسها — مناسب لصور صغيرة، لكن
        للاستخدام الأمثل حط رابط صورة مستضافة (زي Cloudinary) بدل رفع ملف مباشر.
      </p>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="حذف المنتج؟"
        message={confirmDelete ? `هيتم حذف "${confirmDelete.name}" نهائيًا من الكتالوج.` : ""}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmReset}
        title="استرجاع القائمة الافتراضية؟"
        message="هيتم فقد أي تعديلات محلية عملتها وترجع المنتجات لحالتها الأصلية."
        confirmLabel="استرجاع"
        danger={false}
        onConfirm={handleResetConfirmed}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
