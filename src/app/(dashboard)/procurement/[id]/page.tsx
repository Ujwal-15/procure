"use client";
import { use } from "react";
import { ArrowLeft, Package, CheckCircle2, Clock, User, Calendar, Tag, AlertCircle } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { REQUESTS, VENDORS } from "@/lib/mock-data";
import {
  formatCurrency, formatDate, STATUS_CONFIG, URGENCY_CONFIG,
  DEPARTMENT_LABELS, DEPARTMENT_COLORS
} from "@/lib/utils";

const TIMELINE_STEPS = [
  { key: "pending_approval",  label: "Submitted",       desc: "Request raised and submitted" },
  { key: "approved",          label: "Approved",        desc: "Management approved the request" },
  { key: "ordered",           label: "Order Placed",    desc: "Procurement placed the order" },
  { key: "advance_paid",      label: "Advance Paid",    desc: "Finance paid the advance" },
  { key: "received",          label: "Delivered",       desc: "Goods received and verified" },
  { key: "invoice_uploaded",  label: "Invoice Uploaded",desc: "Invoice logged in system" },
  { key: "closed",            label: "Paid & Closed",   desc: "Full payment completed" },
];

const STATUS_ORDER = [
  "draft","pending_approval","approved","rejected",
  "ordered","advance_paid","received","invoice_uploaded","partially_paid","closed"
];

export default function ProcurementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const req = REQUESTS.find(r => r.id === id) || REQUESTS[0];
  const statusIndex = STATUS_ORDER.indexOf(req.status);
  const deptColor = DEPARTMENT_COLORS[req.department];
  const statusCfg = STATUS_CONFIG[req.status];
  const urgCfg = URGENCY_CONFIG[req.urgency];

  const getTimelineStepStatus = (stepKey: string) => {
    const stepIndex = STATUS_ORDER.indexOf(stepKey);
    if (req.status === "rejected") return stepKey === "pending_approval" ? "done" : "skipped";
    if (stepIndex < statusIndex) return "done";
    if (stepIndex === statusIndex) return "active";
    return "pending";
  };

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title={req.requestNumber} subtitle="Procurement Request Detail" />
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Link href="/procurement" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#636366] hover:text-[#1D1D1F] transition-colors">
          <ArrowLeft size={14} /> Back to requests
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge label={DEPARTMENT_LABELS[req.department]} color={deptColor.text} bg={deptColor.bg} size="sm" />
                <Badge label={urgCfg.label} color={urgCfg.color} bg={urgCfg.bg} size="sm" />
                <Badge label={statusCfg.label} color={statusCfg.color} bg={statusCfg.bg} size="sm" dot />
              </div>
              <h2 className="text-[18px] font-semibold text-[#1D1D1F] leading-snug">
                {req.items.map(i => i.name).join(", ")}
              </h2>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wide mb-1">Est. Total</p>
              <p className="text-[28px] font-semibold text-[#1D1D1F] tracking-tight">{formatCurrency(req.estimatedTotal)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[#F5F5F7]">
            <div className="flex items-center gap-2">
              <User size={13} className="text-[#AEAEB2] shrink-0" />
              <div>
                <p className="text-[10.5px] text-[#8E8E93] font-medium uppercase tracking-wide">Requested By</p>
                <p className="text-[13px] font-semibold text-[#1D1D1F]">{req.requesterName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-[#AEAEB2] shrink-0" />
              <div>
                <p className="text-[10.5px] text-[#8E8E93] font-medium uppercase tracking-wide">Submitted</p>
                <p className="text-[13px] font-semibold text-[#1D1D1F]">{formatDate(req.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag size={13} className="text-[#AEAEB2] shrink-0" />
              <div>
                <p className="text-[10.5px] text-[#8E8E93] font-medium uppercase tracking-wide">Event</p>
                <p className="text-[13px] font-semibold text-[#1D1D1F]">{req.eventName || "General"}</p>
              </div>
            </div>
            {req.estimatedTotal > 15000 && (
              <div className="flex items-center gap-2">
                <AlertCircle size={13} className="text-[#FF9F0A] shrink-0" />
                <div>
                  <p className="text-[10.5px] text-[#8E8E93] font-medium uppercase tracking-wide">Approval</p>
                  <p className="text-[13px] font-semibold text-[#FF9F0A]">Required</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">Items</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-[2fr_80px_120px_120px] gap-3 pb-2 border-b border-[#F5F5F7]">
              {["Item", "Qty", "Unit Price", "Total"].map(h => (
                <span key={h} className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {req.items.map((item, i) => (
              <div key={i} className="grid grid-cols-[2fr_80px_120px_120px] gap-3 py-2.5 border-b border-[#F5F5F7] last:border-0">
                <span className="text-[13px] font-medium text-[#1D1D1F]">{item.name}</span>
                <span className="text-[13px] text-[#636366]">{item.qty} {item.unit}</span>
                <span className="text-[13px] text-[#636366]">{formatCurrency(item.estimatedUnitPrice)}</span>
                <span className="text-[13px] font-semibold text-[#1D1D1F]">{formatCurrency(item.qty * item.estimatedUnitPrice)}</span>
              </div>
            ))}
            <div className="grid grid-cols-[2fr_80px_120px_120px] gap-3 pt-2">
              <span className="col-span-3 text-[13px] font-semibold text-[#1D1D1F] text-right">Estimated Total</span>
              <span className="text-[15px] font-semibold text-[#1D1D1F]">{formatCurrency(req.estimatedTotal)}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-5">Procurement Timeline</h3>
          <div className="space-y-0">
            {TIMELINE_STEPS.map((step, i) => {
              const stepStatus = getTimelineStepStatus(step.key);
              const isLast = i === TIMELINE_STEPS.length - 1;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  {/* Line + dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                      stepStatus === "done"
                        ? "bg-[#34C759] border-[#34C759]"
                        : stepStatus === "active"
                        ? "bg-[#1D1D1F] border-[#1D1D1F]"
                        : "bg-white border-[#E8E8ED]"
                    }`}>
                      {stepStatus === "done" && <CheckCircle2 size={12} className="text-white" />}
                      {stepStatus === "active" && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 h-8 mt-1 transition-colors ${stepStatus === "done" ? "bg-[#34C759]" : "bg-[#E8E8ED]"}`} />
                    )}
                  </div>
                  {/* Text */}
                  <div className="pb-4">
                    <p className={`text-[13px] font-semibold leading-none mt-1 ${
                      stepStatus === "active" ? "text-[#1D1D1F]" : stepStatus === "done" ? "text-[#636366]" : "text-[#AEAEB2]"
                    }`}>
                      {step.label}
                      {stepStatus === "active" && (
                        <span className="ml-2 text-[10px] font-semibold bg-[#1D1D1F] text-white px-2 py-0.5 rounded-full">Current</span>
                      )}
                    </p>
                    <p className={`text-[12px] mt-0.5 ${stepStatus === "pending" ? "text-[#D2D2D7]" : "text-[#AEAEB2]"}`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {req.notes && (
          <div className="bg-[#FFF8EC] border border-[#FF9F0A]/15 rounded-2xl p-4">
            <p className="text-[12px] font-semibold text-[#FF9F0A] mb-1">Notes</p>
            <p className="text-[13px] text-[#636366]">{req.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
