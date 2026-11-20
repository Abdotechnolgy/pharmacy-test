"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import Seal from "./Seal";
import Reveal from "./Reveal";
import { waLink } from "../data/site";

const SERVICES = ["استشارة دوائية", "توصيل طلب", "استفسار عن منتج", "أخرى"];

export default function BookingForm() {
  const [form, setForm] = useState({ name: "", phone: "", service: SERVICES[0], message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = "من فضلك أدخل اسمك بالكامل";
    if (!/^01[0-2,5]\d{8}$/.test(form.phone.trim())) next.phone = "أدخل رقم موبايل مصري صحيح (مثال: 01xxxxxxxxx)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const message = [
      "طلب استشارة / حجز جديد",
      `الاسم: ${form.name}`,
      `رقم الموبايل: ${form.phone}`,
      `نوع الخدمة: ${form.service}`,
      form.message ? `تفاصيل إضافية: ${form.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    // محاكاة بسيطة لحالة الإرسال قبل فتح واتساب — تحسين للتجربة، لا تعتمد على backend
    setTimeout(() => {
      window.open(waLink(message), "_blank", "noopener,noreferrer");
      setSubmitting(false);
      setSent(true);
    }, 500);
  };

  return (
    <section id="booking" className="py-20 sm:py-28 px-4 sm:px-6 bg-mist">
      <div className="mx-auto max-w-2xl">
        <Reveal className="flex flex-col items-center text-center mb-10">
          <Seal className="w-12 h-12 mb-4" />
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy">احجز استشارتك</h2>
          <p className="text-navy/60 mt-3 max-w-md">
            عبّي البيانات وهنبعت طلبك مباشرة عبر واتساب، وهيتواصل معاك الصيدلي المختص في أقرب وقت.
          </p>
        </Reveal>

        <Reveal>
          <form
            onSubmit={handleSubmit}
            noValidate
            className="rounded-3xl bg-white/70 backdrop-blur-md border border-white/70 shadow-[0_15px_40px_rgba(14,42,74,0.08)] p-6 sm:p-10 grid gap-5"
          >
            {sent && (
              <div role="status" className="flex items-center gap-2 rounded-xl bg-emerald/10 text-emerald text-sm font-semibold px-4 py-3">
                <CheckCircle2 className="w-5 h-5" />
                تم فتح واتساب لإرسال طلبك — لو محدثش، تأكد إن واتساب متاح على جهازك.
              </div>
            )}

            <div>
              <label htmlFor="booking-name" className="block text-sm font-semibold text-navy mb-2">
                الاسم بالكامل
              </label>
              <input
                id="booking-name"
                type="text"
                value={form.name}
                onChange={update("name")}
                placeholder="مثال: أحمد محمد"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "booking-name-error" : undefined}
                className={`w-full rounded-xl bg-white border px-4 py-3 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 transition-all ${
                  errors.name ? "border-red-300 focus:ring-red-200" : "border-navy/10 focus:ring-emerald/40"
                }`}
              />
              {errors.name && (
                <p id="booking-name-error" role="alert" className="text-xs text-red-500 mt-1.5">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="booking-phone" className="block text-sm font-semibold text-navy mb-2">
                رقم الموبايل
              </label>
              <input
                id="booking-phone"
                type="tel"
                value={form.phone}
                onChange={update("phone")}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "booking-phone-error" : undefined}
                className={`w-full rounded-xl bg-white border px-4 py-3 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 transition-all ${
                  errors.phone ? "border-red-300 focus:ring-red-200" : "border-navy/10 focus:ring-emerald/40"
                }`}
              />
              {errors.phone && (
                <p id="booking-phone-error" role="alert" className="text-xs text-red-500 mt-1.5">
                  {errors.phone}
                </p>
              )}
            </div>

            <fieldset>
              <legend className="block text-sm font-semibold text-navy mb-2">نوع الخدمة</legend>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setForm((f) => ({ ...f, service: s }))}
                    aria-pressed={form.service === s}
                    className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald/30 ${
                      form.service === s
                        ? "bg-emerald text-ivory border-emerald shadow-md"
                        : "bg-white text-navy/70 border-navy/10 hover:border-emerald/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="booking-message" className="block text-sm font-semibold text-navy mb-2">
                تفاصيل إضافية (اختياري)
              </label>
              <textarea
                id="booking-message"
                value={form.message}
                onChange={update("message")}
                rows={3}
                placeholder="اكتب أي تفاصيل تساعدنا في خدمتك بشكل أفضل..."
                className="w-full rounded-xl bg-white border border-navy/10 px-4 py-3 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-emerald/40 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald text-ivory px-7 py-3.5 font-semibold shadow-[0_15px_35px_rgba(10,75,66,0.3)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(10,75,66,0.4)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "جارِ الإرسال..." : "إرسال الطلب عبر واتساب"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
