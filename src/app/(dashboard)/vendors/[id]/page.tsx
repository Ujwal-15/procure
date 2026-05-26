"use client";
import { use } from "react";
import { ArrowLeft, Phone, Mail, MapPin, CreditCard, FileText } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { VENDORS, INVOICES } from "@/lib/mock-data";
import { formatCurrency, formatDate, INVOICE_STATUS_CONFIG } from "@/lib/utils";

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const vendor = VENDORS.find(v => v.id === id) || VENDORS[0];
  const vendorInvoices = INVOICES.filter(i => i.vendorId === vendor.id);

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title={vendor.name} subtitle={vendor.category} />
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Link href="/vendors" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#636366] hover:text-[#1D1D1F] transition-colors">
          <ArrowLeft size={14} /> Back to vendors
        </Link>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Paid", value: formatCurrency(vendor.totalPaid), color: "#34C759" },
            { label: "Outstanding", value: formatCurrency(vendor.totalPending), color: vendor.totalPending > 0 ? "#FF3B30" : "#8E8E93" },
            { label: "Total Business", value: formatCurrency(vendor.totalPaid + vendor.totalPending), color: "#1D1D1F" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8ED] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wide">{s.label}</p>
              <p className="text-[22px] font-semibold mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-[13px] font-semibold text-[#1D1D1F] mb-4">Contact Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] flex items-center justify-center"><Phone size={13} className="text-[#636366]" /></div>
                <div><p className="text-[11px] text-[#8E8E93]">Phone</p><p className="text-[13px] font-medium text-[#1D1D1F]">{vendor.phone}</p></div>
              </div>
              {vendor.email && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] flex items-center justify-center"><Mail size={13} className="text-[#636366]" /></div>
                  <div><p className="text-[11px] text-[#8E8E93]">Email</p><p className="text-[13px] font-medium text-[#1D1D1F]">{vendor.email}</p></div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] flex items-center justify-center"><MapPin size={13} className="text-[#636366]" /></div>
                <div><p className="text-[11px] text-[#8E8E93]">Location</p><p className="text-[13px] font-medium text-[#1D1D1F]">{vendor.location}</p></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-[13px] font-semibold text-[#1D1D1F] mb-4">Payment Info</h3>
            <div className="space-y-3">
              {vendor.upiId && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#E8F1FB] flex items-center justify-center"><CreditCard size={13} className="text-[#0071E3]" /></div>
                  <div><p className="text-[11px] text-[#8E8E93]">UPI ID</p><p className="text-[13px] font-mono font-medium text-[#1D1D1F]">{vendor.upiId}</p></div>
                </div>
              )}
              {vendor.bankName && (
                <>
                  <div><p className="text-[11px] text-[#8E8E93]">Bank</p><p className="text-[13px] font-medium text-[#1D1D1F]">{vendor.bankName}</p></div>
                  <div><p className="text-[11px] text-[#8E8E93]">IFSC</p><p className="text-[13px] font-mono font-medium text-[#1D1D1F]">{vendor.ifscCode}</p></div>
                </>
              )}
              {!vendor.upiId && !vendor.bankName && (
                <p className="text-[13px] text-[#AEAEB2]">No payment details added</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice history */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5F5F7]">
            <h3 className="text-[14px] font-semibold text-[#1D1D1F]">Invoice History</h3>
          </div>
          {vendorInvoices.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <FileText size={24} className="text-[#D2D2D7] mx-auto mb-2" />
              <p className="text-[13px] text-[#AEAEB2]">No invoices found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F5F7]">
              {vendorInvoices.map(inv => {
                const cfg = INVOICE_STATUS_CONFIG[inv.status];
                return (
                  <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[#1D1D1F]">#{inv.invoiceNumber}</p>
                      <p className="text-[11.5px] text-[#8E8E93]">{inv.eventName || "General"} · Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-[#1D1D1F]">{formatCurrency(inv.balanceDue)}</p>
                      <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size="sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
