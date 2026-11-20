"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getOfferCountdown } from "../lib/offersStore";

// عداد تنازلي حقيقي مبني على endDate الفعلي للعرض — مفيش أي بيانات وهمية هنا.
// لو العرض مفيهوش endDate حقيقي (زي عروض الأدمن التجريبية)، الكومبوننت مبيرندرش حاجة خالص.
function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center min-w-[2.5rem]">
      <span className="font-display font-bold text-sm sm:text-base tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[9px] sm:text-[10px] opacity-70 mt-1">{label}</span>
    </div>
  );
}

export default function OfferCountdown({ offer, tone = "light" }) {
  const [remaining, setRemaining] = useState(() => getOfferCountdown(offer));

  useEffect(() => {
    const tick = () => setRemaining(getOfferCountdown(offer));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offer]);

  if (!remaining) return null;

  const toneClasses = tone === "dark" ? "bg-navy/40 text-ivory" : "bg-white/70 text-navy border border-white/70";

  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl px-3.5 py-2 backdrop-blur-md ${toneClasses}`} dir="ltr">
      <Clock className="w-4 h-4 shrink-0 opacity-80" />
      <div className="flex items-center gap-2" dir="ltr">
        {remaining.days > 0 && (
          <>
            <Unit value={remaining.days} label="يوم" />
            <span className="opacity-40">:</span>
          </>
        )}
        <Unit value={remaining.hours} label="ساعة" />
        <span className="opacity-40">:</span>
        <Unit value={remaining.minutes} label="دقيقة" />
        <span className="opacity-40">:</span>
        <Unit value={remaining.seconds} label="ثانية" />
      </div>
    </div>
  );
}
