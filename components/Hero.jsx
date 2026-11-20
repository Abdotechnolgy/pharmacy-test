"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, BadgeCheck, ShieldCheck, Star, Phone } from "lucide-react";
import LogoMark from "./LogoMark";
import { waLink, SITE } from "../data/site";

function useCountUp(target, active, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setValue(target);
      return;
    }
    let start = null;
    let frame;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);
  return value;
}

function Stat({ target, suffix = "", label }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const value = useCountUp(target, inView);

  return (
    <div ref={ref}>
      <p className="font-display font-extrabold text-2xl text-emerald">
        {value}
        {suffix}
      </p>
      <p className="text-xs text-navy/60 mt-1">{label}</p>
    </div>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32 px-4 sm:px-6">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 80% 15%, rgba(201,162,75,0.18), transparent 45%), radial-gradient(circle at 10% 85%, rgba(10,75,66,0.14), transparent 45%), linear-gradient(180deg, #FBF7EF 0%, #F3EFE3 100%)",
        }}
      />

      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-14 md:gap-8 items-center">
        <div className="order-2 md:order-1 text-center md:text-right">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-gold/30 px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald shadow-sm">
            <BadgeCheck className="w-4 h-4 text-gold" />
            صيدلية معتمدة — خدمة ٢٤ ساعة يوميًا
          </span>

          <h1 className="font-display font-extrabold text-navy mt-6 leading-[1.15] text-3xl sm:text-4xl lg:text-5xl">
            رعاية صحية بمعايير{" "}
            <span className="text-emerald relative">
              فاخرة
              <svg className="absolute -bottom-1 right-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0 5 Q100 -3 200 5" stroke="#C9A24B" strokeWidth="3" fill="none" />
              </svg>
            </span>{" "}
            تليق بثقتكم
          </h1>

          <p className="mt-6 text-navy/70 text-base sm:text-lg leading-relaxed max-w-xl mx-auto md:mx-0">
            صيدلية الدكتور سالم أحمد فؤاد في أبو المطامير تجمع بين الدقة الطبية والرقي في الخدمة — أدوية أصلية،
            صيادلة معتمدون، واستشارة فورية متاحة لكم في أي وقت.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              href={waLink("مرحبًا، أرغب في طلب علاج من صيدلية الدكتور سالم أحمد فؤاد")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald text-ivory px-7 py-3.5 font-semibold shadow-[0_15px_35px_rgba(10,75,66,0.3)] hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(10,75,66,0.4)] transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              اطلب علاجك الآن
            </a>
            <a
              href={`tel:${SITE.phoneNumber}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/70 backdrop-blur-md border border-navy/15 text-navy px-7 py-3.5 font-semibold hover:bg-white transition-all duration-300"
            >
              <Phone className="w-4 h-4" />
              تواصل مع الصيدلي
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald bg-emerald/10 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              مفتوحة الآن
            </span>
            <a href={`tel:${SITE.phoneNumber}`} dir="ltr" className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy/70 bg-white/70 border border-navy/10 rounded-full px-3 py-1.5 hover:text-emerald transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {SITE.phoneNumber}
            </a>
          </div>

          <div className="mt-8 flex items-center gap-8 justify-center md:justify-start">
            <Stat target={24} suffix="/7" label="خدمة متواصلة" />
            <div className="w-px h-10 bg-navy/10" />
            <Stat target={100} suffix="%" label="منتجات أصلية" />
            <div className="w-px h-10 bg-navy/10" />
            <Stat target={15} suffix="+" label="سنة خبرة" />
          </div>
        </div>

        <div className="order-1 md:order-2 flex justify-center relative">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald/10 to-gold/10 blur-2xl scale-110" />
            <div className="animate-drift">
              <LogoMark className="w-64 h-64 sm:w-80 sm:h-80 ring-4 drop-shadow-[0_20px_45px_rgba(14,42,74,0.18)]" />
            </div>

            <div className="absolute -top-3 -right-3 sm:top-2 sm:-right-6 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald" />
              <span className="text-xs font-semibold text-navy">صيدلي مرخّص</span>
            </div>

            <div className="absolute -bottom-2 -left-4 sm:bottom-4 sm:-left-8 bg-white/80 backdrop-blur-md border border-white/70 rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2">
              <Star className="w-5 h-5 text-gold fill-gold" />
              <span className="text-xs font-semibold text-navy">ثقة أهالي أبو المطامير</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
