import { Lock } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, unavailable = false, hint }) {
  if (unavailable) {
    return (
      <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-navy/30" />
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-navy/40 bg-navy/5 rounded-full px-2 py-1">
            <Lock className="w-3 h-3" />
            يحتاج قاعدة بيانات
          </span>
        </div>
        <p className="text-navy/40 text-sm font-semibold">{label}</p>
        {hint && <p className="text-navy/30 text-[11px] mt-1 leading-relaxed">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-navy/10 p-5 shadow-[0_10px_30px_rgba(14,42,74,0.05)]">
      <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-emerald" />
      </div>
      <p className="font-display font-extrabold text-2xl text-navy">{value}</p>
      <p className="text-navy/50 text-sm font-semibold mt-1">{label}</p>
    </div>
  );
}
