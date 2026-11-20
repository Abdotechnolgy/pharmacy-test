import { ShieldCheck, BadgeCheck, Truck, HeartHandshake } from "lucide-react";
import Seal from "./Seal";
import Reveal from "./Reveal";

const REASONS = [
  {
    icon: ShieldCheck,
    title: "صيدلي معتمد على مدار الساعة",
    body: "الدكتور سالم أحمد فؤاد وفريقه من الصيادلة المرخصين متواجدون لخدمتكم ٢٤ ساعة، ٧ أيام في الأسبوع.",
  },
  {
    icon: BadgeCheck,
    title: "منتجات أصلية ١٠٠٪",
    body: "نتعامل حصريًا مع موزعين معتمدين لضمان أصالة كل دواء ومستحضر تجميل ومكمل غذائي يصل إليكم.",
  },
  {
    icon: Truck,
    title: "توصيل فاخر وسريع",
    body: "نوصل طلبك داخل مدينة أبو المطامير وضواحيها بعناية فائقة وسرية تامة، مباشرة إلى باب منزلك.",
  },
  {
    icon: HeartHandshake,
    title: "ثقة تمتد لأكثر من ١٥ عامًا",
    body: "خبرة صيدلانية طويلة ساهمت في بناء علاقة ثقة راسخة مع آلاف العملاء في أبو المطامير.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="py-20 sm:py-28 px-4 sm:px-6 bg-ivory">
      <div className="mx-auto max-w-6xl">
        <Reveal className="flex flex-col items-center text-center mb-14">
          <Seal className="w-12 h-12 mb-4" />
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy">لماذا تختار صيدلية الدكتور سالم؟</h2>
          <p className="text-navy/60 mt-3 max-w-lg">أسباب حقيقية جعلت أهالي أبو المطامير يثقون بنا على مدار سنين.</p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REASONS.map((r, i) => {
            const Icon = r.icon;
            return (
              <Reveal key={r.title} delay={i * 80}>
                <div className="h-full rounded-2xl bg-white border border-navy/5 shadow-[0_10px_30px_rgba(14,42,74,0.05)] hover:shadow-[0_18px_40px_rgba(14,42,74,0.1)] hover:-translate-y-1 transition-all duration-400 p-6">
                  <div className="w-11 h-11 rounded-full bg-emerald/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-emerald" />
                  </div>
                  <h3 className="font-display font-semibold text-navy text-base mb-2">{r.title}</h3>
                  <p className="text-sm text-navy/60 leading-relaxed">{r.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
