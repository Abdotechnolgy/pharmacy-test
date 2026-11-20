"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, MapPin, Phone, Clock, Globe, MessageCircle, Save, RotateCcw, Facebook, Instagram } from "lucide-react";
import TikTokIcon from "../../../../components/icons/TikTokIcon";
import ConfirmDialog from "../../../../components/admin/ConfirmDialog";
import { useToast } from "../../../../components/admin/Toast";
import { SITE } from "../../../../data/site";
import { SEED_SETTINGS } from "../../../../data/settings";
import { loadSettings, saveSettings, resetSettings } from "../../../../lib/settingsStore";
import { primeSettingsCache } from "../../../../lib/settingsCache";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-navy/5 last:border-0">
      <span className="flex items-center gap-2 text-sm text-navy/60">
        <Icon className="w-4 h-4 text-emerald" />
        {label}
      </span>
      <span className="text-sm font-semibold text-navy" dir="ltr">
        {value}
      </span>
    </div>
  );
}

function Field({ icon: Icon, label, hint, ...props }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-navy/60 mb-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      <input
        {...props}
        dir="ltr"
        className="w-full rounded-lg border border-navy/10 px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-emerald/40"
      />
      {hint && <p className="text-[11px] text-navy/40 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { show } = useToast();
  const [form, setForm] = useState(SEED_SETTINGS);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    loadSettings(SEED_SETTINGS).then(setForm);
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const clean = {
      ...form,
      whatsappPrimary: form.whatsappPrimary.replace(/[^\d]/g, ""),
      whatsappSecondary: form.whatsappSecondary.replace(/[^\d]/g, ""),
    };
    try {
      await saveSettings(clean);
      setForm(clean);
      await primeSettingsCache(); // عشان waLink() يستخدم الرقم الجديد فورًا من غير reload
      show("تم حفظ الإعدادات", "success");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الحفظ", "error");
    }
  };

  const handleResetConfirmed = async () => {
    try {
      const reset = await resetSettings(SEED_SETTINGS);
      setForm(reset);
      await primeSettingsCache();
      show("تم استرجاع الإعدادات الافتراضية", "info");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء الاسترجاع", "error");
    }
    setConfirmReset(false);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-navy text-xl">الإعدادات</h1>
        <p className="text-xs text-navy/50 mt-1">أرقام واتساب، رابط خرائط جوجل، وروابط السوشيال ميديا — بتتحدث في كل الموقع فورًا</p>
      </div>

      <form onSubmit={handleSave} className="grid gap-4">
        <div className="rounded-2xl bg-white border border-navy/10 p-5 grid gap-4">
          <h2 className="font-semibold text-navy text-sm">أرقام واتساب</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              icon={MessageCircle}
              label="الرقم الأساسي"
              value={form.whatsappPrimary}
              onChange={set("whatsappPrimary")}
              placeholder="201080737870"
              hint="بدون + وبدون أصفار في البداية — ده اللي بيتفتح من زرار واتساب في كل مكان بالموقع"
            />
            <Field
              icon={MessageCircle}
              label="الرقم الثانوي"
              value={form.whatsappSecondary}
              onChange={set("whatsappSecondary")}
              placeholder="201010274823"
              hint="بيظهر بس في قسم التواصل بالـ Footer، جنب الرقم الأساسي"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-navy/10 p-5 grid gap-4">
          <h2 className="font-semibold text-navy text-sm">الموقع على خرائط جوجل</h2>
          <Field
            icon={MapPin}
            label="رابط خرائط جوجل"
            type="url"
            value={form.googleMapsUrl}
            onChange={set("googleMapsUrl")}
            placeholder="https://maps.app.goo.gl/..."
            hint="ده اللي بيفتح لما حد يضغط 'افتح الموقع على خرائط جوجل' في الـ Footer"
          />
        </div>

        <div className="rounded-2xl bg-white border border-navy/10 p-5 grid gap-4">
          <h2 className="font-semibold text-navy text-sm">روابط السوشيال ميديا</h2>
          <p className="text-xs text-navy/45 -mt-2">
            سيب أي حقل فاضي لو الرابط مش موجود لسه — الأيقونة متبانش في الموقع غير لما تحط رابط حقيقي.
          </p>
          <Field icon={Facebook} label="فيسبوك" type="url" value={form.facebookUrl} onChange={set("facebookUrl")} placeholder="https://facebook.com/..." />
          <Field icon={Instagram} label="إنستجرام" type="url" value={form.instagramUrl} onChange={set("instagramUrl")} placeholder="https://instagram.com/..." />
          <Field icon={TikTokIcon} label="تيك توك" type="url" value={form.tiktokUrl} onChange={set("tiktokUrl")} placeholder="https://tiktok.com/@..." />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-emerald text-ivory px-5 py-2.5 text-sm font-semibold hover:bg-navy transition-colors">
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy/5 text-navy px-5 py-2.5 text-sm font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            استرجاع الافتراضي
          </button>
        </div>
      </form>

      <div className="rounded-2xl bg-white border border-navy/10 p-6 mt-6">
        <h2 className="font-semibold text-navy text-sm mb-1">بيانات ثابتة أخرى</h2>
        <p className="text-xs text-navy/45 mb-3">دي بتتعدّل من ملف data/site.js في الكود مباشرة</p>
        <Row icon={Phone} label="رقم الهاتف (اتصال)" value={SITE.phoneNumber} />
        <Row icon={Clock} label="ساعات العمل" value={SITE.workingHours} />
        <Row icon={Globe} label="رابط الموقع" value={SITE.baseUrl} />
        <div className="flex items-start justify-between py-3">
          <span className="flex items-center gap-2 text-sm text-navy/60">
            <MapPin className="w-4 h-4 text-emerald" />
            العنوان
          </span>
          <span className="text-sm font-semibold text-navy text-left max-w-[60%]">{SITE.address}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-navy/10 p-6 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-emerald" />
          <h3 className="font-display font-semibold text-navy text-sm">حساب لوحة التحكم</h3>
        </div>
        <p className="text-xs text-navy/60 leading-relaxed">
          تسجيل الدخول بقى بإيميل وكلمة سر حقيقيين عن طريق <strong>Supabase Auth</strong>. لإضافة أدمن جديد أو
          تغيير كلمة السر، روح لـ Supabase Dashboard → Authentication → Users. أي مستخدم جديد لازم يتضاف كمان
          في جدول <code className="bg-navy/5 rounded px-1 mx-1">user_roles</code> بدور "admin" عشان يقدر يدخل
          لوحة التحكم — راجع تعليمات <code className="bg-navy/5 rounded px-1 mx-1">supabase/schema-v2.sql</code>.
        </p>
      </div>

      <div className="rounded-2xl bg-gold/10 border border-gold/20 p-6 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-gold" />
          <h3 className="font-display font-semibold text-navy text-sm">ملاحظة أمان</h3>
        </div>
        <p className="text-xs text-navy/60 leading-relaxed">
          الدخول للوحة التحكم بقى محمي فعليًا على مستوى السيرفر (Supabase Auth + جدول أدوار المستخدمين)، مش بس
          كلمة سر مشتركة. كل عمليات الكتابة (إضافة/تعديل/حذف) في الـ API بتتأكد من جلسة دخول حقيقية قبل ما
          تنفّذ أي حاجة.
        </p>
      </div>
    </div>
  );
}
