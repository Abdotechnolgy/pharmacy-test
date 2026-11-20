"use client";

import { useState } from "react";
import { Pill, Sparkles, Leaf, Heart, Droplet, Sun } from "lucide-react";

const ICONS = { Pill, Sparkles, Leaf, Heart, Droplet, Sun };

// يعرض صورة المنتج الحقيقية لو موجودة، ولو مفيش صورة (أو فشل تحميلها)
// بيرجع تلقائيًا لأيقونة القسم كبديل أنيق — مفيش صور مكسورة أبدًا.
export default function ProductVisual({ icon, image, alt = "", className = "" }) {
  const Icon = ICONS[icon] || Pill;
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(image) && !failed;

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald/10 via-mist to-gold/10 overflow-hidden ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={alt}
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <>
          <div
            className="absolute inset-0 opacity-40"
            style={{ backgroundImage: "radial-gradient(circle, #0A4B42 1px, transparent 1px)", backgroundSize: "16px 16px" }}
          />
          <Icon className="w-10 h-10 text-emerald relative transition-transform duration-500 group-hover:scale-110" strokeWidth={1.6} />
        </>
      )}
    </div>
  );
}
