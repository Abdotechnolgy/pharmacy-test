// ⚠️ عدّل البيانات دي مرة واحدة وهتتحدث في كل الموقع تلقائيًا
import { getSettingsCache } from "../lib/settingsCache";

export const SITE = {
  name: "صيدلية الدكتور سالم أحمد فؤاد",
  whatsappNumber: "201080737870", // الرقم الأساسي (fallback) — القيمة الفعلية قابلة للتعديل من /admin/settings
  phoneNumber: "+201000000000",
  address: "شارع التوحيد والنور، بجوار برج الثورة، مدينة أبو المطامير، محافظة البحيرة",
  mapQuery: "شارع التوحيد والنور بجوار برج الثورة أبو المطامير البحيرة",
  workingHours: "خدمة مستمرة على مدار ٢٤ ساعة، طوال أيام الأسبوع",
  baseUrl: "https://pharmacy-dr-salem-fouad.example.com", // غيّره لدومينك الحقيقي بعد النشر
};

// which: "primary" (افتراضي) أو "secondary" — بيقرأ الرقم من cache الإعدادات
// (lib/settingsCache.js) اللي بيتعبّي من قاعدة البيانات أول ما الموقع يفتح.
// قبل ما التحميل يخلص، أو لو حصل خطأ، بيرجع للرقم الافتراضي فوق.
export function waLink(message, which = "primary") {
  const settings = getSettingsCache();
  const number = (which === "secondary" ? settings.whatsappSecondary : settings.whatsappPrimary) || SITE.whatsappNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
