"use client";

import { useEffect, useRef, useState } from "react";
import { Star, ChevronRight, ChevronLeft, Quote } from "lucide-react";
import Seal from "./Seal";
import Reveal from "./Reveal";
import { TESTIMONIALS } from "../data/content";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const prev = () => setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setIndex((i) => (i + 1) % TESTIMONIALS.length);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") prev();
    if (e.key === "ArrowLeft") next();
  };

  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) (delta > 0 ? prev() : next());
    touchStartX.current = null;
  };

  const t = TESTIMONIALS[index];

  return (
    <section id="testimonials" className="py-20 sm:py-28 px-4 sm:px-6 bg-mist">
      <Reveal className="mx-auto max-w-3xl text-center">
        <Seal className="w-12 h-12 mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy mb-12">آراء عملائنا</h2>

        <div
          className="relative rounded-3xl bg-white/70 backdrop-blur-md border border-white/70 shadow-[0_15px_40px_rgba(14,42,74,0.08)] px-6 sm:px-14 py-10 sm:py-12 focus:outline-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="آراء العملاء"
          aria-live="polite"
        >
          <Quote className="w-9 h-9 text-gold/50 mx-auto mb-5" />
          <p className="font-display text-lg sm:text-xl text-navy leading-relaxed min-h-[80px]">{t.text}</p>

          <div className="flex justify-center gap-1 mt-6">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-gold fill-gold" />
            ))}
          </div>

          <p className="mt-4 font-display font-semibold text-navy">{t.name}</p>
          <p className="text-xs text-navy/50">{t.role}</p>

          <button
            onClick={prev}
            aria-label="الرأي السابق"
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -right-5 w-10 h-10 rounded-full bg-white shadow-md items-center justify-center text-navy hover:text-emerald focus:outline-none focus:ring-2 focus:ring-emerald/40 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="الرأي التالي"
            className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -left-5 w-10 h-10 rounded-full bg-white shadow-md items-center justify-center text-navy hover:text-emerald focus:outline-none focus:ring-2 focus:ring-emerald/40 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`رأي رقم ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald/40 ${
                i === index ? "w-6 bg-emerald" : "w-2 bg-navy/20"
              }`}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
