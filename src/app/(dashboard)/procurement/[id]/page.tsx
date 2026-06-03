"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Ban,
  CreditCard, Clock, FileText, Mail,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import {
  formatCurrency, formatDate,
  PROCUREMENT_STATUS_CONFIG, PAYMENT_STATUS_CONFIG,
  canApprove, canUpdatePayment, PAYMENT_MODES,
} from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";
import { supabase } from "@/lib/supabase";
import { emailApproved, emailRejected, emailPaymentComplete } from "@/lib/email";
import { USERS } from "@/lib/mock-data";
import type { PaymentStatus, EmailLog } from "@/types";

type Tab = "details" | "payment_history" | "audit" | "email";

/* ── Payment update modal ──────────────────────────────────────────────── */
interface PaymentModalProps {
  procurementId: string;
  currentStatus: PaymentStatus;
  currentAmountPaid: number;
  totalAmount: number;
  onClose: () => void;
  onSave: (opts: {
    paymentStatus: PaymentStatus;
    amountPaid: number;
    paymentDate: string;
    paymentMode: string;
    transactionRef: string;
    notes: string;
  }) => Promise<void>;
}

function PaymentModal({
  currentStatus, currentAmountPaid, totalAmount, onClose, onSave,
}: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(currentStatus);
  const [amountPaid, setAmountPaid]       = useState(String(currentAmountPaid));
  const [paymentDate, setPaymentDate]     = useState(new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode]     = useState("neft");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes]                 = useState("");
  const [saving, setSaving]               = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        paymentStatus,
        amountPaid: parseFloat(amountPaid) || 0,
        paymentDate,
        paymentMode,
        transactionRef,
        notes,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const STATUSES: { value: PaymentStatus; label: string }[] = [
    { value: "unpaid",         label: "Unpaid"          },
    { value: "advance_paid",   label: "Advance Paid"    },
    { value: "partially_paid", label: "Partially Paid"  },
    { value: "fully_paid",     label: "Fully Paid"      },
    { value: "on_hold",        label: "On Hold"         },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card w-full max-w-md p-6 space-y-4"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-1">Update Payment</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--text-3)" }}
          >
            <XCircle size={15} />
          </button>
        </div>

        <div className="text-[12px] font-medium px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)" }}>
          Total: {formatCurrency(totalAmount)} · Previously paid: {formatCurrency(currentAmountPaid)}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-3 uppercase tracking-wide block mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
              className="field w-full text-[13px]"
            >
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-3 uppercase tracking-wide block mb-1">Amount Paid (₹)</label>
            <input
              type="number"
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              className="field w-full text-[13px]"
              placeholder="0"
              min="0"
              max={totalAmount}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-3 uppercase tracking-wide block mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="field w-full text-[13px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-3 uppercase tracking-wide block mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
                className="field w-full text-[13px]"
              >
                {PAYMENT_MODES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-3 uppercase tracking-wide block mb-1">Transaction Ref</label>
            <input
              type="text"
              value={transactionRef}
              onChange={e => setTransactionRef(e.target.value)}
              className="field w-full text-[13px]"
              placeholder="UTR / Ref number"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-3 uppercase tracking-wide block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="field w-full text-[13px] resize-none"
              rows={2}
              placeholder="Optional notes…"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-ghost text-[13px]">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-[13px]">
            {saving ? "Saving…" : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Reject modal ──────────────────────────────────────────────────────── */
function RejectModal({
  onClose,
  onReject,
}: {
  onClose: () => void;
  onReject: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!reason.trim()) return;
    setSaving(true);
    try {
      await onReject(reason.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card w-full max-w-sm p-6 space-y-4" style={{ backgroundColor: "var(--surface)" }}>
        <h3 className="text-[15px] font-semibold text-1">Reject Procurement</h3>
        <div>
          <label className="text-[11px] font-semibold text-3 uppercase tracking-wide block mb-1">Reason for rejection</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="field w-full text-[13px] resize-none"
            rows={3}
            placeholder="Provide a clear reason…"
            autoFocus
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="btn-ghost text-[13px]">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || saving}
            className="text-[13px] font-semibold px-4 py-1.5 rounded-xl transition-colors disabled:opacity-40"
            style={{ backgroundColor: "var(--danger)", color: "#fff" }}
          >
            {saving ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
export default function ProcurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser } = useCurrentUser();
  const {
    requests, paymentLogs, auditLogs,
    approveProcurement, rejectProcurement, cancelProcurement, updatePayment,
  } = useData();

  const [activeTab, setActiveTab]       = useState<Tab>("details");
  const [showPaymentModal, setShowPay]  = useState(false);
  const [showRejectModal, setShowRej]   = useState(false);
  const [actionBusy, setActionBusy]     = useState(false);
  const [emailLogs, setEmailLogs]       = useState<EmailLog[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);

  const req        = requests.find(r => r.id === id);
  const reqPayLogs = paymentLogs.filter(l => l.procurementId === id);
  const reqAudit   = auditLogs.filter(l => l.procurementId === id);

  useEffect(() => {
    if (activeTab === "email" && supabase) {
      setEmailLoading(true);
      supabase
        .from("email_log")
        .select("*")
        .eq("procurement_id", id)
        .order("sent_at", { ascending: false })
        .then(({ data }) => {
          if (data) {
            setEmailLogs(
              data.map(r => ({
                id:             String(r.id),
                recipientEmail: String(r.recipient_email),
                recipientName:  String(r.recipient_name),
                subject:        String(r.subject),
                emailType:      String(r.email_type),
                procurementId:  r.procurement_id ?? undefined,
                sentAt:         String(r.sent_at).slice(0, 16),
                sentBy:         r.sent_by ?? undefined,
              })) as EmailLog[]
            );
          }
          setEmailLoading(false);
        });
    }
  }, [activeTab, id]);

  if (!req) {
    return (
      <div className="anim-fade p-6">
        <Link
          href="/procurement"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: "var(--text-3)" }}
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <p className="text-[14px] font-semibold text-1 mt-6">Request not found.</p>
      </div>
    );
  }

  // req is guaranteed non-null here (early return above handles undefined)
  const safeReq = req;

  const pCfg  = PROCUREMENT_STATUS_CONFIG[safeReq.status];
  const pmCfg = PAYMENT_STATUS_CONFIG[safeReq.paymentStatus];
  const canApproveRole   = canApprove(currentUser.role);
  const canPayRole       = canUpdatePayment(currentUser.role);
  const canCancel        = canApproveRole && safeReq.status !== "completed" && safeReq.status !== "cancelled";
  const isPendingApproval = safeReq.status === "pending_approval";

  async function handleApprove() {
    setActionBusy(true);
    try {
      await approveProcurement(id, currentUser.name, currentUser.id);
      const requester = USERS.find(u => u.id === safeReq.requesterId);
      if (requester?.email) {
        await emailApproved({
          id,
          title: safeReq.title,
          approvedBy: currentUser.name,
          requester: { email: requester.email, name: requester.name },
        });
      }
    } finally {
      setActionBusy(false);
    }
  }

  async function handleReject(reason: string) {
    await rejectProcurement(id, reason, currentUser.name, currentUser.id);
    const requester = USERS.find(u => u.id === safeReq.requesterId);
    if (requester?.email) {
      await emailRejected({
        id,
        title: safeReq.title,
        rejectedBy: currentUser.name,
        reason,
        requester: { email: requester.email, name: requester.name },
      });
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel this procurement?")) return;
    setActionBusy(true);
    try {
      await cancelProcurement(id, currentUser.name, currentUser.id);
    } finally {
      setActionBusy(false);
    }
  }

  async function handlePaymentSave(opts: {
    paymentStatus: PaymentStatus;
    amountPaid: number;
    paymentDate: string;
    paymentMode: string;
    transactionRef: string;
    notes: string;
  }) {
    await updatePayment({
      procurementId:  id,
      paymentStatus:  opts.paymentStatus,
      amountPaid:     opts.amountPaid,
      paymentDate:    opts.paymentDate,
      paymentMode:    opts.paymentMode,
      transactionRef: opts.transactionRef,
      notes:          opts.notes,
      loggedById:     currentUser.id,
      loggedByName:   currentUser.name,
    });
    if (opts.paymentStatus === "fully_paid") {
      const recipients = USERS
        .filter(u => u.role === "finance" || u.role === "management" || u.id === safeReq.requesterId)
        .map(u => ({ email: u.email, name: u.name }));
      await emailPaymentComplete({
        id,
        title:          safeReq.title,
        totalAmount:    safeReq.totalAmount,
        paymentDate:    opts.paymentDate,
        paymentMode:    opts.paymentMode,
        transactionRef: opts.transactionRef,
        recipients,
      });
    }
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "details",         label: "Details",         icon: <FileText size={13} />     },
    { key: "payment_history", label: "Payment History", icon: <CreditCard size={13} />   },
    { key: "audit",           label: "Audit Trail",     icon: <Clock size={13} />         },
    { key: "email",           label: "Email History",   icon: <Mail size={13} />          },
  ];

  return (
    <div className="anim-fade">
      <Header title={safeReq.requestNumber} subtitle={safeReq.title} />

      <div className="p-6 max-w-4xl mx-auto space-y-5">
        {/* Back */}
        <Link
          href="/procurement"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium"
          style={{ color: "var(--text-3)" }}
        >
          <ArrowLeft size={14} /> Back to Procurements
        </Link>

        {/* Header card */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge label={pCfg.label} color={pCfg.color} bg={pCfg.bg} size="sm" dot />
                <Badge label={pmCfg.label} color={pmCfg.color} bg={pmCfg.bg} size="sm" />
              </div>
              <h2 className="text-[20px] font-semibold text-1 leading-snug">{safeReq.title}</h2>
              <p className="text-[13px] mt-1" style={{ color: "var(--text-3)" }}>
                {safeReq.requestNumber} · {safeReq.category}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>Total Amount</p>
              <p className="text-[28px] font-bold gradient-text tracking-tight">{formatCurrency(safeReq.totalAmount)}</p>
              {safeReq.amountPaid > 0 && (
                <p className="text-[12px] mt-0.5" style={{ color: "var(--success)" }}>
                  {formatCurrency(safeReq.amountPaid)} paid
                </p>
              )}
            </div>
          </div>

          {/* Action bar */}
          {(canApproveRole || canPayRole || canCancel) && (
            <div
              className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              {canApproveRole && isPendingApproval && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={actionBusy}
                    className="btn-primary text-[13px] flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    {actionBusy ? "Approving…" : "Approve"}
                  </button>
                  <button
                    onClick={() => setShowRej(true)}
                    disabled={actionBusy}
                    className="text-[13px] font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                    style={{ backgroundColor: "var(--danger-bg)", color: "var(--danger)" }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </>
              )}
              {canPayRole && safeReq.status !== "cancelled" && safeReq.status !== "rejected" && (
                <button
                  onClick={() => setShowPay(true)}
                  className="text-[13px] font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                  style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}
                >
                  <CreditCard size={14} /> Update Payment
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={actionBusy}
                  className="text-[13px] font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--text-3)" }}
                >
                  <Ban size={14} /> Cancel
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rejection alert */}
        {safeReq.status === "rejected" && safeReq.rejectionReason && (
          <div
            className="flex items-start gap-3 rounded-xl p-4"
            style={{ backgroundColor: "var(--danger-bg)", border: "1px solid var(--danger)" }}
          >
            <AlertTriangle size={16} style={{ color: "var(--danger)" }} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "var(--danger)" }}>Rejected</p>
              <p className="text-[13px] mt-0.5" style={{ color: "var(--danger)" }}>{safeReq.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="card p-0 overflow-hidden">
          <div
            className="flex items-center gap-0 border-b overflow-x-auto"
            style={{ borderColor: "var(--border)" }}
          >
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-3 text-[12.5px] font-medium whitespace-nowrap transition-all"
                style={{
                  color: activeTab === tab.key ? "var(--primary)" : "var(--text-3)",
                  borderBottom: `2px solid ${activeTab === tab.key ? "var(--primary)" : "transparent"}`,
                  paddingBottom: 11,
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Details tab ── */}
          {activeTab === "details" && (
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                {[
                  { label: "Category",          value: safeReq.category                        },
                  { label: "Vendor",             value: safeReq.vendorName || "—"               },
                  { label: "Project / Event",    value: safeReq.projectName || "—"              },
                  { label: "Quantity",           value: safeReq.quantity ? String(safeReq.quantity) : "—" },
                  { label: "Payment Terms",      value: safeReq.paymentTerms || "—"             },
                  { label: "Due Date",           value: safeReq.paymentDueDate ? formatDate(safeReq.paymentDueDate) : "—" },
                  { label: "Expected Delivery",  value: safeReq.expectedDelivery ? formatDate(safeReq.expectedDelivery) : "—" },
                  { label: "Submitted By",       value: safeReq.requesterName                   },
                  { label: "Date Submitted",     value: formatDate(safeReq.createdAt)           },
                  { label: "Last Updated",       value: formatDate(safeReq.updatedAt)           },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-3)" }}>
                      {item.label}
                    </p>
                    <p className="text-[13.5px] font-medium text-1">{item.value}</p>
                  </div>
                ))}
              </div>

              {safeReq.description && (
                <div
                  className="mt-5 pt-5 border-t"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--text-3)" }}>
                    Description
                  </p>
                  <p className="text-[13.5px]" style={{ color: "var(--text-2)" }}>{safeReq.description}</p>
                </div>
              )}

              {safeReq.notes && (
                <div
                  className="mt-4 rounded-xl p-3.5"
                  style={{ backgroundColor: "var(--surface-2)" }}
                >
                  <p className="text-[11px] font-semibold mb-1 text-3">Notes</p>
                  <p className="text-[13px]" style={{ color: "var(--text-2)" }}>{safeReq.notes}</p>
                </div>
              )}

              {/* Payment summary */}
              <div
                className="mt-5 pt-5 border-t grid grid-cols-3 gap-4"
                style={{ borderColor: "var(--border)" }}
              >
                {[
                  { label: "Total Amount",  value: formatCurrency(safeReq.totalAmount),                              color: "var(--text-1)" },
                  { label: "Amount Paid",   value: formatCurrency(safeReq.amountPaid),                               color: "var(--success)" },
                  { label: "Outstanding",   value: formatCurrency(Math.max(0, safeReq.totalAmount - safeReq.amountPaid)), color: "var(--warning)" },
                ].map(s => (
                  <div
                    key={s.label}
                    className="rounded-xl p-3.5"
                    style={{ backgroundColor: "var(--surface-2)" }}
                  >
                    <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>
                      {s.label}
                    </p>
                    <p className="text-[16px] font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Payment History tab ── */}
          {activeTab === "payment_history" && (
            <>
              {reqPayLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <CreditCard size={24} style={{ color: "var(--text-3)" }} />
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No payment logs yet</p>
                </div>
              ) : (
                <>
                  <div className="tbl-head grid grid-cols-[1fr_100px_100px_100px_100px_120px] gap-4 px-5 py-2.5">
                    {["Status", "Amount", "Date", "Mode", "Ref", "Logged By"].map(h => (
                      <span key={h}>{h}</span>
                    ))}
                  </div>
                  {reqPayLogs.map(log => {
                    const cfg = PAYMENT_STATUS_CONFIG[log.paymentStatus];
                    return (
                      <div
                        key={log.id}
                        className="tbl-row grid grid-cols-[1fr_100px_100px_100px_100px_120px] gap-4 items-center px-5 py-3"
                      >
                        <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size="sm" />
                        <p className="text-[13px] font-semibold text-1">{formatCurrency(log.amountPaid)}</p>
                        <p className="text-[12px]" style={{ color: "var(--text-3)" }}>{formatDate(log.paymentDate)}</p>
                        <p className="text-[12px]" style={{ color: "var(--text-2)" }}>{log.paymentMode?.toUpperCase() || "—"}</p>
                        <p className="text-[12px] font-mono truncate" style={{ color: "var(--text-3)" }}>{log.transactionRef || "—"}</p>
                        <p className="text-[12px]" style={{ color: "var(--text-3)" }}>{log.loggedByName}</p>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}

          {/* ── Audit Trail tab ── */}
          {activeTab === "audit" && (
            <>
              {reqAudit.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <Clock size={24} style={{ color: "var(--text-3)" }} />
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No audit logs yet</p>
                </div>
              ) : (
                <>
                  <div className="tbl-head grid grid-cols-[2fr_1fr_140px] gap-4 px-5 py-2.5">
                    {["Action", "By", "When"].map(h => <span key={h}>{h}</span>)}
                  </div>
                  {reqAudit.map(log => (
                    <div
                      key={log.id}
                      className="tbl-row grid grid-cols-[2fr_1fr_140px] gap-4 items-center px-5 py-3"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-1">{log.action}</p>
                        {log.details && (
                          <p className="text-[11px] mt-0.5 font-mono" style={{ color: "var(--text-3)" }}>
                            {JSON.stringify(log.details).slice(0, 80)}
                          </p>
                        )}
                      </div>
                      <p className="text-[12.5px]" style={{ color: "var(--text-2)" }}>{log.userName}</p>
                      <p className="text-[11.5px]" style={{ color: "var(--text-3)" }}>{log.createdAt}</p>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {/* ── Email History tab ── */}
          {activeTab === "email" && (
            <>
              {emailLoading ? (
                <div className="flex items-center justify-center py-14">
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Loading…</p>
                </div>
              ) : emailLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <Mail size={24} style={{ color: "var(--text-3)" }} />
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No emails sent for this procurement</p>
                </div>
              ) : (
                <>
                  <div className="tbl-head grid grid-cols-[2fr_1.5fr_1fr_120px] gap-4 px-5 py-2.5">
                    {["Subject", "Recipient", "Type", "Sent At"].map(h => <span key={h}>{h}</span>)}
                  </div>
                  {emailLogs.map(log => (
                    <div
                      key={log.id}
                      className="tbl-row grid grid-cols-[2fr_1.5fr_1fr_120px] gap-4 items-center px-5 py-3"
                    >
                      <p className="text-[13px] font-medium text-1 truncate">{log.subject}</p>
                      <div>
                        <p className="text-[12.5px] text-2">{log.recipientName}</p>
                        <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{log.recipientEmail}</p>
                      </div>
                      <p className="text-[11.5px] font-mono" style={{ color: "var(--text-3)" }}>{log.emailType}</p>
                      <p className="text-[11.5px]" style={{ color: "var(--text-3)" }}>{log.sentAt}</p>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          procurementId={id}
          currentStatus={safeReq.paymentStatus}
          currentAmountPaid={safeReq.amountPaid}
          totalAmount={safeReq.totalAmount}
          onClose={() => setShowPay(false)}
          onSave={handlePaymentSave}
        />
      )}
      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRej(false)}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
