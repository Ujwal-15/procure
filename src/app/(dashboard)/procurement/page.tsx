"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { REQUESTS } from "@/lib/mock-data";
import { formatCurrency, formatDate, STATUS_CONFIG, DEPARTMENT_LABELS, DEPARTMENT_COLORS } from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import type { RequestStatus } from "@/types";

const STATUS_TABS: { label: string; value: RequestStatus | "all" }[] = [
  { label: "All",              value: "all"              },
  { label: "Pending Approval", value: "pending_approval" },
  { label: "Approved",         value: "approved"         },
  { label: "Ordered",          value: "ordered"          },
  { label: "Invoice Uploaded", value: "invoice_uploaded" },
  { label: "Closed",           value: "closed"           },
];

const STAGE_STEPS = ["Request", "Approve", "Order", "Receive", "Invoice"];

function getStageIndex(status: RequestStatus): number {
  const map: Record<RequestStatus, number> = {
    draft: 0, pending_approval: 0, approved: 1, rejected: 0,
    ordered: 2, advance_paid: 2, received: 3,
    invoice_uploaded: 4, partially_paid: 4, closed: 4,
  };
  return map[status] ?? 0;
}

export default function ProcurementPage() {
  const { currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<RequestStatus | "all">("all");

  const filtered      = activeTab === "all" ? REQUESTS : REQUESTS.filter(r => r.status === activeTab);
  const pendingCount  = REQUESTS.filter(r => r.status === "pending_approval").length;
  const canRaise      = currentUser.role === "requester";

  return (
    <div className="anim-fade">
      <Header
        title="Procurement Requests"
        subtitle={`${REQUESTS.length} requests`}
        action={canRaise ? { label: "New Request", href: "/procurement/new" } : undefined}
      />
      <div className="p-6 space-y-4">
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center gap-0.5 px-4 pt-3 border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="px-3 py-2 text-[12.5px] font-medium whitespace-nowrap transition-all"
                style={{
                  color: activeTab === tab.value ? "var(--primary)" : "var(--text-3)",
                  borderBottom: `2px solid ${activeTab === tab.value ? "var(--primary)" : "transparent"}`,
                  paddingBottom: 10,
                }}
              >
                {tab.label}
                {tab.value === "pending_approval" && pendingCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--warning)" }}>{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-[14px] font-semibold text-1">No requests here</p>
              <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Nothing in this status yet.</p>
            </div>
          ) : (
            <>
              <div className="tbl-head grid grid-cols-[2fr_1fr_1fr_160px] gap-4 px-5 py-2.5">
                {["Request", "Dept / Event", "Amount", "Pipeline"].map(h => <span key={h}>{h}</span>)}
              </div>
              <div>
                {filtered.map(req => {
                  const statusCfg    = STATUS_CONFIG[req.status];
                  const deptColor    = DEPARTMENT_COLORS[req.department];
                  const stageIdx     = getStageIndex(req.status);
                  const advancePaid  = req.advancePaid ?? 0;
                  const balance      = Math.max(0, req.estimatedTotal - advancePaid);

                  return (
                    <Link key={req.id} href={`/procurement/${req.id}`}
                      className="tbl-row grid grid-cols-[2fr_1fr_1fr_160px] gap-4 items-center px-5 py-3.5"
                    >
                      <div>
                        <span className="text-[11px] font-semibold font-mono" style={{ color: "var(--text-3)" }}>{req.requestNumber}</span>
                        <p className="text-[13px] font-semibold text-1 truncate mt-0.5">{req.items.map(i => i.name).join(", ")}</p>
                        <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-3)" }}>
                          By {req.requesterName} · {formatDate(req.createdAt)}
                        </p>
                      </div>
                      <div>
                        <Badge label={DEPARTMENT_LABELS[req.department]} color={deptColor.text} bg={deptColor.bg} size="sm" />
                        {req.eventName && (
                          <p className="text-[11px] mt-1 truncate" style={{ color: "var(--text-3)" }}>{req.eventName}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-1">{formatCurrency(req.estimatedTotal)}</p>
                        {advancePaid > 0 ? (
                          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                            Adv. {formatCurrency(advancePaid)} · Bal. {formatCurrency(balance)}
                          </p>
                        ) : (
                          <div className="mt-1">
                            <Badge label={statusCfg.label} color={statusCfg.color} bg={statusCfg.bg} size="sm" dot />
                          </div>
                        )}
                      </div>
                      {/* Mini pipeline */}
                      <div className="flex items-center gap-0.5">
                        {STAGE_STEPS.map((step, i) => (
                          <div key={step} className="flex items-center gap-0.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: i <= stageIdx ? "var(--primary)" : "var(--border)" }} />
                            {i < STAGE_STEPS.length - 1 && (
                              <div className="h-0.5 w-4" style={{ backgroundColor: i < stageIdx ? "var(--primary)" : "var(--border)" }} />
                            )}
                          </div>
                        ))}
                        <span className="ml-1.5 text-[10px] font-medium" style={{ color: "var(--text-3)" }}>
                          {STAGE_STEPS[Math.min(stageIdx, STAGE_STEPS.length - 1)]}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
