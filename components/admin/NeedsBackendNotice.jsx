import { DatabaseZap } from "lucide-react";

export default function NeedsBackendNotice({ title, description, points = [] }) {
  return (
    <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
        <DatabaseZap className="w-6 h-6 text-gold" />
      </div>
      <h3 className="font-display font-bold text-navy mb-2">{title}</h3>
      <p className="text-sm text-navy/60 max-w-md mx-auto leading-relaxed mb-4">{description}</p>
      {points.length > 0 && (
        <ul className="text-xs text-navy/50 max-w-sm mx-auto text-right list-disc pr-5 space-y-1.5">
          {points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
