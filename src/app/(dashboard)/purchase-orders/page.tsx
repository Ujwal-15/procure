"use client";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { REQUESTS, VENDORS } from "@/lib/mock-data";
import { formatCurrency, formatDate, DEPARTMENT_LABELS, DEPARTMENT_COLORS } from "@/lib/utils";

const MOCK_POS = REQUESTS.filter(r =>
  ["ordered", "advance_paid", "received", "invoice_uploaded", "partially_paid", "closed"].includes(r.status)
).map((r, i) => ({
  ...r,
  poNumber: `PO-2025-00${38 - i}`,
  vendorName: VENDORS[i % VENDORS.length].name,
  vendorId: VENDORS[i % VENDORS.length].id,
  orderDate: r.createdAt,
  expectedDelivery: "2025-11-28",
  deliveryStatus: r.status === "received" || r.status === "invoice_uploaded" || r.status === "closed" ? "received" : "pending",
}));

const DELIVERY_CFG = {
  pending:  { label: "Pending Delivery", color: "#FF9F0A", bg: "#FFF8EC" },
  partial:  { label: "Partial",          color: "#0071E3", bg: "#E8F1FB" },
  received: { label: "Received",         color: "#34C759", bg: "#F0FAF3" },
  rejected: { label: "Rejected",         color: "#FF3B30", bg: "#FFF2F1" },
};

export default function PurchaseOrdersPage() {
  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Purchase Orders" subtitle={`${MOCK_POS.length} active orders`} />
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-[#F5F5F7]">
            {["PO / Request", "Vendor", "Department", "Amount", "Expected", "Delivery"].map(h => (
              <span key={h} className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-[#F5F5F7]">
            {MOCK_POS.map((po) => {
              const deptColor = DEPARTMENT_COLORS[po.department];
              const dlvCfg = DELIVERY_CFG[po.deliveryStatus as keyof typeof DELIVERY_CFG];
              return (
                <div key={po.id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 items-center px-5 py-4 hover:bg-[#F5F5F7] transition-colors">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1D1D1F] font-mono">{po.poNumber}</p>
                    <p className="text-[11.5px] text-[#8E8E93]">{po.requestNumber}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#1D1D1F]">{po.vendorName}</p>
                    <p className="text-[11.5px] text-[#8E8E93]">{po.eventName || "General"}</p>
                  </div>
                  <div>
                    <Badge label={DEPARTMENT_LABELS[po.department]} color={deptColor.text} bg={deptColor.bg} size="sm" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1D1D1F]">{formatCurrency(po.estimatedTotal)}</p>
                  </div>
                  <div>
                    <p className="text-[12.5px] text-[#636366]">{formatDate(po.expectedDelivery)}</p>
                  </div>
                  <div>
                    <Badge label={dlvCfg.label} color={dlvCfg.color} bg={dlvCfg.bg} size="sm" dot />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
