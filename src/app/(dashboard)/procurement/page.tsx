"use client";
import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { REQUESTS } from "@/lib/mock-data";
import { formatCurrency, formatDate, STATUS_CONFIG, URGENCY_CONFIG, DEPARTMENT_LABELS, DEPARTMENT_COLORS } from "@/lib/utils";
import type { RequestStatus } from "@/types";
import Link from "next/link";


const STATUS_TABS: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending Approval", value: "pending_approval" },
  { label: "Approved", value: "approved" },
  { label: "Ordered", value: "ordered" },
  { label: "Invoice Uploaded", value: "invoice_uploaded" },
  { label: "Closed", value: "closed" },
];

const STAGE_STEPS = ["Requested", "Approved", "Ordered", "Received", "Invoice", "Paid"];

function getStageIndex(status: RequestStatus): number {
  const map: Record<RequestStatus, number> = {
    draft: 0, pending_approval: 0, approved: 1, rejected: 0,
    ordered: 2, advance_paid: 2, received: 3,
    invoice_uploaded: 4, partially_paid: 4, closed: 5,
  };
  return map[status] ?? 0;
}

export default function ProcurementPage() {
  const [activeTab, setActiveTab] = useState<RequestStatus | "all">("all");
  const filtered = activeTab === "all" ? REQUESTS : REQUESTS.filter(r => r.status === activeTab);
  const pendingCount = REQUESTS.filter(r => r.status === "pending_approval").length;

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header
        title="Procurement Requests"
        subtitle={`${REQUESTS.length} total requests`}
        action={{ label: "New Request", href: "/procurement/new" }}
      />

      <div className="p-6 space-y-4">
        <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-5 pt-4 border-b border-[#F5F5F7] flex-wrap">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-2 text-[12.5px] font-medium rounded-lg mb-3 transition-all whitespace-nowrap ${
                  activeTab === tab.value
                    ? "bg-[#1D1D1F] text-white"
                    : "text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                }`}
              >
                {tab.label}
                {tab.value === "pending_approval" && pendingCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-[#FF9F0A] text-white rounded-full px-1.5 py-0.5">{pendingCount}</span>
                )}
              </button>
            ))}
            <div className="ml-auto mb-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors">
                <Filter size={13} /> Filter <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-[#F5F5F7]">
            {filtered.map(req => {
              const statusCfg = STATUS_CONFIG[req.status];
              const urgCfg = URGENCY_CONFIG[req.urgency];
              const deptColor = DEPARTMENT_COLORS[req.department];
              const stageIdx = getStageIndex(req.status);

              return (
                <Link key={req.id} href={`/procurement/${req.id}`} className="block px-5 py-4 hover:bg-[#F5F5F7]/60 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-[#AEAEB2] font-mono">{req.requestNumber}</span>
                        <Badge label={DEPARTMENT_LABELS[req.department]} color={deptColor.text} bg={deptColor.bg} size="sm" />
                        {req.urgency === "critical" || req.urgency === "high" ? (
                          <Badge label={urgCfg.label} color={urgCfg.color} bg={urgCfg.bg} size="sm" />
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[14px] font-semibold text-[#1D1D1F]">
                          {req.items.map(i => i.name).join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] text-[#8E8E93]">
                        <span>By {req.requesterName}</span>
                        <span>·</span>
                        <span>{req.eventName || "No event"}</span>
                        <span>·</span>
                        <span>{formatDate(req.createdAt)}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 flex items-center gap-1">
                        {STAGE_STEPS.map((step, i) => (
                          <div key={step} className="flex items-center gap-1">
                            <div className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full transition-colors ${
                                i <= stageIdx ? "bg-[#1D1D1F]" : "bg-[#E8E8ED]"
                              }`} />
                            </div>
                            {i < STAGE_STEPS.length - 1 && (
                              <div className={`h-0.5 w-8 transition-colors ${
                                i < stageIdx ? "bg-[#1D1D1F]" : "bg-[#E8E8ED]"
                              }`} />
                            )}
                          </div>
                        ))}
                        <span className="ml-2 text-[11px] text-[#8E8E93]">{STAGE_STEPS[stageIdx]}</span>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-right shrink-0">
                      <p className="text-[16px] font-semibold text-[#1D1D1F]">{formatCurrency(req.estimatedTotal)}</p>
                      <div className="mt-1.5">
                        <Badge label={statusCfg.label} color={statusCfg.color} bg={statusCfg.bg} size="sm" dot />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
