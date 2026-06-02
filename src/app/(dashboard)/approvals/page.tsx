"use client";
import { useState } from "react";
import { CheckCircle2, XCircle, Clock, ChevronRight, Lock } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { APPROVALS } from "@/lib/mock-data";
import { formatCurrency, formatDate, DEPARTMENT_LABELS, DEPARTMENT_COLORS } from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import type { Approval } from "@/types";

function ApprovalRuleBanner() {
  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <span className="text-[13px] text-2">If</span>
        <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>request</span>
        <span className="text-[13px] text-3">exceeds</span>
        <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: "var(--warning-bg)", color: "var(--warning)" }}>₹15,000</span>
        <span className="text-[13px] text-3">→ requires approval:</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 p-3.5 rounded-xl border" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
              <span className="text-white text-[12px] font-bold">JI</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: "var(--warning)" }}>
              <Clock size={8} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-1">Jigar</p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Finance review</p>
          </div>
        </div>
        <div className="shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
          <ChevronRight size={14} style={{ color: "var(--primary)" }} />
        </div>
        <div className="flex-1 flex items-center gap-3 p-3.5 rounded-xl border" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}>
          <div className="flex gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>AL</div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 text-[10px] font-bold" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--text-2)" }}>SA</div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-1">Alok / Sanjeev</p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Final sign-off</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const { currentUser } = useCurrentUser();
  const [approvals, setApprovals] = useState<Approval[]>(APPROVALS);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const canApprove = currentUser.role === "management";
  const pending    = approvals.filter(a => a.status === "pending");
  const handled    = approvals.filter(a => a.status !== "pending");

  const handleApprove = (id: string) =>
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));
    setRejectModal(null);
    setRejectReason("");
  };

  const ApprovalCard = ({ a }: { a: Approval }) => {
    const deptColor      = DEPARTMENT_COLORS[a.department];
    const isHandled      = a.status !== "pending";
    const advancePaid    = a.advancePaid ?? 0;
    const balancePending = Math.max(0, a.estimatedTotal - advancePaid);

    return (
      <div className="card p-5" style={{ opacity: isHandled ? 0.6 : 1 }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono text-3">{a.requestNumber}</span>
              <Badge label={DEPARTMENT_LABELS[a.department]} color={deptColor.text} bg={deptColor.bg} size="sm" />
              {a.eventName && <span className="text-[11px]" style={{ color: "var(--text-3)" }}>{a.eventName}</span>}
            </div>
            <p className="text-[14px] font-semibold text-1 leading-snug">{a.items.map(i => i.name).join(", ")}</p>
            <p className="text-[12px] text-3 mt-1">By {a.requesterName} · {formatDate(a.createdAt)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[24px] font-bold text-1">{formatCurrency(a.estimatedTotal)}</p>
            {advancePaid > 0 && (
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>Bal. {formatCurrency(balancePending)}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: "var(--surface-2)" }}>
          {a.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[12px] py-0.5">
              <span className="text-3">{item.qty}× {item.name}</span>
              <span className="font-semibold text-1">{formatCurrency(item.qty * item.estimatedUnitPrice)}</span>
            </div>
          ))}
          {advancePaid > 0 && (
            <div className="flex items-center justify-between text-[12px] pt-2 mt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--success)" }}>Advance paid</span>
              <span className="font-semibold" style={{ color: "var(--success)" }}>{formatCurrency(advancePaid)}</span>
            </div>
          )}
        </div>

        {!isHandled ? (
          canApprove ? (
            <>
              <button onClick={() => handleApprove(a.id)} className="w-full btn-primary justify-center text-[13.5px] py-3 rounded-2xl">
                <CheckCircle2 size={15} /> Approve
              </button>
              <button
                onClick={() => setRejectModal(a.id)}
                className="w-full text-center text-[12px] mt-2 py-1.5 font-medium"
                style={{ color: "var(--text-3)" }}
              >
                Reject
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium" style={{ backgroundColor: "var(--surface-2)", color: "var(--text-3)" }}>
              <Lock size={13} /> Awaiting approval from Alok / Sanjeev
            </div>
          )
        ) : (
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium"
            style={{
              backgroundColor: a.status === "approved" ? "var(--success-bg)" : "var(--danger-bg)",
              color: a.status === "approved" ? "var(--success)" : "var(--danger)",
            }}
          >
            {a.status === "approved" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {a.status === "approved" ? "Approved" : "Rejected"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="anim-fade">
      <Header
        title="Approvals"
        subtitle={pending.length > 0 ? `${pending.length} pending` : "All clear"}
      />
      <div className="p-6">
        <ApprovalRuleBanner />

        {/* Role notice for non-management */}
        {!canApprove && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 border" style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}>
            <Lock size={13} style={{ color: "var(--text-3)" }} />
            <p className="text-[12.5px]" style={{ color: "var(--text-3)" }}>
              Viewing as <strong style={{ color: "var(--text-1)" }}>{currentUser.name}</strong> — only Alok or Sanjeev can approve or reject. Switch user to take action.
            </p>
          </div>
        )}

        {approvals.length === 0 ? (
          <div className="card p-10 flex flex-col items-center gap-3">
            <CheckCircle2 size={32} style={{ color: "var(--success)" }} />
            <p className="text-[15px] font-semibold text-1">Nothing to approve</p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Requests above ₹15,000 will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pending.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-[12px] font-semibold text-3 uppercase tracking-widest">Pending</h2>
                  <span className="text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--warning)" }}>{pending.length}</span>
                </div>
                <div className="space-y-3">{pending.map(a => <ApprovalCard key={a.id} a={a} />)}</div>
              </section>
            )}
            {handled.length > 0 && (
              <section>
                <h2 className="text-[12px] font-semibold text-3 uppercase tracking-widest mb-3">Handled</h2>
                <div className="space-y-3">{handled.map(a => <ApprovalCard key={a.id} a={a} />)}</div>
              </section>
            )}
          </div>
        )}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card anim-slide w-full max-w-sm p-6" style={{ boxShadow: "var(--modal-shadow)" }}>
            <h2 className="text-[16px] font-semibold text-1 mb-1">Reject Request</h2>
            <p className="text-[13px] text-3 mb-4">Give a reason so the requester can act on it.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Please get 2 competing quotes first…" rows={3} className="field resize-none mb-4" />
            <div className="flex gap-2.5">
              <button onClick={() => setRejectModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={() => handleReject(rejectModal)} className="flex-1 py-2.5 text-[13px] font-semibold text-white rounded-xl" style={{ backgroundColor: "var(--danger)" }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
