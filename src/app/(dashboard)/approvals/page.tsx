"use client";
import { useState } from "react";
import { CheckCircle2, XCircle, Clock, ChevronDown } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { APPROVALS } from "@/lib/mock-data";
import { formatCurrency, formatDate, URGENCY_CONFIG, DEPARTMENT_LABELS, DEPARTMENT_COLORS } from "@/lib/utils";
import type { Approval } from "@/types";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>(APPROVALS);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = approvals.filter(a => a.status === "pending");
  const handled = approvals.filter(a => a.status !== "pending");

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
    setRejectModal(null);
    setRejectReason("");
  };

  const ApprovalCard = ({ a }: { a: Approval }) => {
    const urgCfg = URGENCY_CONFIG[a.urgency];
    const deptColor = DEPARTMENT_COLORS[a.department];
    const isHandled = a.status !== "pending";

    return (
      <div className={`bg-white rounded-2xl border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all ${
        isHandled ? "border-[#E8E8ED] opacity-60" : "border-[#E8E8ED] hover:border-[#D2D2D7]"
      }`}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-[#AEAEB2] font-mono">{a.requestNumber}</span>
              <Badge label={DEPARTMENT_LABELS[a.department]} color={deptColor.text} bg={deptColor.bg} size="sm" />
              <Badge label={urgCfg.label} color={urgCfg.color} bg={urgCfg.bg} size="sm" />
            </div>
            <p className="text-[13.5px] font-semibold text-[#1D1D1F]">
              {a.items.map(i => i.name).join(", ")}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[12px] text-[#8E8E93]">
              <span>By {a.requesterName}</span>
              {a.eventName && <><span>·</span><span>{a.eventName}</span></>}
              <span>·</span>
              <span>{formatDate(a.createdAt)}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[20px] font-semibold text-[#1D1D1F]">{formatCurrency(a.estimatedTotal)}</p>
            {a.estimatedTotal > 15000 && (
              <p className="text-[11px] text-[#FF9F0A] font-medium mt-0.5">Above ₹15k threshold</p>
            )}
          </div>
        </div>

        {/* Items breakdown */}
        <div className="bg-[#F5F5F7] rounded-xl p-3 mb-4">
          {a.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[12px]">
              <span className="text-[#636366]">{item.qty}x {item.name}</span>
              <span className="font-medium text-[#1D1D1F]">{formatCurrency(item.qty * item.estimatedUnitPrice)}</span>
            </div>
          ))}
        </div>

        {/* Actions or status */}
        {!isHandled ? (
          <div className="flex gap-2.5">
            <button
              onClick={() => setRejectModal(a.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-medium text-[#FF3B30] border border-[#FF3B30]/20 bg-[#FFF2F1] rounded-xl hover:bg-[#FF3B30] hover:text-white transition-colors"
            >
              <XCircle size={14} /> Reject
            </button>
            <button
              onClick={() => handleApprove(a.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[13px] font-semibold text-white bg-[#1D1D1F] rounded-xl hover:bg-[#3A3A3C] transition-colors"
            >
              <CheckCircle2 size={14} /> Approve
            </button>
          </div>
        ) : (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium ${
            a.status === "approved"
              ? "bg-[#F0FAF3] text-[#34C759]"
              : "bg-[#FFF2F1] text-[#FF3B30]"
          }`}>
            {a.status === "approved" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {a.status === "approved" ? "Approved" : "Rejected"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Approvals" subtitle={`${pending.length} pending approval${pending.length !== 1 ? "s" : ""}`} />

      <div className="p-6 space-y-6">
        {/* Pending */}
        {pending.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-[#FF9F0A]" />
              <h2 className="text-[13px] font-semibold text-[#1D1D1F]">Needs Your Approval</h2>
              <span className="text-[11px] bg-[#FF9F0A] text-white rounded-full px-2 py-0.5 font-semibold">{pending.length}</span>
            </div>
            <div className="space-y-3">
              {pending.map(a => <ApprovalCard key={a.id} a={a} />)}
            </div>
          </section>
        )}

        {/* Handled */}
        {handled.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-[#8E8E93] mb-3">Previously Handled</h2>
            <div className="space-y-3">
              {handled.map(a => <ApprovalCard key={a.id} a={a} />)}
            </div>
          </section>
        )}

        {pending.length === 0 && handled.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle2 size={32} className="text-[#D2D2D7] mx-auto mb-3" />
            <p className="text-[14px] font-medium text-[#AEAEB2]">No approvals needed</p>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[slideUp_0.25s_ease-out]">
            <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-1">Reject Request</h2>
            <p className="text-[13px] text-[#636366] mb-4">Provide a reason so the requester knows what to fix.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Please get 2 competing quotes first..."
              rows={3}
              className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF3B30] placeholder:text-[#AEAEB2] resize-none mb-4"
            />
            <div className="flex gap-2.5">
              <button onClick={() => setRejectModal(null)} className="flex-1 py-2.5 text-[13px] font-medium text-[#636366] border border-[#E8E8ED] rounded-xl hover:bg-[#F5F5F7] transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectModal)}
                className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-[#FF3B30] rounded-xl hover:bg-[#E0352B] transition-colors"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
