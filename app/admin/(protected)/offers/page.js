"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Pencil, Save, X, ImagePlus, Link2, Tag } from "lucide-react";
import ProductVisual from "../../../../components/ProductVisual";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";
import { useToast } from "../../../../components/admin/Toast";
import { PRODUCTS as SEED_PRODUCTS } from "../../../../data/products";
import { OFFERS as SEED_OFFERS } from "../../../../data/offers";
import { loadProducts } from "../../../../lib/productsStore";
import { loadOffers, saveOffers, createOffer, deleteOffer, computeOfferState, discountPercent } from "../../../../lib/offersStore";

const MAX_IMAGE_BYTES = 350 * 1024;

const STATUS_STYLES = {
  active: "bg-emerald/10 text-emerald",
  inactive: "bg-navy/10 text-navy/50",
  expired: "bg-red-50 text-red-500",
  upcoming: "bg-gold/10 text-gold",
};
const STATUS_LABELS = { active: "نشط", inactive: "غير نشط", expired: "منتهي", upcoming: "لسه ما بدأش" };

function emptyForm(defaultProductId) {
  return {
    id: null,
    productId: defaultProductId || "",
    oldPrice: "",
    newPrice: "",
    description: "",
    image: "",
    status: "active",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
  };
}

export default function AdminOffersPage() {
  const { show } = useToast();
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [imageError, setImageError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    (async () => {
      const [p, o] = await Promise.all([loadProducts(SEED_PRODUCTS), loadOffers(SEED_OFFERS)]);
      setProducts(p);
      setOffers(o);
      setForm(emptyForm(p[0]?.id));
    })();
  }, []);

  const persist = async (next) => {
    setOffers(next);
    try {
      await saveOffers(next);
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const productById = (id) => products.find((p) => p.id === Number(id));

  const pct = useMemo(() => discountPercent({ oldPrice: Number(form.oldPrice), newPrice: Number(form.newPrice) }), [form.oldPrice, form.newPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.oldPrice || !form.newPrice) return;
    if (Number(form.newPrice) >= Number(form.oldPrice)) {
      show("السعر الجديد لازم يكون أقل من السعر القديم", "error");
      return;
    }

    const payload = {
      ...form,
      productId: Number(form.productId),
      oldPrice: Number(form.oldPrice),
      newPrice: Number(form.newPrice),
    };

    try {
      if (editingId) {
        await persist(offers.map((o) => (o.id === editingId ? { ...o, ...payload } : o)));
        show("تم حفظ تعديل العرض", "success");
      } else {
        const { id, ...withoutId } = payload;
        const created = await createOffer(withoutId);
        setOffers((prev) => [...prev, created]);
        show("تم إضافة العرض بنجاح", "success");
      }
      setForm(emptyForm(products[0]?.id));
      setEditingId(null);
      setImageError("");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const handleEdit = (o) => {
    setForm({
      id: o.id,
      productId: String(o.productId),
      oldPrice: String(o.oldPrice),
      newPrice: String(o.newPrice),
      description: o.description || "",
      image: o.image || "",
      status: o.status,
      startDate: o.startDate || "",
      endDate: o.endDate || "",
    });
    setEditingId(o.id);
    setImageError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteOffer(confirmDelete.id);
      setOffers((prev) => prev.filter((o) => o.id !== confirmDelete.id));
      show("تم حذف العرض", "success");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحذف", "error");
    }
    setConfirmDelete(null);
  };

  const toggleStatus = (o) => {
    const nextStatus = o.status === "active" ? "inactive" : "active";
    persist(offers.map((x) => (x.id === o.id ? { ...x, status: nextStatus } : x)));
    show(nextStatus === "active" ? "تم تفعيل العرض" : "تم إيقاف العرض", "info");
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

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display font-bold text-navy text-xl mb-4">العروض</h1>
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">جارِ التحميل...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-navy text-xl">العروض</h1>
        <p className="text-xs text-navy/50 mt-1">{offers.length} عرض</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-navy/10 p-5 mb-8 grid gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">المنتج المرتبط بالعرض</label>
            <select
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.price} ج.م
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">حالة العرض</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
            >
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">السعر القديم (ج.م)</label>
            <input
              type="number"
              value={form.oldPrice}
              onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
              placeholder="150"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">سعر العرض (ج.م)</label>
            <input
              type="number"
              value={form.newPrice}
              onChange={(e) => setForm((f) => ({ ...f, newPrice: e.target.value }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
              placeholder="120"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-emerald/5 px-3 py-2.5 h-[42px]">
            <Tag className="w-4 h-4 text-emerald" />
            <span className="text-sm font-bold text-emerald">{pct > 0 ? `خصم ${pct}%` : "—"}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">تاريخ بداية العرض</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">تاريخ انتهاء العرض</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">وصف مختصر للعرض (اختياري)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            placeholder="لو فاضي، هيستخدم وصف المنتج نفسه"
            className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-[auto_1fr] gap-4 items-start pt-1 border-t border-navy/5">
          <div className="pt-4">
            <ProductVisual
              icon={productById(form.productId)?.icon}
              image={form.image || productById(form.productId)?.image}
              alt="معاينة العرض"
              className="w-24 h-24 rounded-xl"
            />
          </div>
          <div className="pt-4 grid gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-navy/60 mb-1.5">
                <Link2 className="w-3.5 h-3.5" />
                رابط صورة مخصصة للعرض (اختياري)
              </label>
              <input
                type="url"
                value={form.image?.startsWith("data:") ? "" : form.image}
                onChange={handleImageUrl}
                placeholder="لو فاضي، هيستخدم صورة المنتج نفسه"
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

        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-emerald text-ivory px-5 py-2.5 text-sm font-semibold hover:bg-navy transition-colors">
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? "حفظ التعديل" : "إضافة عرض"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm(products[0]?.id));
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

      {offers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">
          مفيش عروض لسه — أضف أول عرض من الفورم فوق، وهيظهر تلقائيًا في الموقع لو كان نشط.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-navy/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy/5 text-navy/60 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-semibold">المنتج</th>
                <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">السعر</th>
                <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">الخصم</th>
                <th className="text-right px-4 py-3 font-semibold">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => {
                const product = productById(o.productId);
                const state = computeOfferState(o);
                return (
                  <tr key={o.id} className="border-t border-navy/5">
                    <td className="px-4 py-3 font-medium text-navy">{product?.name || "منتج محذوف"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-emerald font-semibold">{o.newPrice} ج.م</span>{" "}
                      <span className="text-navy/35 line-through text-xs">{o.oldPrice} ج.م</span>
                    </td>
                    <td className="px-4 py-3 text-gold font-semibold hidden sm:table-cell">{discountPercent(o)}%</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => state !== "expired" && toggleStatus(o)}
                        disabled={state === "expired"}
                        className={`text-xs font-bold rounded-full px-2.5 py-1 ${STATUS_STYLES[state]} ${state !== "expired" ? "hover:opacity-70" : "cursor-not-allowed"}`}
                      >
                        {STATUS_LABELS[state]}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(o)} aria-label="تعديل" className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-emerald">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(o)} aria-label="حذف" className="p-1.5 rounded-lg text-navy/50 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-navy/40 mt-4 leading-relaxed">
        العرض بيظهر في الموقع بس لو الحالة "نشط" وتاريخ النهاية لسه ما جاش. العروض اللي فات معادها بتتحول
        تلقائيًا لـ"منتهي" وما تظهرش للعملاء حتى لو نسيت توقفها يدويًا.
      </p>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="حذف العرض؟"
        message="هيتم حذف العرض ده نهائيًا. المنتج نفسه مش هيتأثر."
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
