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

  const fieldGroups = [
    {
      title: "Vendor Information",
      fields: [
        { key: "name", label: "Company / Vendor Name", placeholder: "e.g. Sharma AV Solutions", required: true, col: 2 },
        { key: "contactName", label: "Contact Person", placeholder: "e.g. Rajesh Sharma", required: true, col: 1 },
        { key: "phone", label: "Phone Number", placeholder: "+91 98765 43210", required: true, col: 1 },
        { key: "email", label: "Email Address", placeholder: "vendor@email.com", required: false, col: 1 },
        { key: "location", label: "City / Location", placeholder: "e.g. Mumbai", required: false, col: 1 },
      ],
    },
    {
      title: "Payment Details",
      fields: [
        { key: "upiId", label: "UPI ID", placeholder: "vendor@hdfc", required: false, col: 2 },
        { key: "bankName", label: "Bank Name", placeholder: "e.g. HDFC Bank", required: false, col: 1 },
        { key: "accountNumber", label: "Account Number", placeholder: "XXXX XXXX XXXX", required: false, col: 1 },
        { key: "ifscCode", label: "IFSC Code", placeholder: "HDFC0001234", required: false, col: 1 },
      ],
    },
  ];

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Add New Vendor" />
      <div className="p-6 max-w-2xl mx-auto">
        <Link href="/vendors" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#636366] hover:text-[#1D1D1F] mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to vendors
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fieldGroups.map(group => (
            <div key={group.title} className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <h2 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">{group.title}</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Category select (only in first group) */}
                {group.title === "Vendor Information" && (
                  <div>
                    <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">
                      Category <span className="text-[#FF3B30]">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={e => update("category", e.target.value)}
                      className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] bg-white"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                {group.fields.map(f => (
                  <div key={f.key} className={f.col === 2 ? "col-span-2" : ""}>
                    <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">
                      {f.label} {f.required && <span className="text-[#FF3B30]">*</span>}
                    </label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => update(f.key, e.target.value)}
                      required={f.required}
                      className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
                    />
                  </div>
                ))}
              </div>
              {group.title === "Vendor Information" && (
                <div className="mt-4">
                  <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">Notes <span className="text-[#8E8E93] font-normal">(optional)</span></label>
                  <textarea
                    placeholder="Payment terms, preferred contact time, any other notes..."
                    value={form.notes}
                    onChange={e => update("notes", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2] resize-none"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3">
            <Link href="/vendors" className="flex-1 py-3 text-[13px] font-medium text-center text-[#636366] border border-[#E8E8ED] rounded-xl hover:bg-[#F5F5F7] transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 py-3 text-[13px] font-semibold text-white bg-[#1D1D1F] rounded-xl hover:bg-[#3A3A3C] transition-colors"
            >
              Add Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
