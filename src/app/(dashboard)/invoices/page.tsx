"use client";
import { useState, useRef } from "react";
import { AlertTriangle, Upload, CheckCircle2, FileText, X, CloudUpload, DollarSign } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { INVOICES, VENDORS } from "@/lib/mock-data";
import { formatCurrency, formatDate, getDaysOverdue, getDaysUntilDue, INVOICE_STATUS_CONFIG, DEPARTMENT_LABELS } from "@/lib/utils";
import type { InvoiceStatus } from "@/types";

const STATUS_TABS: { label: string; value: InvoiceStatus | "all" }[] = [
  { label: "All",            value: "all"           },
  { label: "Overdue",        value: "overdue"        },
  { label: "Pending",        value: "pending"        },
  { label: "Partially Paid", value: "partially_paid" },
  { label: "Paid",           value: "paid"           },
];

export default function InvoicesPage() {
  const [activeTab,    setActiveTab]    = useState<InvoiceStatus | "all">("all");
  const [showMarkPaid, setShowMarkPaid] = useState<string | null>(null);
  const [showUpload,   setShowUpload]   = useState(false);
  const [uploadFile,   setUploadFile]   = useState<File | null>(null);
  const [uploadForm,   setUploadForm]   = useState({
    vendorId: "", invoiceNumber: "", invoiceDate: "", dueDate: "",
    grossAmount: "", advancePaid: "",
  });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const updateUpload = (k: string, v: string) => setUploadForm(f => ({ ...f, [k]: v }));
  const balanceDue = (parseFloat(uploadForm.grossAmount) || 0) - (parseFloat(uploadForm.advancePaid) || 0);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadFile(file);
  };

  const filtered       = activeTab === "all" ? INVOICES : INVOICES.filter(i => i.status === activeTab);
  const overdueCount   = INVOICES.filter(i => i.status === "overdue").length;
  const overdueTotal   = INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.balanceDue, 0);
  const pendingTotal   = INVOICES.filter(i => i.status !== "paid").reduce((s, i) => s + i.balanceDue, 0);

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="anim-fade">
      <Header
        title="Invoices & Payments"
        subtitle="Track outstanding and completed payments"
        action={{ label: "Upload Invoice", onClick: () => setShowUpload(true) }}
      />

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Outstanding", value: pendingTotal > 0 ? formatCurrency(pendingTotal) : "—", sub: `${INVOICES.filter(i => i.status !== "paid").length} invoices pending`, icon: DollarSign,    color: "var(--primary)", bg: "var(--primary-light)" },
            { label: "Overdue",     value: overdueTotal > 0 ? formatCurrency(overdueTotal) : "—", sub: overdueCount > 0 ? `${overdueCount} vendors waiting` : "None",           icon: AlertTriangle, color: "var(--danger)",  bg: "var(--danger-bg)"    },
            { label: "Paid This Month", value: "—", sub: "No payments yet",                                                                                                     icon: CheckCircle2,  color: "var(--success)", bg: "var(--success-bg)"   },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-3 mb-2">{s.label}</p>
                  <p className="text-[20px] font-bold text-1 leading-none">{s.value}</p>
                  <p className="text-[12px] text-3 mt-1.5">{s.sub}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center gap-0.5 px-4 pt-3 border-b overflow-x-auto" style={{ borderColor: "var(--border)" }}>
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="px-3 text-[12.5px] font-medium whitespace-nowrap transition-all"
                style={{
                  color: activeTab === tab.value ? "var(--primary)" : "var(--text-3)",
                  borderBottom: `2px solid ${activeTab === tab.value ? "var(--primary)" : "transparent"}`,
                  padding: "8px 12px 10px",
                }}
              >
                {tab.label}
                {tab.value === "overdue" && overdueCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--danger)" }}>{overdueCount}</span>
                )}
              </button>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-[14px] font-semibold text-1">No invoices yet</p>
              <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
                Upload an invoice to start tracking payments.
              </p>
              <button onClick={() => setShowUpload(true)} className="btn-primary mt-2">Upload Invoice</button>
            </div>
          ) : (
            <>
              <div className="tbl-head grid grid-cols-[2fr_1fr_1fr_1fr_1fr_110px] gap-4 px-5 py-2.5">
                {["Vendor / Invoice", "Department", "Advance Paid", "Balance Due", "Status", "Action"].map(h => (
                  <span key={h}>{h}</span>
                ))}
              </div>

              <div>
                {sorted.map(inv => {
                  const cfg = INVOICE_STATUS_CONFIG[inv.status];
                  const daysOverdue = inv.status === "overdue" ? getDaysOverdue(inv.dueDate) : null;
                  const daysLeft    = inv.status !== "overdue" && inv.status !== "paid" ? getDaysUntilDue(inv.dueDate) : null;
                  return (
                    <div
                      key={inv.id}
                      className="tbl-row grid grid-cols-[2fr_1fr_1fr_1fr_1fr_110px] gap-4 items-center px-5 py-4"
                      style={inv.status === "overdue" ? { backgroundColor: "var(--danger-bg)" } : {}}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-1 truncate">{inv.vendorName}</p>
                        <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-3)" }}>
                          #{inv.invoiceNumber} · Due {formatDate(inv.dueDate)}
                        </p>
                      </div>
                      <span className="text-[12px]" style={{ color: "var(--text-3)" }}>{DEPARTMENT_LABELS[inv.department]}</span>
                      <div>
                        {inv.advancePaid > 0 ? (
                          <p className="text-[13px] font-semibold" style={{ color: "var(--success)" }}>{formatCurrency(inv.advancePaid)}</p>
                        ) : (
                          <p className="text-[12px]" style={{ color: "var(--text-3)" }}>—</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-1">{formatCurrency(inv.balanceDue)}</p>
                        {daysOverdue !== null && (
                          <p className="text-[11px] font-medium" style={{ color: "var(--danger)" }}>{daysOverdue}d overdue</p>
                        )}
                        {daysLeft !== null && (
                          <p className="text-[11px] font-medium" style={{ color: daysLeft <= 3 ? "var(--warning)" : "var(--text-3)" }}>
                            {daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                          </p>
                        )}
                      </div>
                      <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size="sm" dot />
                      <div>
                        {inv.status !== "paid" ? (
                          <button
                            onClick={() => setShowMarkPaid(inv.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "var(--primary)" }}
                          >
                            <CheckCircle2 size={12} /> Mark Paid
                          </button>
                        ) : (
                          <span className="text-[11.5px] font-semibold flex items-center gap-1" style={{ color: "var(--success)" }}>
                            <CheckCircle2 size={12} /> Paid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mark Paid Modal */}
      {showMarkPaid && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card anim-slide w-full max-w-md p-6" style={{ boxShadow: "var(--modal-shadow)" }}>
            <h2 className="text-[17px] font-semibold text-1 mb-1">Mark as Paid</h2>
            <p className="text-[13px] mb-5" style={{ color: "var(--text-3)" }}>Enter payment details for confirmation</p>
            <div className="space-y-3">
              {[
                { label: "UTR / Reference Number", placeholder: "e.g. NEFT20251126ABC123", type: "text"   },
                { label: "Amount Paid (₹)",         placeholder: "0",                       type: "number" },
                { label: "Payment Date",             placeholder: "",                        type: "date"   },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[12px] font-medium text-1 mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="field" />
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Payment Mode</label>
                <select className="field">
                  {["NEFT", "IMPS", "UPI", "Cash", "Cheque"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={() => setShowMarkPaid(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={() => setShowMarkPaid(null)} className="btn-primary flex-1 justify-center">Confirm Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Invoice Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card anim-slide w-full max-w-lg" style={{ boxShadow: "var(--modal-shadow)", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div>
                <h2 className="text-[17px] font-semibold text-1">Upload Invoice</h2>
                <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>Log payment details and link to a vendor</p>
              </div>
              <button
                onClick={() => { setShowUpload(false); setUploadFile(null); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "var(--text-3)", backgroundColor: "var(--surface-2)" }}
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* File drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all"
                style={{
                  borderColor: dragOver ? "var(--primary)" : uploadFile ? "var(--success)" : "var(--border)",
                  backgroundColor: dragOver ? "var(--primary-light)" : uploadFile ? "var(--success-bg)" : "var(--surface-2)",
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && setUploadFile(e.target.files[0])}
                />
                {uploadFile ? (
                  <>
                    <FileText size={24} style={{ color: "var(--success)" }} />
                    <p className="text-[13px] font-semibold" style={{ color: "var(--success)" }}>{uploadFile.name}</p>
                    <p className="text-[11.5px]" style={{ color: "var(--success)" }}>{(uploadFile.size / 1024).toFixed(0)} KB · Click to change</p>
                  </>
                ) : (
                  <>
                    <CloudUpload size={24} style={{ color: "var(--text-3)" }} />
                    <p className="text-[13px] font-semibold" style={{ color: "var(--text-2)" }}>Drop invoice here or click to upload</p>
                    <p className="text-[11.5px]" style={{ color: "var(--text-3)" }}>PDF, JPG, PNG — WhatsApp screenshots work too</p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Vendor <span style={{ color: "var(--danger)" }}>*</span></label>
                <select value={uploadForm.vendorId} onChange={e => updateUpload("vendorId", e.target.value)} className="field">
                  <option value="">Select vendor</option>
                  {VENDORS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                {VENDORS.length === 0 && (
                  <p className="text-[11.5px] mt-1" style={{ color: "var(--text-3)" }}>No vendors yet — add one from the Vendors page first.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-1 mb-1.5">Invoice Number <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input type="text" placeholder="e.g. INV-001" value={uploadForm.invoiceNumber} onChange={e => updateUpload("invoiceNumber", e.target.value)} className="field" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-1 mb-1.5">Invoice Date <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input type="date" value={uploadForm.invoiceDate} onChange={e => updateUpload("invoiceDate", e.target.value)} className="field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-1 mb-1.5">Invoice Total (₹) <span style={{ color: "var(--danger)" }}>*</span></label>
                  <input type="number" placeholder="0" value={uploadForm.grossAmount} onChange={e => updateUpload("grossAmount", e.target.value)} className="field" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-1 mb-1.5">
                    Advance Paid (₹) <span className="font-normal" style={{ color: "var(--text-3)" }}>(if any)</span>
                  </label>
                  <input type="number" placeholder="0" value={uploadForm.advancePaid} onChange={e => updateUpload("advancePaid", e.target.value)} className="field" />
                </div>
              </div>

              {parseFloat(uploadForm.grossAmount) > 0 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--surface-2)" }}>
                  <span className="text-[12px] font-medium" style={{ color: "var(--text-2)" }}>Balance Due to Vendor</span>
                  <span className="text-[16px] font-bold text-1">{formatCurrency(Math.max(0, balanceDue))}</span>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Payment Due Date <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="date" value={uploadForm.dueDate} onChange={e => updateUpload("dueDate", e.target.value)} min={uploadForm.invoiceDate} className="field" />
              </div>
            </div>

            <div className="flex gap-2.5 px-6 pb-6">
              <button onClick={() => { setShowUpload(false); setUploadFile(null); }} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button
                onClick={() => { setShowUpload(false); setUploadFile(null); }}
                disabled={!uploadForm.vendorId || !uploadForm.invoiceNumber || !uploadForm.dueDate || !uploadForm.grossAmount}
                className="btn-primary flex-1 justify-center"
              >
                <Upload size={14} /> Upload & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
