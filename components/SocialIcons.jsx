"use client";

import { useEffect, useState } from "react";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import TikTokIcon from "./icons/TikTokIcon";
import { SEED_SETTINGS } from "../data/settings";
import { loadSettings } from "../lib/settingsStore";
import { waLink } from "../data/site";

// أيقونات السوشيال ميديا — الأربعة بيظهروا دايمًا (عشان الصف يبان متسق ومكتمل)،
// لكن أي منصة لسه مالهاش رابط حقيقي متحط في /admin/settings بتظهر بشكل باهت
// (مُعطّلة، من غير أي رابط)، من غير ما تختفي خالص. واتساب دايمًا شغال لأن
// الرقم موجود فعليًا من البداية.
export default function SocialIcons({ variant = "dark" }) {
  const [settings, setSettings] = useState(SEED_SETTINGS);

  useEffect(() => {
    loadSettings(SEED_SETTINGS).then(setSettings);
  }, []);

  const items = [
    { key: "whatsapp", label: "واتساب", Icon: MessageCircle, href: waLink("مرحبًا، أرغب في التواصل مع الصيدلية") },
    { key: "facebook", label: "فيسبوك", Icon: Facebook, href: settings.facebookUrl },
    { key: "instagram", label: "إنستجرام", Icon: Instagram, href: settings.instagramUrl },
    { key: "tiktok", label: "تيك توك", Icon: TikTokIcon, href: settings.tiktokUrl },
  ];

  const activeBase =
    variant === "dark" ? "bg-white/10 text-ivory hover:bg-gold hover:text-navy" : "bg-navy/5 text-navy hover:bg-emerald hover:text-ivory";
  const mutedBase = variant === "dark" ? "bg-white/5 text-ivory/30" : "bg-navy/5 text-navy/25";

  return (
    <div className="flex items-center gap-2.5" role="list" aria-label="تابعنا على السوشيال ميديا">
      {items.map(({ key, label, Icon, href }) => {
        const isConfigured = Boolean(href);
        const commonClasses = `w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold/50 ${
          isConfigured ? activeBase : `${mutedBase} cursor-not-allowed`
        }`;

        if (!isConfigured) {
          return (
            <span key={key} role="listitem" aria-label={`${label} — لسه مضافش رابط`} title={`${label} — لسه مضافش رابط`} className={commonClasses}>
              <Icon className="w-[18px] h-[18px]" />
            </span>
          );
        }

        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            role="listitem"
            className={commonClasses}
          >
            <Icon className="w-[18px] h-[18px]" />
          </a>
        );
      })}
    </div>
  );
}
