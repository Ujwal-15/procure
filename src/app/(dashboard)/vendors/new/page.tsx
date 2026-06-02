"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";

const CATEGORIES = [
  "AV & Production", "Equipment Rental", "Lighting & SFX", "Logistics & Transport",
  "Printing & Branding", "Electronics & Components", "Fabrication & Decor",
  "IT & Software", "Catering", "Security", "Other",
];

export default function NewVendorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", contactName: "", phone: "", email: "", category: "", location: "",
    bankName: "", accountNumber: "", ifscCode: "", upiId: "", notes: "",
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/vendors");
  };

  return (
    <div className="anim-fade">
      <Header title="Add New Vendor" />
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/vendors" className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-5 transition-colors" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={14} /> Back to vendors
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor info */}
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-1 mb-4">Vendor Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-1 mb-1.5">Company / Vendor Name <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" placeholder="e.g. Sharma AV Solutions" value={form.name} onChange={e => update("name", e.target.value)} required className="field" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Category <span style={{ color: "var(--danger)" }}>*</span></label>
                <select value={form.category} onChange={e => update("category", e.target.value)} className="field">
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Contact Person <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" placeholder="e.g. Rajesh Sharma" value={form.contactName} onChange={e => update("contactName", e.target.value)} required className="field" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Phone Number <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" placeholder="+91 98765 43210" value={form.phone} onChange={e => update("phone", e.target.value)} required className="field" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Email Address</label>
                <input type="email" placeholder="vendor@email.com" value={form.email} onChange={e => update("email", e.target.value)} className="field" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">City / Location</label>
                <input type="text" placeholder="e.g. Mumbai" value={form.location} onChange={e => update("location", e.target.value)} className="field" />
              </div>
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-1 mb-1.5">
                  Notes <span className="font-normal" style={{ color: "var(--text-3)" }}>(optional)</span>
                </label>
                <textarea
                  placeholder="Payment terms, preferred contact time, any other notes..."
                  value={form.notes}
                  onChange={e => update("notes", e.target.value)}
                  rows={2}
                  className="field resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-1 mb-4">Payment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[12px] font-medium text-1 mb-1.5">UPI ID</label>
                <input type="text" placeholder="vendor@hdfc" value={form.upiId} onChange={e => update("upiId", e.target.value)} className="field font-mono" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Bank Name</label>
                <input type="text" placeholder="e.g. HDFC Bank" value={form.bankName} onChange={e => update("bankName", e.target.value)} className="field" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">Account Number</label>
                <input type="text" placeholder="XXXX XXXX XXXX" value={form.accountNumber} onChange={e => update("accountNumber", e.target.value)} className="field font-mono" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-1 mb-1.5">IFSC Code</label>
                <input type="text" placeholder="HDFC0001234" value={form.ifscCode} onChange={e => update("ifscCode", e.target.value)} className="field font-mono" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/vendors" className="btn-ghost flex-1 justify-center">Cancel</Link>
            <button type="submit" className="btn-primary flex-1 justify-center">Add Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
}
