"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Save, X, ImagePlus, Link2, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import ProductVisual from "../../../../components/ProductVisual";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";
import { useToast } from "../../../../components/admin/Toast";
import { PRODUCTS as SEED_PRODUCTS } from "../../../../data/products";
import { SEED_CATEGORIES } from "../../../../data/categories";
import { loadProducts, saveProducts } from "../../../../lib/productsStore";
import {
  loadCategories,
  saveCategories,
  createCategory,
  deleteCategory,
  sortCategories,
  slugify,
  countProductsInCategory,
  renameCategoryInProducts,
  moveProductsToCategory,
  loadHomepageLimit,
  saveHomepageLimit,
} from "../../../../lib/categoriesStore";

const MAX_IMAGE_BYTES = 350 * 1024;
const ICON_OPTIONS = ["Pill", "Leaf", "Sparkles", "Heart", "Droplet", "Sun", "Layers"];

function emptyForm(nextOrder) {
  return {
    id: null,
    name: "",
    slug: "",
    slugTouched: false,
    description: "",
    image: "",
    icon: "Pill",
    isActive: true,
    showOnHomepage: true,
    featured: false,
    sortOrder: nextOrder || 1,
  };
}

export default function AdminCategoriesPage() {
  const { show } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm(1));
  const [editingId, setEditingId] = useState(null);
  const [imageError, setImageError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [reassignTo, setReassignTo] = useState("");
  const [mounted, setMounted] = useState(false);
  const [homepageLimit, setHomepageLimit] = useState(8);

  useEffect(() => {
    (async () => {
      const [prods, cats, limit] = await Promise.all([
        loadProducts(SEED_PRODUCTS),
        loadCategories(SEED_CATEGORIES),
        loadHomepageLimit(),
      ]);
      const sorted = sortCategories(cats);
      setProducts(prods);
      setCategories(sorted);
      setForm(emptyForm(sorted.length + 1));
      setHomepageLimit(limit);
      setMounted(true);
    })();
  }, []);

  const handleLimitChange = async (value) => {
    const n = Math.max(1, Math.min(50, parseInt(value, 10) || 1));
    setHomepageLimit(n);
    try {
      await saveHomepageLimit(n);
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const persistCategories = async (next) => {
    const sorted = sortCategories(next);
    setCategories(sorted);
    try {
      await saveCategories(sorted);
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const persistProducts = async (next) => {
    setProducts(next);
    try {
      await saveProducts(next);
    } catch (err) {
      show(err.message || "حصل خطأ أثناء حفظ المنتجات", "error");
    }
  };

  const countFor = (name) => countProductsInCategory(products, name);

  const resetForm = () => {
    setForm(emptyForm(categories.length + 1));
    setEditingId(null);
    setImageError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      show("لازم اسم للتصنيف", "error");
      return;
    }
    const slug = form.slug.trim() || slugify(name);
    const duplicate = categories.find((c) => c.slug === slug && c.id !== editingId);
    if (duplicate) {
      show("الرابط (slug) ده مستخدم بالفعل في تصنيف تاني", "error");
      return;
    }

    try {
      if (editingId) {
        const original = categories.find((c) => c.id === editingId);
        const payload = { ...original, name, slug, description: form.description, image: form.image, icon: form.icon, isActive: form.isActive, showOnHomepage: form.showOnHomepage, featured: form.featured };
        await persistCategories(categories.map((c) => (c.id === editingId ? payload : c)));
        if (original && original.name !== name) {
          await persistProducts(renameCategoryInProducts(products, original.name, name));
        }
        show("تم حفظ تعديل التصنيف", "success");
      } else {
        const nextOrder = Math.max(0, ...categories.map((c) => c.sortOrder || 0)) + 1;
        const created = await createCategory({
          name,
          slug,
          description: form.description,
          image: form.image,
          icon: form.icon,
          isActive: form.isActive,
          showOnHomepage: form.showOnHomepage,
          featured: form.featured,
          sortOrder: nextOrder,
        });
        setCategories((prev) => sortCategories([...prev, created]));
        show("تم إضافة التصنيف بنجاح", "success");
      }
      resetForm();
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const handleEdit = (c) => {
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      slugTouched: true,
      description: c.description || "",
      image: c.image || "",
      icon: c.icon || "Pill",
      isActive: c.isActive,
      showOnHomepage: c.showOnHomepage,
      featured: Boolean(c.featured),
      sortOrder: c.sortOrder,
    });
    setEditingId(c.id);
    setImageError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requestDelete = (c) => {
    setReassignTo("");
    setConfirmDelete(c);
  };

  const handleDeleteConfirmed = async () => {
    const count = countFor(confirmDelete.name);
    try {
      if (count > 0) {
        if (!reassignTo) {
          show("لازم تختار تصنيف بديل تنقل له المنتجات الأول", "error");
          return;
        }
        const target = categories.find((c) => String(c.id) === String(reassignTo));
        await persistProducts(moveProductsToCategory(products, confirmDelete.name, target.name));
      }
      await deleteCategory(confirmDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      show("تم حذف التصنيف" + (count > 0 ? " ونقل منتجاته" : ""), "success");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحذف", "error");
    }
    setConfirmDelete(null);
  };

  const toggleActive = (c) => {
    persistCategories(categories.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x)));
    show(!c.isActive ? "تم تفعيل التصنيف" : "تم إيقاف التصنيف", "info");
  };

  const toggleHomepage = (c) => {
    persistCategories(categories.map((x) => (x.id === c.id ? { ...x, showOnHomepage: !x.showOnHomepage } : x)));
    show(!c.showOnHomepage ? "هيظهر في الرئيسية" : "اتخفى من الرئيسية", "info");
  };

  const move = (c, direction) => {
    const sorted = sortCategories(categories);
    const idx = sorted.findIndex((x) => x.id === c.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    const nextList = sorted.map((x) => {
      if (x.id === a.id) return { ...x, sortOrder: b.sortOrder };
      if (x.id === b.id) return { ...x, sortOrder: a.sortOrder };
      return x;
    });
    persistCategories(nextList);
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

  const deleteCount = confirmDelete ? countFor(confirmDelete.name) : 0;
  const reassignOptions = confirmDelete ? categories.filter((c) => c.id !== confirmDelete.id) : [];

  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display font-bold text-navy text-xl mb-4">التصنيفات</h1>
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">جارِ التحميل...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-navy text-xl">التصنيفات</h1>
        <p className="text-xs text-navy/50 mt-1">{categories.length} تصنيف — الترتيب هنا هو نفسه اللي هيظهر بيه في الصفحة الرئيسية</p>
      </div>

      <div className="rounded-2xl bg-white border border-navy/10 p-4 sm:p-5 mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div>
          <label htmlFor="homepage-limit" className="block text-sm font-semibold text-navy">
            الحد الأقصى للتصنيفات في الصفحة الرئيسية
          </label>
          <p className="text-xs text-navy/50 mt-0.5">
            لو عدد التصنيفات "يظهر في الرئيسية" أكبر من الرقم ده، هيظهر زرار "عرض كل الأقسام" يودي لصفحة /categories.
          </p>
        </div>
        <input
          id="homepage-limit"
          type="number"
          min={1}
          max={50}
          value={homepageLimit}
          onChange={(e) => handleLimitChange(e.target.value)}
          className="w-20 rounded-lg border border-navy/10 px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald/40"
        />
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-navy/10 p-5 mb-8 grid gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">اسم التصنيف</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value,
                  slug: f.slugTouched ? f.slug : slugify(e.target.value),
                }))
              }
              placeholder="مثال: العناية بالبشرة"
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">الرابط (slug)</label>
            <input
              type="text"
              dir="ltr"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value), slugTouched: true }))}
              placeholder="skin-care"
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">الوصف (يظهر أعلى صفحة التصنيف)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">الأيقونة الافتراضية (تُستخدم لو مفيش صورة)</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((icon) => (
              <button
                type="button"
                key={icon}
                onClick={() => setForm((f) => ({ ...f, icon }))}
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                  form.icon === icon ? "border-emerald bg-emerald/10" : "border-navy/10 hover:border-navy/30"
                }`}
              >
                <ProductVisual icon={icon} className="w-6 h-6 rounded-md" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-[auto_1fr] gap-4 items-start pt-1 border-t border-navy/5">
          <div className="pt-4">
            <ProductVisual icon={form.icon} image={form.image} alt="معاينة التصنيف" className="w-24 h-24 rounded-xl" />
          </div>
          <div className="pt-4 grid gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-navy/60 mb-1.5">
                <Link2 className="w-3.5 h-3.5" />
                رابط صورة التصنيف (اختياري)
              </label>
              <input
                type="url"
                value={form.image?.startsWith("data:") ? "" : form.image}
                onChange={handleImageUrl}
                placeholder="لو فاضي، هتستخدم الأيقونة كخلفية"
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
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-1 border-t border-navy/5">
          <label className="flex items-center gap-2 text-sm text-navy/70 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-emerald" />
            نشط (Active)
          </label>
          <label className="flex items-center gap-2 text-sm text-navy/70 cursor-pointer">
            <input type="checkbox" checked={form.showOnHomepage} onChange={(e) => setForm((f) => ({ ...f, showOnHomepage: e.target.checked }))} className="w-4 h-4 accent-emerald" />
            يظهر في الصفحة الرئيسية
          </label>
          <label className="flex items-center gap-2 text-sm text-navy/70 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-emerald" />
            كارد مميز (Featured) في الواجهة
          </label>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-emerald text-ivory px-5 py-2.5 text-sm font-semibold hover:bg-navy transition-colors">
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? "حفظ التعديل" : "إضافة تصنيف"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 text-navy px-5 py-2.5 text-sm font-semibold">
              <X className="w-4 h-4" />
              إلغاء
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">
          مفيش تصنيفات لسه — أضف أول تصنيف من الفورم فوق.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-navy/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy/5 text-navy/60 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-semibold">التصنيف</th>
                <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">المنتجات</th>
                <th className="text-right px-4 py-3 font-semibold">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">الرئيسية</th>
                <th className="text-right px-4 py-3 font-semibold">الترتيب</th>
                <th className="text-right px-4 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c, idx) => (
                <tr key={c.id} className="border-t border-navy/5">
                  <td className="px-4 py-3 font-medium text-navy flex items-center gap-2">
                    <ProductVisual icon={c.icon} image={c.image} className="w-8 h-8 rounded-lg shrink-0" />
                    <span>{c.name}{c.featured && <span className="mr-1 text-[10px] text-gold font-bold align-top">★</span>}</span>
                  </td>
                  <td className="px-4 py-3 text-navy/60 hidden sm:table-cell">{countFor(c.name)} منتج</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`text-xs font-bold rounded-full px-2.5 py-1 ${c.isActive ? "bg-emerald/10 text-emerald" : "bg-navy/10 text-navy/50"}`}
                    >
                      {c.isActive ? "نشط" : "متوقف"}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <button onClick={() => toggleHomepage(c)} aria-label="إظهار/إخفاء من الرئيسية" className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5">
                      {c.showOnHomepage ? <Eye className="w-4 h-4 text-emerald" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => move(c, "up")} disabled={idx === 0} aria-label="لأعلى" className="p-1 rounded text-navy/50 hover:bg-navy/5 disabled:opacity-25">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => move(c, "down")} disabled={idx === categories.length - 1} aria-label="لأسفل" className="p-1 rounded text-navy/50 hover:bg-navy/5 disabled:opacity-25">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(c)} aria-label="تعديل" className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-emerald">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => requestDelete(c)} aria-label="حذف" className="p-1.5 rounded-lg text-navy/50 hover:bg-red-50 hover:text-red-500">
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
        "الرئيسية" بتتحكم هل التصنيف يظهر في الصفحة الرئيسية ولا لأ — التصنيف يفضل شغال وصفحته موجودة حتى لو مخفي منها.
        "نشط" لو اتوقف، صفحة التصنيف نفسها بتختفي بالكامل.
      </p>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="حذف التصنيف؟"
        confirmLabel="حذف نهائي"
        message={
          deleteCount > 0
            ? `هذا التصنيف يحتوي على ${deleteCount} منتج. اختر تصنيف بديل تُنقل له المنتجات أولاً قبل الحذف.`
            : "هيتم حذف هذا التصنيف نهائيًا."
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      >
        {deleteCount > 0 && (
          <select
            value={reassignTo}
            onChange={(e) => setReassignTo(e.target.value)}
            className="w-full rounded-lg border border-navy/10 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-emerald/40"
          >
            <option value="">اختر تصنيف بديل...</option>
            {reassignOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </ConfirmDialog>
    </div>
  );
}
