"use client";
import { useState, useRef } from "react";
import { AlertTriangle, Clock, Filter, Upload, CheckCircle2, ChevronDown, FileText, X, CloudUpload } from "lucide-react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { INVOICES, VENDORS } from "@/lib/mock-data";
import { formatCurrency, formatDate, getDaysOverdue, getDaysUntilDue, INVOICE_STATUS_CONFIG, DEPARTMENT_LABELS } from "@/lib/utils";
import type { InvoiceStatus } from "@/types";

const STATUS_TABS: { label: string; value: InvoiceStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Overdue", value: "overdue" },
  { label: "Pending", value: "pending" },
  { label: "Partially Paid", value: "partially_paid" },
  { label: "Paid", value: "paid" },
];

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<InvoiceStatus | "all">("all");
  const [showMarkPaid, setShowMarkPaid] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    vendorId: "", invoiceNumber: "", invoiceDate: "", dueDate: "",
    grossAmount: "", advancePaid: "", notes: "",
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

  const filtered = activeTab === "all" ? INVOICES : INVOICES.filter(i => i.status === activeTab);
  const overdueCount = INVOICES.filter(i => i.status === "overdue").length;
  const overdueTotal = INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.balanceDue, 0);
  const pendingTotal = INVOICES.filter(i => i.status !== "paid").reduce((s, i) => s + i.balanceDue, 0);

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (b.status === "overdue" && a.status !== "overdue") return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Invoices & Payments" subtitle="Track all outstanding and completed payments" />

      <div className="p-6 space-y-5">
        {/* Upload button row */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1D1D1F] text-white text-[13px] font-medium rounded-lg hover:bg-[#3A3A3C] transition-colors"
          >
            <Upload size={14} /> Upload Invoice
          </button>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total Outstanding"
            value={formatCurrency(pendingTotal)}
            sub={`${INVOICES.filter(i => i.status !== "paid").length} invoices pending`}
            accent="default"
          />
          <StatCard
            label="Overdue"
            value={formatCurrency(overdueTotal)}
            sub={`${overdueCount} vendors not paid`}
            accent="red"
          />
          <StatCard
            label="Paid This Month"
            value={formatCurrency(4_55_000)}
            sub="5 invoices cleared"
            accent="green"
          />
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-5 pt-4 border-b border-[#F5F5F7]">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-2 text-[12.5px] font-medium rounded-lg mb-3 transition-all ${
                  activeTab === tab.value
                    ? "bg-[#1D1D1F] text-white"
                    : "text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                }`}
              >
                {tab.label}
                {tab.value === "overdue" && overdueCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-[#FF3B30] text-white rounded-full px-1.5 py-0.5">{overdueCount}</span>
                )}
              </button>
            ))}
            <div className="ml-auto mb-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors">
                <Filter size={13} /> Filter <ChevronDown size={12} />
              </button>
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 px-5 py-2.5 bg-[#F5F5F7]">
            {["Vendor / Invoice", "Department", "Amount Due", "Due Date", "Status", "Action"].map(h => (
              <span key={h} className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wide">{h}</span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#F5F5F7]">
            {sorted.map(inv => {
              const cfg = INVOICE_STATUS_CONFIG[inv.status];
              const daysOverdue = inv.status === "overdue" ? getDaysOverdue(inv.dueDate) : null;
              const daysLeft = inv.status !== "overdue" && inv.status !== "paid" ? getDaysUntilDue(inv.dueDate) : null;
              return (
                <div key={inv.id} className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 items-center px-5 py-4 hover:bg-[#F5F5F7] transition-colors ${inv.status === "overdue" ? "bg-[#FFF2F1]/40" : ""}`}>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{inv.vendorName}</p>
                    <p className="text-[11.5px] text-[#8E8E93] mt-0.5">
                      #{inv.invoiceNumber} · {inv.eventName || "—"} · {inv.poNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-[12px] text-[#636366]">{DEPARTMENT_LABELS[inv.department]}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1D1D1F]">{formatCurrency(inv.balanceDue)}</p>
                    {inv.advancePaid > 0 && (
                      <p className="text-[11px] text-[#8E8E93]">Advance {formatCurrency(inv.advancePaid)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium text-[#1D1D1F]">{formatDate(inv.dueDate)}</p>
                    {daysOverdue !== null && (
                      <p className="text-[11px] text-[#FF3B30] font-medium">{daysOverdue}d overdue</p>
                    )}
                    {daysLeft !== null && (
                      <p className={`text-[11px] font-medium ${daysLeft <= 3 ? "text-[#FF9F0A]" : "text-[#8E8E93]"}`}>
                        {daysLeft === 0 ? "Due today" : `${daysLeft}d left`}
                      </p>
                    )}
                  </div>
                  <div>
                    <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size="sm" dot />
                  </div>
                  <div className="flex gap-2">
                    {inv.status !== "paid" && (
                      <button
                        onClick={() => setShowMarkPaid(inv.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#1D1D1F] text-white text-[11.5px] font-medium rounded-lg hover:bg-[#3A3A3C] transition-colors"
                      >
                        <CheckCircle2 size={12} /> Mark Paid
                      </button>
                    )}
                    {inv.status === "paid" && (
                      <span className="text-[11.5px] font-medium text-[#34C759] flex items-center gap-1">
                        <CheckCircle2 size={12} /> Paid
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mark paid modal */}
      {showMarkPaid && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[slideUp_0.25s_ease-out]">
            <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-1">Mark as Paid</h2>
            <p className="text-[13px] text-[#636366] mb-5">Enter payment details for confirmation</p>
            <div className="space-y-3">
              {[
                { label: "UTR / Reference Number", placeholder: "e.g. NEFT20251126ABC123", type: "text" },
                { label: "Amount Paid (₹)", placeholder: "0", type: "number" },
                { label: "Payment Date", placeholder: "", type: "date" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent transition-all placeholder:text-[#AEAEB2]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Payment Mode</label>
                <select className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white">
                  {["NEFT", "IMPS", "UPI", "Cash", "Cheque"].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowMarkPaid(null)}
                className="flex-1 py-2.5 text-[13px] font-medium text-[#636366] border border-[#E8E8ED] rounded-xl hover:bg-[#F5F5F7] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMarkPaid(null)}
                className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-[#1D1D1F] rounded-xl hover:bg-[#3A3A3C] transition-colors"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Invoice Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[slideUp_0.25s_ease-out] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F5F5F7]">
              <div>
                <h2 className="text-[17px] font-semibold text-[#1D1D1F]">Upload Invoice</h2>
                <p className="text-[12px] text-[#8E8E93] mt-0.5">Link to a purchase order and log payment details</p>
              </div>
              <button onClick={() => { setShowUpload(false); setUploadFile(null); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#AEAEB2] hover:text-[#636366] hover:bg-[#F5F5F7] transition-colors">
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
                className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                  dragOver
                    ? "border-[#0071E3] bg-[#E8F1FB]"
                    : uploadFile
                    ? "border-[#34C759] bg-[#F0FAF3]"
                    : "border-[#E8E8ED] hover:border-[#0071E3] hover:bg-[#F5F5F7]"
                }`}
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
                    <FileText size={24} className="text-[#34C759]" />
                    <p className="text-[13px] font-semibold text-[#34C759]">{uploadFile.name}</p>
                    <p className="text-[11.5px] text-[#34C759]/70">{(uploadFile.size / 1024).toFixed(0)} KB · Click to change</p>
                  </>
                ) : (
                  <>
                    <CloudUpload size={24} className="text-[#AEAEB2]" />
                    <p className="text-[13px] font-semibold text-[#636366]">Drop invoice here or click to upload</p>
                    <p className="text-[11.5px] text-[#AEAEB2]">PDF, JPG, PNG — WhatsApp screenshots work too</p>
                  </>
                )}
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Vendor <span className="text-[#FF3B30]">*</span></label>
                <select
                  value={uploadForm.vendorId}
                  onChange={e => updateUpload("vendorId", e.target.value)}
                  className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                >
                  <option value="">Select vendor</option>
                  {VENDORS.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Invoice Number <span className="text-[#FF3B30]">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. SAV-1124"
                    value={uploadForm.invoiceNumber}
                    onChange={e => updateUpload("invoiceNumber", e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Invoice Date <span className="text-[#FF3B30]">*</span></label>
                  <input
                    type="date"
                    value={uploadForm.invoiceDate}
                    onChange={e => updateUpload("invoiceDate", e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Invoice Total (₹) <span className="text-[#FF3B30]">*</span></label>
                  <input
                    type="number"
                    placeholder="0"
                    value={uploadForm.grossAmount}
                    onChange={e => updateUpload("grossAmount", e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">
                    Advance Already Paid (₹)
                    <span className="text-[#8E8E93] font-normal ml-1">(if any)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={uploadForm.advancePaid}
                    onChange={e => updateUpload("advancePaid", e.target.value)}
                    className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
                  />
                </div>
              </div>

              {/* Balance due preview */}
              {parseFloat(uploadForm.grossAmount) > 0 && (
                <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F7] rounded-xl animate-[slideUp_0.2s_ease-out]">
                  <span className="text-[12px] font-medium text-[#636366]">Balance Due to Vendor</span>
                  <span className="text-[16px] font-semibold text-[#1D1D1F]">
                    {formatCurrency(Math.max(0, balanceDue))}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Payment Due Date <span className="text-[#FF3B30]">*</span></label>
                <input
                  type="date"
                  value={uploadForm.dueDate}
                  onChange={e => updateUpload("dueDate", e.target.value)}
                  min={uploadForm.invoiceDate}
                  className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                />
                <p className="text-[11.5px] text-[#8E8E93] mt-1">Enter the date the vendor has asked to be paid by.</p>
              </div>
            </div>

            <div className="flex gap-2.5 px-6 pb-6">
              <button
                onClick={() => { setShowUpload(false); setUploadFile(null); }}
                className="flex-1 py-2.5 text-[13px] font-medium text-[#636366] border border-[#E8E8ED] rounded-xl hover:bg-[#F5F5F7] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowUpload(false); setUploadFile(null); }}
                disabled={!uploadForm.vendorId || !uploadForm.invoiceNumber || !uploadForm.dueDate || !uploadForm.grossAmount}
                className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-[#1D1D1F] rounded-xl hover:bg-[#3A3A3C] transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <Upload size={14} /> Upload & Save Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
