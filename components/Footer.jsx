"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Phone, MessageCircle, ExternalLink } from "lucide-react";
import LogoMark from "./LogoMark";
import SocialIcons from "./SocialIcons";
import { SITE, waLink } from "../data/site";
import { SEED_SETTINGS } from "../data/settings";
import { loadSettings } from "../lib/settingsStore";

// ملحوظة معمارية: كانت هنا خريطة iframe مضمّنة، لكن رابط جوجل مابس اللي اتحدد
// (maps.app.goo.gl) هو رابط مشاركة مختصر مش رابط embed — جوجل بتمنع تضمين
// روابط المشاركة دي جوه iframe (X-Frame-Options)، فتضمينها كان هيظهر خريطة
// فاضية/مكسورة، وده أسوأ من عدم وجود خريطة خالص. الحل الأنسب والأمان: location
// card واضح بالعنوان والمواعيد + زرار "افتح الموقع على خرائط جوجل" بيفتح
// الرابط الصحيح في تاب جديد — نفس الاقتراح المطروح في الطلب نفسه.
export default function Footer() {
  const [settings, setSettings] = useState(SEED_SETTINGS);

  useEffect(() => {
    loadSettings(SEED_SETTINGS).then(setSettings);
  }, []);

  return (
    <footer id="contact" className="bg-emerald text-ivory px-4 sm:px-6 pt-16 sm:pt-20 pb-28 lg:pb-16">
      <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-12 mb-14">
        <div className="grid gap-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <LogoMark className="w-11 h-11" />
              <div>
                <p className="font-display font-bold">صيدلية الدكتور</p>
                <p className="font-display font-extrabold -mt-0.5">سالم أحمد فؤاد</p>
              </div>
            </div>
            <p className="text-sm text-ivory/70 leading-relaxed">
              رعاية صحية وجمالية بمعايير راقية، بثقة أهالي أبو المطامير منذ أكثر من خمسة عشر عامًا.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-gold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> الموقع وساعات العمل
            </h3>
            <p className="text-sm text-ivory/80 leading-loose">{SITE.address}</p>
            <div className="flex items-center gap-2 mt-4 text-sm text-ivory/80">
              <Clock className="w-4 h-4 text-gold" />
              {SITE.workingHours}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-gold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" /> تواصل معنا
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href={waLink("مرحبًا، أرغب في التواصل مع الصيدلية", "primary")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 w-fit"
              >
                <MessageCircle className="w-4 h-4" /> واتساب (١)
              </a>
              <a
                href={waLink("مرحبًا، أرغب في التواصل مع الصيدلية", "secondary")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 w-fit"
              >
                <MessageCircle className="w-4 h-4" /> واتساب (٢)
              </a>
              <a
                href={`tel:${SITE.phoneNumber}`}
                className="inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-4 py-2.5 w-fit"
                dir="ltr"
              >
                <Phone className="w-4 h-4" /> {SITE.phoneNumber}
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-gold mb-4">تابعنا</h3>
            <SocialIcons variant="dark" />
          </div>
        </div>

        {/* Location card بدل الخريطة المضمّنة */}
        <div className="rounded-3xl overflow-hidden border border-white/15 shadow-xl bg-white/5 flex flex-col">
          <div className="relative h-40 sm:h-48 shrink-0 flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{ backgroundImage: "radial-gradient(circle, #C9A24B 1px, transparent 1px)", backgroundSize: "20px 20px" }}
            />
            <div className="relative w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-gold" />
            </div>
          </div>
          <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
            <div>
              <h3 className="font-display font-semibold text-ivory mb-2">موقع الصيدلية</h3>
              <p className="text-sm text-ivory/70 leading-relaxed">{SITE.address}</p>
            </div>
            <a
              href={settings.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold text-navy text-sm font-semibold px-5 py-3 min-h-[44px] hover:bg-ivory transition-colors duration-300 w-fit"
            >
              افتح الموقع على خرائط جوجل
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl border-t border-white/10 pt-6 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} صيدلية الدكتور سالم أحمد فؤاد — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
