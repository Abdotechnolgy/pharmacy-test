"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Save, X, ArrowUp, ArrowDown, Truck, MessageCircle, Pill, Clock, Sparkles, Heart, ShieldCheck } from "lucide-react";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";
import { useToast } from "../../../../components/admin/Toast";
import { SERVICES as SEED_SERVICES } from "../../../../data/services";
import { loadServices, saveServices, createService, deleteService, sortServices } from "../../../../lib/servicesStore";

const ICONS = { Truck, MessageCircle, Pill, Clock, Sparkles, Heart, ShieldCheck };
const ICON_OPTIONS = Object.keys(ICONS);
const CTA_TYPES = [
  { id: "none", label: "بدون إجراء (معلوماتية فقط)" },
  { id: "whatsapp", label: "فتح واتساب برسالة جاهزة" },
  { id: "anchor", label: "الانتقال لجزء في نفس الصفحة" },
];

function emptyForm() {
  return {
    id: null,
    icon: "Sparkles",
    title: "",
    desc: "",
    isActive: true,
    ctaType: "none",
    ctaValue: "",
    ctaLabel: "",
  };
}

export default function AdminServicesPage() {
  const { show } = useToast();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadServices(SEED_SERVICES).then((data) => {
      setServices(sortServices(data));
      setMounted(true);
    });
  }, []);

  const persist = async (next) => {
    const sorted = sortServices(next);
    setServices(sorted);
    try {
      await saveServices(sorted);
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.desc.trim()) {
      show("لازم عنوان ووصف للخدمة", "error");
      return;
    }
    const cta =
      form.ctaType === "none"
        ? null
        : { type: form.ctaType, value: form.ctaValue.trim(), label: form.ctaLabel.trim() || undefined };

    try {
      if (editingId) {
        await persist(services.map((s) => (s.id === editingId ? { ...s, icon: form.icon, title: form.title, desc: form.desc, isActive: form.isActive, cta } : s)));
        show("تم حفظ تعديل الخدمة", "success");
      } else {
        const nextOrder = Math.max(0, ...services.map((s) => s.sortOrder || 0)) + 1;
        const created = await createService({ icon: form.icon, title: form.title, desc: form.desc, isActive: form.isActive, cta, sortOrder: nextOrder });
        setServices((prev) => sortServices([...prev, created]));
        show("تم إضافة الخدمة بنجاح", "success");
      }
      resetForm();
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const handleEdit = (s) => {
    setForm({
      id: s.id,
      icon: s.icon,
      title: s.title,
      desc: s.desc,
      isActive: s.isActive !== false,
      ctaType: s.cta?.type || "none",
      ctaValue: s.cta?.value || "",
      ctaLabel: s.cta?.label || "",
    });
    setEditingId(s.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteConfirmed = async () => {
    try {
      await deleteService(confirmDelete.id);
      setServices((prev) => prev.filter((s) => s.id !== confirmDelete.id));
      show("تم حذف الخدمة", "success");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحذف", "error");
    }
    setConfirmDelete(null);
  };

  const toggleActive = (s) => {
    persist(services.map((x) => (x.id === s.id ? { ...x, isActive: x.isActive === false } : x)));
    show(s.isActive === false ? "تم تفعيل الخدمة" : "تم إيقاف الخدمة", "info");
  };

  const move = (s, direction) => {
    const sorted = sortServices(services);
    const idx = sorted.findIndex((x) => x.id === s.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    persist(sorted.map((x) => (x.id === a.id ? { ...x, sortOrder: b.sortOrder } : x.id === b.id ? { ...x, sortOrder: a.sortOrder } : x)));
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display font-bold text-navy text-xl mb-4">الخدمات</h1>
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">جارِ التحميل...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-navy text-xl">الخدمات</h1>
        <p className="text-xs text-navy/50 mt-1">تظهر في قسم "خدماتنا" بالصفحة الرئيسية، بنفس الترتيب هنا</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-navy/10 p-5 mb-8 grid gap-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">عنوان الخدمة</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="مثال: توصيل سريع"
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">الأيقونة</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => {
                const Icon = ICONS[icon];
                return (
                  <button
                    type="button"
                    key={icon}
                    onClick={() => setForm((f) => ({ ...f, icon }))}
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                      form.icon === icon ? "border-emerald bg-emerald/10 text-emerald" : "border-navy/10 text-navy/50 hover:border-navy/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy/60 mb-1.5">وصف قصير</label>
          <textarea
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            rows={2}
            className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">الإجراء (CTA)</label>
            <select
              value={form.ctaType}
              onChange={(e) => setForm((f) => ({ ...f, ctaType: e.target.value }))}
              className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
            >
              {CTA_TYPES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          {form.ctaType !== "none" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1.5">
                  {form.ctaType === "whatsapp" ? "نص رسالة واتساب" : "رابط الجزء (مثال: /categories)"}
                </label>
                <input
                  type="text"
                  dir={form.ctaType === "anchor" ? "ltr" : "rtl"}
                  value={form.ctaValue}
                  onChange={(e) => setForm((f) => ({ ...f, ctaValue: e.target.value }))}
                  className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy/60 mb-1.5">نص الزرار (اختياري)</label>
                <input
                  type="text"
                  value={form.ctaLabel}
                  onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                  className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>
            </>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-navy/70 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-emerald" />
          تظهر في الصفحة الرئيسية
        </label>

        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-emerald text-ivory px-5 py-2.5 text-sm font-semibold hover:bg-navy transition-colors">
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingId ? "حفظ التعديل" : "إضافة خدمة"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 text-navy px-5 py-2.5 text-sm font-semibold">
              <X className="w-4 h-4" />
              إلغاء
            </button>
          )}
        </div>
      </form>

      {services.length === 0 ? (
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">
          مفيش خدمات لسه — أضف أول خدمة من الفورم فوق.
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-navy/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy/5 text-navy/60 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-semibold">الخدمة</th>
                <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">الإجراء</th>
                <th className="text-right px-4 py-3 font-semibold">الحالة</th>
                <th className="text-right px-4 py-3 font-semibold">الترتيب</th>
                <th className="text-right px-4 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, idx) => {
                const Icon = ICONS[s.icon] || Sparkles;
                return (
                  <tr key={s.id} className="border-t border-navy/5">
                    <td className="px-4 py-3 font-medium text-navy">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-emerald" />
                        </span>
                        {s.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-navy/60 hidden sm:table-cell text-xs">
                      {s.cta ? CTA_TYPES.find((c) => c.id === s.cta.type)?.label : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(s)}
                        className={`text-xs font-bold rounded-full px-2.5 py-1 ${s.isActive !== false ? "bg-emerald/10 text-emerald" : "bg-navy/10 text-navy/50"}`}
                      >
                        {s.isActive !== false ? "نشط" : "متوقف"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => move(s, "up")} disabled={idx === 0} aria-label="لأعلى" className="p-1 rounded text-navy/50 hover:bg-navy/5 disabled:opacity-25">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => move(s, "down")} disabled={idx === services.length - 1} aria-label="لأسفل" className="p-1 rounded text-navy/50 hover:bg-navy/5 disabled:opacity-25">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(s)} aria-label="تعديل" className="p-1.5 rounded-lg text-navy/50 hover:bg-navy/5 hover:text-emerald">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(s)} aria-label="حذف" className="p-1.5 rounded-lg text-navy/50 hover:bg-red-50 hover:text-red-500">
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

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="حذف الخدمة؟"
        message="هيتم حذف هذه الخدمة نهائيًا من الصفحة الرئيسية."
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
