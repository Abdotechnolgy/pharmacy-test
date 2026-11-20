import Image from "next/image";
import logo from "../public/logo.png";

// شعار الصيدلية الحقيقي (الصورة اللي اترفعت) — بيُستخدم في أماكن العلامة التجارية
// الأساسية بس (الـ Navbar، الفوتر، ولوحة التحكم)، مش في كل أيقونة زخرفية صغيرة
// في نص الصفحة (زي عناوين الأقسام) عشان الشكل يفضل نضيف ومتسقش مع كل مكان.
export default function LogoMark({ className = "w-11 h-11" }) {
  return (
    <span className={`relative inline-block rounded-full overflow-hidden ring-2 ring-gold/70 shadow-sm shrink-0 ${className}`}>
      <Image src={logo} alt="شعار صيدلية الدكتور سالم أحمد فؤاد" fill sizes="64px" className="object-cover" priority />
    </span>
  );
}
