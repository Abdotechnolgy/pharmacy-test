import Seal from "./Seal";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 bg-navy text-ivory relative overflow-hidden">
      <div
        className="absolute inset-0 -z-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle, #C9A24B 1px, transparent 1px)", backgroundSize: "26px 26px" }}
      />
      <Reveal className="mx-auto max-w-3xl relative text-center">
        <span className="inline-flex items-center gap-2 text-gold text-xs font-bold tracking-widest justify-center">
          <Seal className="w-6 h-6" />
          من نحن
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl mt-4 leading-relaxed">
          أفضل صيدلية في أبو المطامير — محافظة البحيرة
        </h2>
        <p className="mt-5 text-ivory/70 leading-loose text-sm sm:text-base">
          تُعد صيدلية الدكتور سالم أحمد فؤاد الوجهة الأولى لأهالي مدينة أبو المطامير وما حولها للحصول على
          الأدوية الأصلية، مستحضرات التجميل الفاخرة، والمكملات الغذائية عالية الجودة. نجمع بين خبرة صيدلانية
          تمتد لأكثر من خمسة عشر عامًا وبين معايير خدمة راقية، لنقدّم لكم تجربة صحية تليق بثقتكم.
        </p>
      </Reveal>
    </section>
  );
}
