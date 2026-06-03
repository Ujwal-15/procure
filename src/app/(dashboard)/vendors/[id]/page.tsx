"use client";
import { use, useState } from "react";
import { ArrowLeft, Phone, Mail, MapPin, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatDate, PAYMENT_STATUS_CONFIG, VENDOR_CATEGORIES } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { useCurrentUser } from "@/contexts/UserContext";
import type { Vendor } from "@/types";

type Tab = "info" | "banking" | "gst" | "procurements";

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }             = use(params);
  const { vendors, requests, updateVendor } = useData();
  const { currentUser }    = useCurrentUser();
  const vendor             = vendors.find(v => v.id === id);
  const linkedRequests     = requests.filter(r => r.vendorId === id);
  const totalSpend         = linkedRequests.reduce((s, r) => s + r.totalAmount, 0);

  const [tab,     setTab]     = useState<Tab>("info");
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState<Partial<Vendor>>(vendor ?? {});

  const canEditBasic   = currentUser.role !== "management";
  const canEditFinance = currentUser.role === "finance" || currentUser.role === "developer";

  if (!vendor) {
    return (
      <div className="anim-fade p-6">
        <Link href="/vendors" className="inline-flex items-center gap-1.5 text-[13px]" style={{ color: "var(--text-3)" }}><ArrowLeft size={14} /> Back</Link>
        <p className="text-[14px] font-semibold text-1 mt-6">Vendor not found</p>
      </div>
    );
  }

  const upd = (k: keyof Vendor, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await updateVendor(id, form);
    setSaving(false);
    setEditing(false);
  };

  const Field = ({ label, value, field, type = "text" }: { label: string; value?: string; field: keyof Vendor; type?: string }) => (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>{label}</p>
      {editing && (canEditBasic || canEditFinance) ? (
        <input type={type} value={(form[field] as string) ?? ""} onChange={e => upd(field, e.target.value)} className="field text-[13px]" />
      ) : (
        <p className="text-[13px] font-medium text-1">{value ?? "—"}</p>
      )}
    </div>
  );

  const SelectField = ({ label, value, field, options }: { label: string; value?: string; field: keyof Vendor; options: string[] }) => (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>{label}</p>
      {editing ? (
        <select value={(form[field] as string) ?? ""} onChange={e => upd(field, e.target.value)} className="field text-[13px]">
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <p className="text-[13px] font-medium text-1">{value ?? "—"}</p>
      )}
    </div>
  );

  return (
    <div className="anim-fade">
      <Header title={vendor.name} subtitle={vendor.category} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/vendors" className="inline-flex items-center gap-1.5 text-[13px] font-medium" style={{ color: "var(--text-3)" }}>
            <ArrowLeft size={14} /> Back to vendors
          </Link>
          {canEditBasic && !editing && (
            <button onClick={() => setEditing(true)} className="btn-ghost gap-1.5 text-[13px]"><Edit2 size={14} /> Edit</button>
          )}
          {editing && (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); setForm(vendor); }} className="btn-ghost gap-1.5 text-[13px]"><X size={14} /> Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary gap-1.5 text-[13px]"><Save size={14} />{saving ? "Saving…" : "Save"}</button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Spend",    value: formatCurrency(totalSpend),        color: "var(--primary)" },
            { label: "Procurements",   value: String(linkedRequests.length),      color: "var(--text-1)"  },
            { label: "GST Type",       value: vendor.gstType ?? "Unregistered",   color: "var(--text-2)"  },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>{s.label}</p>
              <p className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="card p-0 overflow-hidden">
          <div className="flex border-b px-4 pt-3" style={{ borderColor: "var(--border)" }}>
            {(["info","banking","gst","procurements"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-3 pb-3 mr-2 text-[12.5px] font-medium capitalize border-b-2 transition-colors"
                style={{ color: tab === t ? "var(--primary)" : "var(--text-3)", borderBottomColor: tab === t ? "var(--primary)" : "transparent" }}>
                {t === "info" ? "Basic Info" : t === "banking" ? "Banking" : t === "gst" ? "GST" : "Procurements"}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === "info" && (
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Category" value={form.category ?? vendor.category} field="category" options={VENDOR_CATEGORIES} />
                <Field label="Contact Person" value={form.contactName ?? vendor.contactName} field="contactName" />
                <Field label="Phone" value={form.phone ?? vendor.phone} field="phone" />
                <Field label="Email" value={form.email ?? vendor.email} field="email" type="email" />
                <div className="col-span-2">
                  <Field label="Address" value={form.address ?? vendor.address} field="address" />
                </div>
                <div className="col-span-2">
                  <Field label="Notes" value={form.notes ?? vendor.notes} field="notes" />
                </div>
              </div>
            )}

            {tab === "banking" && (
              canEditFinance ? (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Bank Name"           value={form.bankName ?? vendor.bankName}                   field="bankName"           />
                  <Field label="Account Holder"      value={form.accountHolderName ?? vendor.accountHolderName} field="accountHolderName"  />
                  <Field label="Account Number"      value={form.accountNumber ?? vendor.accountNumber}         field="accountNumber"      />
                  <Field label="IFSC Code"           value={form.ifscCode ?? vendor.ifscCode}                   field="ifscCode"           />
                  <SelectField label="Account Type"  value={form.accountType ?? vendor.accountType ?? "Current"} field="accountType"       options={["Current","Savings"]} />
                  <Field label="UPI ID"              value={form.upiId ?? vendor.upiId}                         field="upiId"              />
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Banking details are visible to Finance and Developer only.</p>
                </div>
              )
            )}

            {tab === "gst" && (
              canEditFinance ? (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="GSTIN"               value={form.gstin ?? vendor.gstin}                           field="gstin"              />
                  <SelectField label="GST Type"      value={form.gstType ?? vendor.gstType ?? "Unregistered"}      field="gstType"            options={["Regular","Composition","Unregistered"]} />
                  <div className="col-span-2">
                    <Field label="GST Registration Name" value={form.gstRegistrationName ?? vendor.gstRegistrationName} field="gstRegistrationName" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>GST details are visible to Finance and Developer only.</p>
                </div>
              )
            )}

            {tab === "procurements" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-semibold text-1">Total: {formatCurrency(totalSpend)}</p>
                  <span className="text-[12px]" style={{ color: "var(--text-3)" }}>{linkedRequests.length} entries</span>
                </div>
                {linkedRequests.length === 0 ? (
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No procurements linked to this vendor yet.</p>
                ) : (
                  <div className="space-y-2">
                    {linkedRequests.map(r => {
                      const pmCfg = PAYMENT_STATUS_CONFIG[r.paymentStatus];
                      return (
                        <Link key={r.id} href={`/procurement/${r.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors">
                          <div>
                            <p className="text-[13px] font-medium text-1">{r.title}</p>
                            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{formatDate(r.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-semibold text-1">{formatCurrency(r.totalAmount)}</p>
                            <Badge label={pmCfg.label} color={pmCfg.color} bg={pmCfg.bg} size="sm" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
