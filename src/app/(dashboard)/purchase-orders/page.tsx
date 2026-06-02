"use client";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { REQUESTS, VENDORS } from "@/lib/mock-data";
import { formatCurrency, formatDate, DEPARTMENT_LABELS, DEPARTMENT_COLORS } from "@/lib/utils";

const ACTIVE_STATUSES = ["ordered", "advance_paid", "received", "invoice_uploaded", "partially_paid", "closed"];

const MOCK_POS = REQUESTS.filter(r => ACTIVE_STATUSES.includes(r.status)).map((r, i) => ({
  ...r,
  poNumber: `PO-${new Date().getFullYear()}-00${i + 1}`,
  vendorName: VENDORS[i % Math.max(VENDORS.length, 1)]?.name ?? "—",
  orderDate: r.createdAt,
  expectedDelivery: r.updatedAt,
  deliveryStatus: (
    r.status === "received" || r.status === "invoice_uploaded" || r.status === "closed" ? "received"
    : r.status === "advance_paid" ? "partial"
    : "pending"
  ) as "pending" | "partial" | "received",
  invoicedAmount: (
    r.status === "closed" ? r.estimatedTotal
    : r.status === "invoice_uploaded" || r.status === "received" ? Math.round(r.estimatedTotal * 0.65)
    : r.status === "advance_paid" ? Math.round(r.estimatedTotal * 0.30)
    : 0
  ),
}));

const DELIVERY_CFG = {
  pending:  { label: "Pending Delivery", color: "var(--warning)", bg: "var(--warning-bg)"   },
  partial:  { label: "Partial",          color: "var(--primary)", bg: "var(--primary-light)" },
  received: { label: "Received",         color: "var(--success)", bg: "var(--success-bg)"   },
  rejected: { label: "Rejected",         color: "var(--danger)",  bg: "var(--danger-bg)"    },
};

function ProgressBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  return (
    <div>
      <div className="flex items-end justify-between mb-1.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Invoiced</p>
          <p className="text-[13px] font-bold text-1">{formatCurrency(paid)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>PO Total</p>
          <p className="text-[13px] font-bold text-1">{formatCurrency(total)}</p>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? "linear-gradient(90deg, #10B981 0%, #34D399 100%)"
              : "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)",
          }}
        />
      </div>
    </div>
  );
}

export default function PurchaseOrdersPage() {
  return (
    <div className="anim-fade">
      <Header title="Purchase Orders" subtitle={MOCK_POS.length > 0 ? `${MOCK_POS.length} active orders` : "No orders yet"} />
      <div className="p-6 space-y-3">
        {MOCK_POS.length === 0 ? (
          <div className="card p-10 flex flex-col items-center text-center gap-3">
            <p className="text-[15px] font-semibold text-1">No purchase orders yet</p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
              Purchase orders are created once a procurement request is approved and ordered.
            </p>
          </div>
        ) : (
          MOCK_POS.map((po) => {
            const deptColor = DEPARTMENT_COLORS[po.department];
            const dlvCfg    = DELIVERY_CFG[po.deliveryStatus];
            return (
              <div key={po.id} className="card p-5">
                <div className="flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-[15px] font-bold text-1 font-mono">{po.poNumber}</span>
                      <Badge label={dlvCfg.label} color={dlvCfg.color} bg={dlvCfg.bg} size="sm" dot />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[13px]" style={{ color: "var(--text-2)" }}>{po.vendorName}</span>
                      <span style={{ color: "var(--text-3)" }}>·</span>
                      <Badge label={DEPARTMENT_LABELS[po.department]} color={deptColor.text} bg={deptColor.bg} size="sm" />
                    </div>
                    <div className="flex items-center gap-4 text-[12px]" style={{ color: "var(--text-3)" }}>
                      <span>Ordered {formatDate(po.orderDate)}</span>
                      <span>·</span>
                      <span>Expected {formatDate(po.expectedDelivery)}</span>
                    </div>
                  </div>
                  <div className="w-[260px] shrink-0">
                    <ProgressBar paid={po.invoicedAmount} total={po.estimatedTotal} />
                  </div>
                </div>

                {po.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <div className="flex flex-wrap gap-2">
                      {po.items.map((item, i) => (
                        <span key={i} className="text-[11.5px] px-2.5 py-1 rounded-lg" style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)" }}>
                          {item.qty}× {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
