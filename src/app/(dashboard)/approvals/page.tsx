"use client";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate, PROCUREMENT_STATUS_CONFIG } from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";

export default function ApprovalsPage() {
  const { currentUser } = useCurrentUser();
  const { requests, loading } = useData();

  const pending = requests.filter(r => r.status === "pending_approval");

  return (
    <div className="anim-fade">
      <Header title="Approvals" subtitle={pending.length > 0 ? `${pending.length} pending` : "All clear"} />
      <div className="p-4 md:p-6 space-y-4">

        {loading ? (
          <div className="card p-10 flex items-center justify-center">
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Loading…</p>
          </div>
        ) : pending.length === 0 ? (
          <div className="card p-10 flex flex-col items-center gap-3">
            <p className="text-[15px] font-semibold text-1">No pending approvals</p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>All caught up!</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="tbl-head grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 px-5 py-2.5">
              {["Procurement", "Category", "Amount", "Submitted By", "Action"].map(h => <span key={h}>{h}</span>)}
            </div>
            {pending.map(req => {
              const cfg = PROCUREMENT_STATUS_CONFIG[req.status];
              return (
                <div key={req.id} className="tbl-row grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 items-center px-5 py-3.5">
                  <div>
                    <span className="text-[10.5px] font-mono" style={{ color: "var(--text-3)" }}>{req.requestNumber}</span>
                    <p className="text-[13px] font-semibold text-1 truncate">{req.title}</p>
                    {req.projectName && <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{req.projectName}</p>}
                  </div>
                  <p className="text-[12.5px] text-2">{req.category}</p>
                  <p className="text-[13px] font-semibold text-1">{formatCurrency(req.totalAmount)}</p>
                  <div>
                    <p className="text-[12.5px] text-1">{req.requesterName}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{formatDate(req.createdAt)}</p>
                  </div>
                  <Link
                    href={`/procurement/${req.id}`}
                    className="btn-primary text-[12px] py-2 px-3 justify-center"
                  >
                    Review →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
