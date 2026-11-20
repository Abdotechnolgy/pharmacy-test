"use client";

import { MessageCircle } from "lucide-react";
import { waLink } from "../data/site";

export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-20 left-4 sm:bottom-8 sm:left-8 z-50 flex items-center gap-3 lg:bottom-8">
      <span className="hidden sm:inline-flex items-center bg-white/80 backdrop-blur-md border border-white/70 shadow-lg text-navy text-sm font-semibold px-4 py-2.5 rounded-full whitespace-nowrap">
        اطلب علاجك الآن
      </span>
      <a
        href={waLink("مرحبًا، أرغب في طلب علاج من صيدلية الدكتور سالم أحمد فؤاد")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اطلب علاجك عبر واتساب"
        className="animate-seal-pulse relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.5)] hover:scale-105 transition-transform duration-300"
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="white" />
      </a>
    </div>
  );
}
