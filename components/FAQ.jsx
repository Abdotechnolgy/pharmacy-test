"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Seal from "./Seal";
import Reveal from "./Reveal";
import { FAQ as FAQ_ITEMS } from "../data/content";

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 bg-ivory">
      <div className="mx-auto max-w-3xl">
        <Reveal className="flex flex-col items-center text-center mb-12">
          <Seal className="w-12 h-12 mb-4" />
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy">الأسئلة الشائعة</h2>
        </Reveal>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            return (
              <Reveal key={item.q} delay={i * 50}>
                <div
                  className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${
                    isOpen ? "border-emerald/30 bg-white shadow-md" : "border-navy/10 bg-white/60"
                  }`}
                >
                  <h3>
                    <button
                      id={buttonId}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="w-full flex items-center justify-between gap-4 px-6 py-4 text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald/50 rounded-2xl"
                    >
                      <span className="font-display font-semibold text-navy text-sm sm:text-base">{item.q}</span>
                      <Plus className={`w-5 h-5 shrink-0 text-emerald transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden px-6">
                      <p className="text-sm text-navy/65 leading-relaxed pb-5">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
