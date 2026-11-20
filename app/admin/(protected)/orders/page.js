"use client";

import { useEffect, useState } from "react";
import { Package, Phone, MapPin, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useToast } from "../../../../components/admin/Toast";
import { adminFetch } from "../../../../lib/adminFetch";

const STATUSES = ["pending", "confirmed", "processing", "completed", "cancelled"];
const STATUS_LABELS = { pending: "قيد الانتظار", confirmed: "مؤكد", processing: "قيد التجهيز", completed: "تم التسليم", cancelled: "ملغي" };
const STATUS_STYLES = {
  pending: "bg-gold/10 text-gold",
  confirmed: "bg-emerald/10 text-emerald",
  processing: "bg-blue-50 text-blue-500",
  completed: "bg-emerald/15 text-emerald",
  cancelled: "bg-red-50 text-red-500",
};

export default function AdminOrdersPage() {
  const { show } = useToast();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/orders")
      .then(setOrders)
      .catch((err) => show(err.message || "حصل خطأ أثناء تحميل الطلبات", "error"))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (order) => {
    if (expanded === order.id) {
      setExpanded(null);
      return;
    }
    setExpanded(order.id);
    if (!items[order.id]) {
      try {
        const full = await adminFetch(`/api/orders/${order.id}`);
        setItems((prev) => ({ ...prev, [order.id]: full.items || [] }));
      } catch (err) {
        show(err.message || "حصل خطأ أثناء تحميل تفاصيل الطلب", "error");
      }
    }
  };

  const changeStatus = async (order, status) => {
    try {
      await adminFetch(`/api/orders/${order.id}`, { method: "PUT", body: JSON.stringify({ status }) });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      show("تم تحديث حالة الطلب", "success");
    } catch (err) {
      show(err.message || "حصل خطأ أثناء التحديث", "error");
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-navy text-xl">الطلبات</h1>
        <p className="text-xs text-navy/50 mt-1">{orders.length} طلب</p>
      </div>

      {loading ? (
        <p className="text-center text-navy/40 py-16 text-sm">جاري التحميل...</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">
          <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-navy/30" />
          مفيش طلبات لسه.
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-white border border-navy/10 overflow-hidden">
              <button onClick={() => toggleExpand(order)} className="w-full flex items-center justify-between gap-3 p-4 text-right">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-navy text-sm">طلب #{order.id}</span>
                    <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${STATUS_STYLES[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-navy/50 mt-1 truncate">{order.customerName} — {order.customerPhone}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-display font-bold text-emerald text-sm">{order.total} ج.م</span>
                  {expanded === order.id ? <ChevronUp className="w-4 h-4 text-navy/40" /> : <ChevronDown className="w-4 h-4 text-navy/40" />}
                </div>
              </button>

              {expanded === order.id && (
                <div className="border-t border-navy/5 p-4 grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <p className="flex items-center gap-2 text-navy/70">
                      <Phone className="w-4 h-4 text-emerald shrink-0" />
                      {order.customerPhone}
                    </p>
                    <p className="flex items-center gap-2 text-navy/70">
                      <MapPin className="w-4 h-4 text-emerald shrink-0" />
                      {order.customerAddress}
                    </p>
                  </div>
                  {order.notes && <p className="text-sm text-navy/60 bg-navy/[0.03] rounded-xl p-3">ملاحظات: {order.notes}</p>}

                  <div className="grid gap-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-navy/50">
                      <Package className="w-3.5 h-3.5" />
                      المنتجات
                    </p>
                    {(items[order.id] || []).map((it) => (
                      <div key={it.id} className="flex justify-between text-sm text-navy/70">
                        <span>{it.productName} × {it.quantity}</span>
                        <span>{it.price * it.quantity} ج.م</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-navy/5">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => changeStatus(order, s)}
                        disabled={order.status === s}
                        className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors ${
                          order.status === s ? "bg-navy text-ivory border-navy" : "bg-white text-navy/60 border-navy/10 hover:border-emerald/40"
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
