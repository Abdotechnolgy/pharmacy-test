"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, MessageCircle, Pill, Clock, Sparkles, ArrowUpLeft } from "lucide-react";
import Seal from "./Seal";
import Reveal from "./Reveal";
import { waLink } from "../data/site";
import { SERVICES as SEED_SERVICES } from "../data/services";
import { loadServices, getHomepageServices } from "../lib/servicesStore";

const ICONS = { Truck, MessageCircle, Pill, Clock, Sparkles };

function ServiceCard({ s }) {
  const Icon = ICONS[s.icon] || Sparkles;

  const content = (
    <div className="group h-full rounded-2xl bg-white border border-navy/10 shadow-[0_6px_20px_rgba(14,42,74,0.05)] hover:shadow-[0_12px_28px_rgba(14,42,74,0.1)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 p-4 sm:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald/10 flex items-center justify-center group-hover:bg-emerald transition-colors duration-300">
          <Icon className="w-5 h-5 text-emerald group-hover:text-white transition-colors duration-300" />
        </div>
        {s.cta && <ArrowUpLeft className="w-4 h-4 text-navy/25 group-hover:text-emerald transition-colors duration-300" />}
      </div>
      <h3 className="font-display font-semibold text-navy text-sm sm:text-base mb-1">{s.title}</h3>
      <p className="text-xs sm:text-sm text-navy/55 leading-relaxed">{s.desc}</p>
    </div>
  );

  if (s.cta?.type === "whatsapp") {
    return (
      <a href={waLink(s.cta.value)} target="_blank" rel="noopener noreferrer" className="block h-full" aria-label={s.cta.label || s.title}>
        {content}
      </a>
    );
  }
  if (s.cta?.type === "anchor") {
    return (
      <Link href={s.cta.value} className="block h-full" aria-label={s.cta.label || s.title}>
        {content}
      </Link>
    );
  }
  return content;
}

export default function Services() {
  const [services, setServices] = useState(getHomepageServices(SEED_SERVICES));

  useEffect(() => {
    loadServices(SEED_SERVICES).then((data) => setServices(getHomepageServices(data)));
  }, []);

  if (!services.length) return null;

  return (
    <section id="services" className="py-14 sm:py-20 px-4 sm:px-6 bg-mist">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <Seal className="w-10 h-10 sm:w-12 sm:h-12 mb-3" />
          <h2 className="font-display font-bold text-xl sm:text-3xl text-navy">خدماتنا</h2>
          <p className="text-navy/60 mt-2 text-sm sm:text-base max-w-lg">كل ما تحتاجه من رعاية صيدلانية، بخطوة واحدة بسيطة.</p>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 60}>
              <ServiceCard s={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
