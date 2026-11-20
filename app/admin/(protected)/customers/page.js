"use client";

import { useEffect, useState } from "react";
import { Phone, MapPin, ChevronDown, ChevronUp, Users, ShoppingBag } from "lucide-react";
import { useToast } from "../../../../components/admin/Toast";
import { adminFetch } from "../../../../lib/adminFetch";

export default function AdminCustomersPage() {
  const { show } = useToast();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/customers")
      .then(setCustomers)
      .catch((err) => show(err.message || "حصل خطأ أثناء تحميل العملاء", "error"))
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = async (customer) => {
    if (expanded === customer.id) {
      setExpanded(null);
      return;
    }
    setExpanded(customer.id);
    if (!orders[customer.id]) {
      try {
        const full = await adminFetch(`/api/customers/${customer.id}`);
        setOrders((prev) => ({ ...prev, [customer.id]: full.orders || [] }));
      } catch (err) {
        show(err.message || "حصل خطأ أثناء تحميل طلبات العميل", "error");
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-display font-bold text-navy text-xl">العملاء</h1>
        <p className="text-xs text-navy/50 mt-1">{customers.length} عميل — بينضافوا تلقائيًا مع أول طلب</p>
      </div>

      {loading ? (
        <p className="text-center text-navy/40 py-16 text-sm">جاري التحميل...</p>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-navy/10 border-dashed p-10 text-center text-navy/50 text-sm">
          <Users className="w-8 h-8 mx-auto mb-2 text-navy/30" />
          مفيش عملاء لسه.
        </div>
      ) : (
        <div className="grid gap-3">
          {customers.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white border border-navy/10 overflow-hidden">
              <button onClick={() => toggleExpand(c)} className="w-full flex items-center justify-between gap-3 p-4 text-right">
                <div className="min-w-0">
                  <span className="font-semibold text-navy text-sm">{c.name}</span>
                  <p className="text-xs text-navy/50 mt-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    {c.phone}
                  </p>
                </div>
                {expanded === c.id ? <ChevronUp className="w-4 h-4 text-navy/40 shrink-0" /> : <ChevronDown className="w-4 h-4 text-navy/40 shrink-0" />}
              </button>

              {expanded === c.id && (
                <div className="border-t border-navy/5 p-4 grid gap-3">
                  {c.address && (
                    <p className="flex items-center gap-2 text-sm text-navy/70">
                      <MapPin className="w-4 h-4 text-emerald shrink-0" />
                      {c.address}
                    </p>
                  )}
                  <div className="grid gap-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-navy/50">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      الطلبات ({(orders[c.id] || []).length})
                    </p>
                    {(orders[c.id] || []).map((o) => (
                      <div key={o.id} className="flex justify-between text-sm text-navy/70 bg-navy/[0.02] rounded-lg px-3 py-2">
                        <span>طلب #{o.id}</span>
                        <span>{o.total} ج.م</span>
                      </div>
                    ))}
                    {(orders[c.id] || []).length === 0 && <p className="text-xs text-navy/40">مفيش طلبات بعد.</p>}
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
