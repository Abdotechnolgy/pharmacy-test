"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, ChevronRight, CheckCircle2, Banknote, Landmark } from "lucide-react";
import Seal from "../../components/Seal";
import { waLink } from "../../data/site";
import { useCart } from "../../context/CartContext";

const PAYMENT_METHODS = [
  { id: "cod", label: "الدفع عند الاستلام", icon: Banknote },
  { id: "instapay", label: "تحويل انستاباي / محفظة", icon: Landmark },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "", payment: "cod", notes: "" });
  const [errors, setErrors] = useState({});
  const [placed, setPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "من فضلك أدخل اسمك بالكامل";
    if (!/^01[0-2,5]\d{8}$/.test(form.phone.trim())) next.phone = "أدخل رقم موبايل مصري صحيح (مثال: 01xxxxxxxxx)";
    if (form.address.trim().length < 6) next.address = "من فضلك أدخل عنوان واضح للتوصيل";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0 || !validate()) return;
    setSubmitError("");
    setSubmitting(true);

    const paymentLabel = PAYMENT_METHODS.find((p) => p.id === form.payment)?.label;

    // Supabase هو مصدر الطلب الأساسي — لازم الطلب يتحفظ فعليًا الأول، وبعدين
    // نفتح واتساب. لو المستخدم قفل واتساب أو مفتحوش، الطلب يفضل محفوظ عندنا.
    // ملحوظة أمان: السعر/الإجمالي المحفوظين فعليًا بيتحسبوا في السيرفر من
    // سعر المنتج الحقيقي وقت الطلب (مش من الأرقام اللي في السلة هنا)، فرسالة
    // واتساب تحت بنبنيها من رد السيرفر نفسه عشان تطابق الطلب المحفوظ فعلاً.
    let savedOrder;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          customerAddress: form.address,
          notes: form.notes,
          paymentMethod: form.payment,
          items,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error || "حصل خطأ أثناء حفظ الطلب، حاول تاني");
        setSubmitting(false);
        return;
      }
      savedOrder = data;
    } catch {
      setSubmitError("مقدرناش نوصل للسيرفر — تأكد من الاتصال بالإنترنت وحاول تاني");
      setSubmitting(false);
      return;
    }

    const savedItems = Array.isArray(savedOrder?.items) ? savedOrder.items : items.map((i) => ({ productName: i.name, price: i.price, oldPrice: i.oldPrice, quantity: i.qty }));
    const savedTotal = savedOrder?.total ?? total;

    const itemsList = savedItems
      .map(
        (i) =>
          `• ${i.productName} × ${i.quantity} = ${i.price * i.quantity} ج.م${
            i.oldPrice ? ` (بدل ${i.oldPrice * i.quantity} ج.م)` : ""
          }`
      )
      .join("\n");

    const message = [
      "طلب جديد من موقع الصيدلية",
      "",
      itemsList,
      "",
      `الإجمالي: ${savedTotal} ج.م`,
      "",
      `الاسم: ${form.name}`,
      `رقم الموبايل: ${form.phone}`,
      `عنوان التوصيل: ${form.address}`,
      `طريقة الدفع: ${paymentLabel}`,
      form.notes ? `ملاحظات: ${form.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(waLink(message), "_blank", "noopener,noreferrer");
    setPlaced(true);
    clearCart();
  };

  if (placed) {
    return (
      <div className="pt-32 pb-24 px-4 sm:px-6 min-h-[60vh] flex flex-col items-center text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald mb-5" />
        <h1 className="font-display font-bold text-2xl text-navy mb-3">تم إرسال طلبك بنجاح</h1>
        <p className="text-navy/60 max-w-md mb-8">
          تم فتح واتساب برسالة تحتوي على تفاصيل طلبك — هيتواصل معاك فريق الصيدلية لتأكيد الطلب وميعاد التوصيل.
        </p>
        <Link href="/" className="rounded-full bg-emerald text-ivory px-6 py-3 font-semibold hover:bg-navy transition-colors">
          الرجوع للرئيسية
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-24 px-4 sm:px-6 min-h-[60vh] flex flex-col items-center text-center">
        <Seal className="w-14 h-14 mb-5" />
        <h1 className="font-display font-bold text-2xl text-navy mb-3">السلة فاضية</h1>
        <p className="text-navy/60 max-w-md mb-8">أضف منتجات للسلة الأول عشان تقدر تكمل الطلب.</p>
        <Link href="/categories" className="rounded-full bg-emerald text-ivory px-6 py-3 font-semibold hover:bg-navy transition-colors">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 min-h-screen bg-mist">
      <div className="mx-auto max-w-2xl">
        <Link href="/categories" className="inline-flex items-center gap-1.5 text-sm text-navy/60 hover:text-emerald mb-6">
          <ChevronRight className="w-4 h-4" />
          الرجوع للمنتجات
        </Link>

        <div className="flex flex-col items-center text-center mb-8">
          <Seal className="w-11 h-11 mb-3" />
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy">إتمام الطلب</h1>
        </div>

        {/* Order summary */}
        <div className="rounded-2xl bg-white/70 border border-white/70 p-6 mb-6">
          <h2 className="font-display font-semibold text-navy mb-4">ملخص الطلب</h2>
          <div className="flex flex-col gap-2">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm text-navy/70">
                <span>{i.name} × {i.qty}</span>
                <span className="flex items-center gap-2">
                  {i.oldPrice && <span className="text-navy/35 line-through text-xs">{i.oldPrice * i.qty} ج.م</span>}
                  {i.price * i.qty} ج.م
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-display font-bold text-emerald text-lg mt-4 pt-4 border-t border-navy/10">
            <span>الإجمالي</span>
            <span>{total} ج.م</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/70 shadow-[0_15px_40px_rgba(14,42,74,0.08)] p-6 sm:p-8 grid gap-5">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">الاسم بالكامل</label>
            <input
              type="text"
              value={form.name}
              onChange={update("name")}
              placeholder="مثال: أحمد محمد"
              className={`w-full rounded-xl bg-white border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.name ? "border-red-300 focus:ring-red-200" : "border-navy/10 focus:ring-emerald/40"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">رقم الموبايل</label>
            <input
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              placeholder="01xxxxxxxxx"
              dir="ltr"
              className={`w-full rounded-xl bg-white border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.phone ? "border-red-300 focus:ring-red-200" : "border-navy/10 focus:ring-emerald/40"
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">عنوان التوصيل</label>
            <input
              type="text"
              value={form.address}
              onChange={update("address")}
              placeholder="الحي، الشارع، رقم العقار..."
              className={`w-full rounded-xl bg-white border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                errors.address ? "border-red-300 focus:ring-red-200" : "border-navy/10 focus:ring-emerald/40"
              }`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1.5">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">طريقة الدفع</label>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const active = form.payment === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setForm((f) => ({ ...f, payment: m.id }))}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all duration-300 ${
                      active ? "bg-emerald text-ivory border-emerald shadow-md" : "bg-white text-navy/70 border-navy/10 hover:border-emerald/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-navy/40 mt-2">
              الدفع الإلكتروني المباشر (فيزا / فوري) هيتم تفعيله قريبًا — حاليًا الدفع عند الاستلام أو التحويل اليدوي.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">ملاحظات إضافية (اختياري)</label>
            <textarea
              value={form.notes}
              onChange={update("notes")}
              rows={2}
              placeholder="أي تفاصيل تساعدنا في توصيل طلبك..."
              className="w-full rounded-xl bg-white border border-navy/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 transition-all resize-none"
            />
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 -mb-1">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald text-ivory px-7 py-3.5 font-semibold shadow-[0_15px_35px_rgba(10,75,66,0.3)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(10,75,66,0.4)] transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
            {submitting ? "جاري إرسال الطلب..." : "تأكيد الطلب عبر واتساب"}
          </button>
        </form>
      </div>
    </div>
  );
}
