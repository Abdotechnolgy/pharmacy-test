import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// CTA واضح وPremium — مش مجرد لينك صغير — بيودي لصفحة التصنيف المستقلة.
export default function ViewAllButton({ href, label = "عرض المزيد" }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full bg-navy/5 text-navy border border-navy/10 px-6 py-3 text-sm font-semibold hover:bg-emerald hover:text-ivory hover:border-emerald transition-all duration-300 min-h-[44px]"
    >
      {label}
      <ArrowLeft className="w-4 h-4" />
    </Link>
  );
}
