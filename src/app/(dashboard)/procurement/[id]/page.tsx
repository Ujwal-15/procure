"use client";
import { use } from "react";
import { ArrowLeft, CheckCircle2, User, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate, STATUS_CONFIG, DEPARTMENT_LABELS, DEPARTMENT_COLORS } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";

const TIMELINE_STEPS = [
  { key: "pending_approval",  label: "Submitted",        desc: "Request raised and submitted"    },
  { key: "approved",          label: "Approved",         desc: "Approved by Alok or Sanjeev"     },
  { key: "ordered",           label: "Order Placed",     desc: "Procurement placed the order"    },
  { key: "advance_paid",      label: "Advance Paid",     desc: "Finance paid the advance"        },
  { key: "received",          label: "Delivered",        desc: "Goods received and verified"     },
  { key: "invoice_uploaded",  label: "Invoice Uploaded", desc: "Invoice logged in system"        },
  { key: "closed",            label: "Paid & Closed",    desc: "Full payment completed"          },
];

const STATUS_ORDER = [
  "draft", "pending_approval", "approved", "rejected",
  "ordered", "advance_paid", "received", "invoice_uploaded", "partially_paid", "closed",
];

export default function ProcurementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { requests } = useData();
  const req = requests.find(r => r.id === id);

  if (!req) {
    return (
      <div className="anim-fade p-6">
        <Link href="/procurement" className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <p className="text-[14px] font-semibold text-1 mt-6">Request not found</p>
      </div>
    );
  }

  const statusIndex    = STATUS_ORDER.indexOf(req.status);
  const deptColor      = DEPARTMENT_COLORS[req.department];
  const statusCfg      = STATUS_CONFIG[req.status];
  const advancePaid    = req.advancePaid ?? 0;
  const balancePending = Math.max(0, req.estimatedTotal - advancePaid);

  const getStepStatus = (stepKey: string) => {
    const stepIndex = STATUS_ORDER.indexOf(stepKey);
    if (req.status === "rejected") return stepKey === "pending_approval" ? "done" : "skipped";
    if (stepIndex < statusIndex) return "done";
    if (stepIndex === statusIndex) return "active";
    return "pending";
  };

  return (
    <div className="anim-fade">
      <Header title={req.requestNumber} subtitle="Procurement Request" />
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Link href="/procurement" className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={14} /> Back to requests
        </Link>

        {/* Header card */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge label={DEPARTMENT_LABELS[req.department]} color={deptColor.text} bg={deptColor.bg} size="sm" />
                <Badge label={statusCfg.label} color={statusCfg.color} bg={statusCfg.bg} size="sm" dot />
              </div>
              <h2 className="text-[18px] font-semibold text-1 leading-snug">
                {req.items.map(i => i.name).join(", ")}
              </h2>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>Total</p>
              <p className="text-[28px] font-bold gradient-text tracking-tight">{formatCurrency(req.estimatedTotal)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
            {[
              { icon: User,     label: "Requested By", value: req.requesterName           },
              { icon: Calendar, label: "Submitted",     value: formatDate(req.createdAt)   },
              { icon: Tag,      label: "Event",         value: req.eventName || "General"  },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon size={13} style={{ color: "var(--text-3)" }} className="shrink-0" />
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{item.label}</p>
                  <p className="text-[13px] font-semibold text-1">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-1 mb-4">Items</h3>
          <div className="tbl-head grid grid-cols-[2fr_80px_120px_120px] gap-3 px-0 py-2" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", boxShadow: "none" }}>
            {["Item", "Qty", "Unit Price", "Total"].map(h => <span key={h}>{h}</span>)}
          </div>
          {req.items.map((item, i) => (
            <div key={i} className="grid grid-cols-[2fr_80px_120px_120px] gap-3 py-3 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
              <span className="text-[13px] font-medium text-1">{item.name}</span>
              <span className="text-[13px]" style={{ color: "var(--text-3)" }}>{item.qty} {item.unit}</span>
              <span className="text-[13px]" style={{ color: "var(--text-3)" }}>{formatCurrency(item.estimatedUnitPrice)}</span>
              <span className="text-[13px] font-semibold text-1">{formatCurrency(item.qty * item.estimatedUnitPrice)}</span>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: "var(--text-3)" }}>Estimated Total</span>
              <span className="text-[16px] font-bold gradient-text">{formatCurrency(req.estimatedTotal)}</span>
            </div>
            {advancePaid > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium" style={{ color: "var(--text-3)" }}>Advance Paid</span>
                  <span className="text-[14px] font-semibold" style={{ color: "var(--success)" }}>− {formatCurrency(advancePaid)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }}>
                  <span className="text-[13px] font-semibold text-1">Balance Pending</span>
                  <span className="text-[17px] font-bold" style={{ color: balancePending === 0 ? "var(--success)" : "var(--text-1)" }}>
                    {formatCurrency(balancePending)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pipeline */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-1 mb-5">Pipeline</h3>
          {TIMELINE_STEPS.map((step, i) => {
            const stepStatus = getStepStatus(step.key);
            const isLast = i === TIMELINE_STEPS.length - 1;
            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${stepStatus === "done" ? "step-done" : stepStatus === "active" ? "step-active" : "step-pending"}`}>
                    {stepStatus === "done" && <CheckCircle2 size={12} className="text-white" />}
                    {stepStatus === "active" && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }} />}
                  </div>
                  {!isLast && <div className={`w-0.5 h-8 mt-1 ${stepStatus === "done" ? "step-line-done" : "step-line-pending"}`} />}
                </div>
                <div className="pb-4">
                  <p className="text-[13px] font-semibold leading-none mt-1"
                    style={{ color: stepStatus === "active" ? "var(--primary)" : stepStatus === "done" ? "var(--text-2)" : "var(--text-3)" }}
                  >
                    {step.label}
                    {stepStatus === "active" && (
                      <span className="ml-2 text-[10px] font-bold text-white px-2 py-0.5 rounded-full gradient-primary">Current</span>
                    )}
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {req.notes && (
          <div className="rounded-xl p-4 border" style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}>
            <p className="text-[12px] font-semibold mb-1 text-1">Notes</p>
            <p className="text-[13px]" style={{ color: "var(--text-2)" }}>{req.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
