"use client";
import { useState } from "react";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useCurrentUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";
import { formatCurrency, PROCUREMENT_CATEGORIES, PAYMENT_TERMS } from "@/lib/utils";
import {
  emailSubmittedForApproval,
} from "@/lib/email";
import { USERS } from "@/lib/mock-data";

/* ── Inline "Add vendor" mini-modal ─────────────────────────────────────── */
function AddVendorModal({
  onAdd,
  onClose,
}: {
  onAdd: (v: { id: string; name: string; contactName: string; phone: string }) => void;
  onClose: () => void;
}) {
  const { addVendor } = useData();
  const [name,   setName]   = useState("");
  const [phone,  setPhone]  = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const v = await addVendor({ name: name.trim(), category: "Other", contactName: "", phone: phone.trim() });
    onAdd({ id: v.id, name: v.name, contactName: v.contactName, phone: v.phone });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card anim-slide w-full max-w-sm p-6" style={{ boxShadow: "var(--modal-shadow)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-1">Add New Vendor</h2>
          <button onClick={onClose}><X size={16} style={{ color: "var(--text-3)" }} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-1 mb-1.5">Vendor Name <span style={{ color: "var(--danger)" }}>*</span></label>
            <input type="text" placeholder="e.g. LightCraft Productions" value={name} onChange={e => setName(e.target.value)} className="field" autoFocus />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-1 mb-1.5">Contact Number</label>
            <input type="text" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} className="field" />
          </div>
          <p className="text-[11.5px]" style={{ color: "var(--text-3)" }}>Full details (banking, GST) can be added later in the Vendors section.</p>
        </div>
        <div className="flex gap-2.5 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleAdd} disabled={!name.trim() || saving} className="btn-primary flex-1 justify-center">
            {saving ? "Saving…" : "Add Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function NewProcurementPage() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { vendors, addProcurement, submitForApproval } = useData();

  const [form, setForm] = useState({
    title: "", category: "", vendorId: "", vendorName: "", vendorSearch: "",
    projectName: "", description: "", quantity: "", totalAmount: "",
    paymentTerms: "", paymentDueDate: "", expectedDelivery: "",
    attachmentUrl: "", notes: "",
  });
  const [showAddVendor,  setShowAddVendor]  = useState(false);
  const [vendorDropdown, setVendorDropdown] = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [errors,         setErrors]         = useState<Record<string, string>>({});

  const upd = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: "" }));
  };

  const needsDueDate = ["Net 7", "Net 15", "Net 30", "Custom"].includes(form.paymentTerms);

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(form.vendorSearch.toLowerCase())
  );

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())    e.title    = "Title is required";
    if (!form.category)        e.category = "Category is required";
    if (!form.vendorId)        e.vendorId = "Vendor is required";
    if (!form.totalAmount || parseFloat(form.totalAmount) <= 0)
      e.totalAmount = "Total amount must be greater than 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await addProcurement({
        title: form.title.trim(), category: form.category,
        vendorId: form.vendorId || undefined, vendorName: form.vendorName || undefined,
        projectName: form.projectName.trim() || undefined,
        description: form.description.trim() || undefined,
        quantity: form.quantity ? parseFloat(form.quantity) : undefined,
        totalAmount: parseFloat(form.totalAmount),
        paymentTerms: form.paymentTerms || undefined,
        paymentDueDate: form.paymentDueDate || undefined,
        expectedDelivery: form.expectedDelivery || undefined,
        notes: form.notes.trim() || undefined,
        requesterId: currentUser.id, requesterName: currentUser.name,
      }, true);
      router.push("/procurement");
    } catch { setSubmitting(false); }
  };

  const handleSubmitForApproval = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const req = await addProcurement({
        title: form.title.trim(), category: form.category,
        vendorId: form.vendorId || undefined, vendorName: form.vendorName || undefined,
        projectName: form.projectName.trim() || undefined,
        description: form.description.trim() || undefined,
        quantity: form.quantity ? parseFloat(form.quantity) : undefined,
        totalAmount: parseFloat(form.totalAmount),
        paymentTerms: form.paymentTerms || undefined,
        paymentDueDate: form.paymentDueDate || undefined,
        expectedDelivery: form.expectedDelivery || undefined,
        notes: form.notes.trim() || undefined,
        requesterId: currentUser.id, requesterName: currentUser.name,
      }, false);
      await submitForApproval(req.id);

      // Email owners
      const owners = USERS.filter(u => u.role === "management").map(u => ({ email: u.email, name: u.name }));
      await emailSubmittedForApproval({
        id: req.id, title: req.title, vendorName: req.vendorName,
        totalAmount: req.totalAmount, category: req.category,
        projectName: req.projectName, submittedBy: currentUser.name, owners,
      });

      router.push("/procurement");
    } catch { setSubmitting(false); }
  };

  if (currentUser.role === "management") {
    return (
      <div className="anim-fade p-6">
        <div className="card p-8 flex flex-col items-center text-center gap-3 max-w-md mx-auto">
          <p className="text-[15px] font-semibold text-1">Access restricted</p>
          <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Owners cannot create procurement entries.</p>
          <Link href="/procurement" className="btn-ghost mt-2">Back</Link>
        </div>
      </div>
    );
  }

  const Field = ({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-[12px] font-medium text-1 mb-1.5">{label}{required && <span style={{ color: "var(--danger)" }}> *</span>}</label>
      {children}
      {error && <p className="text-[11.5px] mt-1 font-medium" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );

  return (
    <div className="anim-fade">
      <Header title="New Procurement" />
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <Link href="/procurement" className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-5 transition-colors" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={14} /> Back to procurements
        </Link>

        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-semibold text-1">Procurement Details</h2>

            {/* 1. Title */}
            <Field label="Procurement Title" required error={errors.title}>
              <input type="text" placeholder="e.g. LED Stage Panels for Spectra 2026" value={form.title} onChange={e => upd("title", e.target.value)} className="field" />
            </Field>

            {/* 2. Category */}
            <Field label="Category" required error={errors.category}>
              <select value={form.category} onChange={e => upd("category", e.target.value)} className="field">
                <option value="">Select category</option>
                {PROCUREMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            {/* 3. Vendor */}
            <Field label="Vendor" required error={errors.vendorId}>
              <div className="relative">
                {form.vendorId ? (
                  <div className="field flex items-center justify-between">
                    <span className="text-[13px] text-1">{form.vendorName}</span>
                    <button type="button" onClick={() => { upd("vendorId", ""); upd("vendorName", ""); }} style={{ color: "var(--text-3)" }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
                    <input
                      type="text"
                      placeholder="Search vendors…"
                      value={form.vendorSearch}
                      onChange={e => { upd("vendorSearch", e.target.value); setVendorDropdown(true); }}
                      onFocus={() => setVendorDropdown(true)}
                      className="field"
                      style={{ paddingLeft: 36 }}
                    />
                  </>
                )}
                {vendorDropdown && !form.vendorId && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 card py-1 max-h-[200px] overflow-y-auto" style={{ boxShadow: "var(--modal-shadow)" }}>
                    {filteredVendors.map(v => (
                      <button
                        key={v.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[var(--surface-2)] transition-colors"
                        onClick={() => { upd("vendorId", v.id); upd("vendorName", v.name); upd("vendorSearch", ""); setVendorDropdown(false); }}
                      >
                        <span className="font-medium text-1">{v.name}</span>
                        <span className="text-[11px] ml-2" style={{ color: "var(--text-3)" }}>{v.category}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-[13px] flex items-center gap-2 transition-colors"
                      style={{ color: "var(--primary)" }}
                      onClick={() => { setVendorDropdown(false); setShowAddVendor(true); }}
                    >
                      <Plus size={14} /> Add new vendor
                    </button>
                    {filteredVendors.length === 0 && form.vendorSearch && (
                      <p className="px-4 py-2 text-[12px]" style={{ color: "var(--text-3)" }}>No vendors found</p>
                    )}
                  </div>
                )}
              </div>
            </Field>

            {/* 4. Project / Event Name */}
            <Field label="Project / Event Name">
              <input type="text" placeholder="e.g. Spectra 2026, PWC Event" value={form.projectName} onChange={e => upd("projectName", e.target.value)} className="field" />
            </Field>

            {/* 5. Description */}
            <Field label="Description">
              <textarea placeholder="Describe what is being procured…" value={form.description} onChange={e => upd("description", e.target.value)} rows={3} className="field resize-none" />
            </Field>
          </div>

          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-semibold text-1">Amount & Payment</h2>

            <div className="grid grid-cols-2 gap-4">
              {/* 6. Quantity */}
              <Field label="Quantity">
                <input type="number" min="0" placeholder="Optional" value={form.quantity} onChange={e => upd("quantity", e.target.value)} className="field" />
              </Field>

              {/* 7. Total Amount */}
              <Field label="Total Amount (₹)" required error={errors.totalAmount}>
                <input type="number" min="0" placeholder="0" value={form.totalAmount} onChange={e => upd("totalAmount", e.target.value)} className="field" />
              </Field>
            </div>

            {form.totalAmount && parseFloat(form.totalAmount) > 0 && (
              <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--primary-light)" }}>
                <p className="text-[13px] font-semibold" style={{ color: "var(--primary)" }}>
                  {formatCurrency(parseFloat(form.totalAmount))}
                </p>
              </div>
            )}

            {/* 8. Payment Terms */}
            <Field label="Payment Terms">
              <select value={form.paymentTerms} onChange={e => upd("paymentTerms", e.target.value)} className="field">
                <option value="">Select payment terms</option>
                {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>

            {/* 9. Payment Due Date (conditional) */}
            {needsDueDate && (
              <Field label="Payment Due Date">
                <input type="date" value={form.paymentDueDate} onChange={e => upd("paymentDueDate", e.target.value)} className="field" />
              </Field>
            )}

            {/* 10. Expected Delivery Date */}
            <Field label="Expected Delivery / Service Date">
              <input type="date" value={form.expectedDelivery} onChange={e => upd("expectedDelivery", e.target.value)} className="field" />
            </Field>
          </div>

          <div className="card p-5 space-y-4">
            {/* 11. Attachments */}
            <Field label="Attachment URL">
              <input type="url" placeholder="https://drive.google.com/…" value={form.attachmentUrl} onChange={e => upd("attachmentUrl", e.target.value)} className="field" />
              <p className="text-[11.5px] mt-1" style={{ color: "var(--text-3)" }}>Paste a Google Drive / Dropbox link to any supporting document.</p>
            </Field>

            {/* 12. Notes */}
            <Field label="Notes">
              <textarea placeholder="Any additional context…" value={form.notes} onChange={e => upd("notes", e.target.value)} rows={2} className="field resize-none" />
            </Field>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleSaveDraft} disabled={submitting} className="btn-ghost flex-1 justify-center">
              Save as Draft
            </button>
            <button onClick={handleSubmitForApproval} disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? "Submitting…" : "Submit for Approval"}
            </button>
          </div>
        </div>
      </div>

      {showAddVendor && (
        <AddVendorModal
          onAdd={v => { setForm(f => ({ ...f, vendorId: v.id, vendorName: v.name })); }}
          onClose={() => setShowAddVendor(false)}
        />
      )}
    </div>
  );
}
