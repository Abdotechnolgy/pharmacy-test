"use client";

import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "حذف", danger = true, children }) {
  if (!open) return null;

  return (
    <div role="alertdialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[90] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-[fadeIn_0.2s_ease]">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-50 text-red-500" : "bg-emerald/10 text-emerald"}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="font-display font-bold text-navy mb-2">{title}</h3>
        <p className="text-sm text-navy/60 mb-4 leading-relaxed">{message}</p>
        {children && <div className="mb-4">{children}</div>}
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
              danger ? "bg-red-500 text-white hover:bg-red-600" : "bg-emerald text-ivory hover:bg-navy"
            }`}
          >
            {confirmLabel}
          </button>
          <button onClick={onCancel} className="flex-1 rounded-full bg-navy/5 text-navy py-2.5 text-sm font-semibold hover:bg-navy/10 transition-colors">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
