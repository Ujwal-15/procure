"use client";
import { useState, useMemo } from "react";
import { CreditCard, XCircle, AlertTriangle } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import {
  formatCurrency, formatDate, getDaysOverdue,
  PAYMENT_STATUS_CONFIG, PAYMENT_MODES,
  canUpdatePayment,
} from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";
import { emailPaymentComplete } from "@/lib/email";
import { USERS } from "@/lib/mock-data";
import type { PaymentStatus } from "@/types";

type Tab = PaymentStatus | "all";

const TABS: { label: string; value: Tab }[] = [
  { label: "All",            value: "all"           },
  { label: "Unpaid",         value: "unpaid"        },
  { label: "Advance Paid",   value: "advance_paid"  },
  { label: "Partially Paid", value: "partially_paid"},
  { label: "Fully Paid",     value: "fully_paid"    },
  { label: "On Hold",        value: "on_hold"       },
];

/* ── Payment Modal ─────────────────────────────────────────────────────── */
interface PaymentModalProps {
  procurementId: string;
  title: string;
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
  title, currentStatus, currentAmountPaid, totalAmount, onClose, onSave,
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
    { value: "unpaid",         label: "Unpaid"         },
    { value: "advance_paid",   label: "Advance Paid"   },
    { value: "partially_paid", label: "Partially Paid" },
    { value: "fully_paid",     label: "Fully Paid"     },
    { value: "on_hold",        label: "On Hold"        },
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
          <div>
            <h3 className="text-[15px] font-semibold text-1">Update Payment</h3>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>{title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--surface-2)", color: "var(--text-3)" }}
          >
            <XCircle size={15} />
          </button>
        </div>

        <div
          className="text-[12px] font-medium px-3 py-2 rounded-lg"
          style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)" }}
        >
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
              <label className="text-[11px] font-semibold text-3 uppercase tracking-wide block mb-1">Mode</label>
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
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-[13px]"
          >
            {saving ? "Saving…" : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────────────── */
export default function PaymentsPage() {
  const { currentUser } = useCurrentUser();
  const { requests, loading, updatePayment } = useData();

  const [activeTab, setActiveTab]   = useState<Tab>("all");
  const [modalTarget, setModalTarget] = useState<string | null>(null);
  const canPay = canUpdatePayment(currentUser.role);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear  = now.getFullYear();

  const filtered = useMemo(() => {
    const list = requests.filter(r =>
      r.status !== "draft" && r.status !== "rejected" && r.status !== "cancelled"
    );
    if (activeTab === "all") return list;
    return list.filter(r => r.paymentStatus === activeTab);
  }, [requests, activeTab]);

  const totalOutstanding = requests
    .filter(r => r.paymentStatus !== "fully_paid" && r.status !== "draft" && r.status !== "cancelled")
    .reduce((s, r) => s + Math.max(0, r.totalAmount - r.amountPaid), 0);

  const overdueItems = requests.filter(r =>
    r.paymentDueDate &&
    r.paymentStatus !== "fully_paid" &&
    r.status !== "draft" && r.status !== "cancelled" &&
    getDaysOverdue(r.paymentDueDate) > 0
  );

  const paidThisMonth = requests
    .filter(r => {
      if (r.paymentStatus !== "fully_paid") return false;
      const d = new Date(r.updatedAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((s, r) => s + r.totalAmount, 0);

  const modalReq = modalTarget ? requests.find(r => r.id === modalTarget) : null;

  async function handlePaymentSave(opts: {
    paymentStatus: PaymentStatus;
    amountPaid: number;
    paymentDate: string;
    paymentMode: string;
    transactionRef: string;
    notes: string;
  }) {
    if (!modalTarget || !modalReq) return;
    await updatePayment({
      procurementId:  modalTarget,
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
        .filter(u => u.role === "finance" || u.role === "management" || u.id === modalReq.requesterId)
        .map(u => ({ email: u.email, name: u.name }));
      await emailPaymentComplete({
        id:             modalTarget,
        title:          modalReq.title,
        totalAmount:    modalReq.totalAmount,
        paymentDate:    opts.paymentDate,
        paymentMode:    opts.paymentMode,
        transactionRef: opts.transactionRef,
        recipients,
      });
    }
    setModalTarget(null);
  }

  const SUMMARY = [
    {
      label: "Total Outstanding",
      value: formatCurrency(totalOutstanding),
      sub: `${requests.filter(r => r.paymentStatus !== "fully_paid" && r.status !== "draft").length} procurements`,
      color: "var(--warning)",
      bg: "var(--warning-bg)",
      icon: <CreditCard size={16} style={{ color: "var(--warning)" }} />,
    },
    {
      label: "Overdue",
      value: formatCurrency(overdueItems.reduce((s, r) => s + Math.max(0, r.totalAmount - r.amountPaid), 0)),
      sub: `${overdueItems.length} items past due`,
      color: "var(--danger)",
      bg: "var(--danger-bg)",
      icon: <AlertTriangle size={16} style={{ color: "var(--danger)" }} />,
    },
    {
      label: "Paid This Month",
      value: formatCurrency(paidThisMonth),
      sub: `${now.toLocaleString("en-IN", { month: "long" })} ${thisYear}`,
      color: "var(--success)",
      bg: "var(--success-bg)",
      icon: <CreditCard size={16} style={{ color: "var(--success)" }} />,
    },
  ];

  return (
    <div className="anim-fade">
      <Header title="Payments" subtitle="Track and manage all procurement payments" />

      <div className="p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {SUMMARY.map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-3 mb-2">{s.label}</p>
                  <p className="text-[20px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[12px] text-3 mt-1.5">{s.sub}</p>
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: s.bg }}
                >
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="card p-0 overflow-hidden">
          {/* Tabs */}
          <div
            className="flex items-center gap-0.5 px-4 pt-3 border-b overflow-x-auto"
            style={{ borderColor: "var(--border)" }}
          >
            {TABS.map(tab => (
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
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Loading…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <CreditCard size={28} style={{ color: "var(--text-3)" }} />
              <p className="text-[14px] font-semibold text-1">No items here</p>
            </div>
          ) : (
            <>
              <div
                className="tbl-head grid gap-4 px-5 py-2.5"
                style={{ gridTemplateColumns: canPay ? "2fr 1.2fr 1fr 1fr 1fr 100px 100px" : "2fr 1.2fr 1fr 1fr 1fr 100px" }}
              >
                {["Title", "Vendor", "Total", "Paid", "Status", "Due Date", ...(canPay ? ["Action"] : [])].map(h => (
                  <span key={h}>{h}</span>
                ))}
              </div>

              {filtered.map(req => {
                const pmCfg    = PAYMENT_STATUS_CONFIG[req.paymentStatus];
                const daysOvd  = req.paymentDueDate ? getDaysOverdue(req.paymentDueDate) : 0;
                const isOverdue = daysOvd > 0 && req.paymentStatus !== "fully_paid";
                const outstanding = Math.max(0, req.totalAmount - req.amountPaid);

                return (
                  <div
                    key={req.id}
                    className="tbl-row grid gap-4 items-center px-5 py-3.5"
                    style={{
                      gridTemplateColumns: canPay
                        ? "2fr 1.2fr 1fr 1fr 1fr 100px 100px"
                        : "2fr 1.2fr 1fr 1fr 1fr 100px",
                      backgroundColor: isOverdue ? "var(--danger-bg)" : undefined,
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-1 truncate">{req.title}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                        {req.requestNumber}
                      </p>
                      {isOverdue && (
                        <p className="text-[11px] mt-0.5 font-semibold" style={{ color: "var(--danger)" }}>
                          {daysOvd}d overdue
                        </p>
                      )}
                    </div>

                    <p className="text-[12.5px] text-2 truncate">{req.vendorName || "—"}</p>

                    <p className="text-[13px] font-semibold text-1">{formatCurrency(req.totalAmount)}</p>

                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: req.amountPaid > 0 ? "var(--success)" : "var(--text-3)" }}>
                        {formatCurrency(req.amountPaid)}
                      </p>
                      {outstanding > 0 && (
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--warning)" }}>
                          {formatCurrency(outstanding)} left
                        </p>
                      )}
                    </div>

                    <Badge label={pmCfg.label} color={pmCfg.color} bg={pmCfg.bg} size="sm" />

                    <p className="text-[12px]" style={{ color: isOverdue ? "var(--danger)" : "var(--text-3)" }}>
                      {req.paymentDueDate ? formatDate(req.paymentDueDate) : "—"}
                    </p>

                    {canPay && (
                      <div>
                        {req.paymentStatus !== "fully_paid" && req.paymentStatus !== "on_hold" ? (
                          <button
                            onClick={() => setModalTarget(req.id)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                            style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}
                          >
                            Update
                          </button>
                        ) : req.paymentStatus === "fully_paid" ? (
                          <span className="text-[11px]" style={{ color: "var(--success)" }}>Paid</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {modalTarget && modalReq && (
        <PaymentModal
          procurementId={modalTarget}
          title={modalReq.title}
          currentStatus={modalReq.paymentStatus}
          currentAmountPaid={modalReq.amountPaid}
          totalAmount={modalReq.totalAmount}
          onClose={() => setModalTarget(null)}
          onSave={handlePaymentSave}
        />
      )}
    </div>
  );
}
