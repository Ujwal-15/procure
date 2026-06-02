"use client";
import { use } from "react";
import { ArrowLeft, Phone, Mail, MapPin, CreditCard, FileText } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { useData } from "@/contexts/DataContext";
import { formatCurrency, formatDate, INVOICE_STATUS_CONFIG } from "@/lib/utils";

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { vendors, invoices } = useData();
  const vendor = vendors.find(v => v.id === id) ?? vendors[0];
  const vendorInvoices = invoices.filter(i => i.vendorId === (vendor?.id ?? ""));

  if (!vendor) {
    return (
      <div className="anim-fade p-6">
        <Link href="/vendors" className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <p className="text-[14px] font-semibold text-1 mt-6">Vendor not found</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Paid",       value: formatCurrency(vendor.totalPaid),                              color: "var(--success)" },
    { label: "Outstanding",      value: formatCurrency(vendor.totalPending),                            color: vendor.totalPending > 0 ? "var(--danger)" : "var(--text-3)" },
    { label: "Total Business",   value: formatCurrency(vendor.totalPaid + vendor.totalPending),         color: "var(--primary)" },
  ];

  return (
    <div className="anim-fade">
      <Header title={vendor.name} subtitle={vendor.category} />
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Link href="/vendors" className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors" style={{ color: "var(--text-3)" }}>
          <ArrowLeft size={14} /> Back to vendors
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-3)" }}>{s.label}</p>
              <p className="text-[22px] font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Contact */}
          <div className="card p-5">
            <h3 className="text-[13px] font-semibold text-1 mb-4">Contact Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--surface-2)" }}>
                  <Phone size={13} style={{ color: "var(--text-3)" }} />
                </div>
                <div>
                  <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Phone</p>
                  <p className="text-[13px] font-medium text-1">{vendor.phone}</p>
                </div>
              </div>
              {vendor.email && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--surface-2)" }}>
                    <Mail size={13} style={{ color: "var(--text-3)" }} />
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Email</p>
                    <p className="text-[13px] font-medium text-1">{vendor.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--surface-2)" }}>
                  <MapPin size={13} style={{ color: "var(--text-3)" }} />
                </div>
                <div>
                  <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Location</p>
                  <p className="text-[13px] font-medium text-1">{vendor.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="card p-5">
            <h3 className="text-[13px] font-semibold text-1 mb-4">Payment Info</h3>
            <div className="space-y-3">
              {vendor.upiId && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--primary-light)" }}>
                    <CreditCard size={13} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: "var(--text-3)" }}>UPI ID</p>
                    <p className="text-[13px] font-mono font-medium text-1">{vendor.upiId}</p>
                  </div>
                </div>
              )}
              {vendor.bankName && (
                <>
                  <div>
                    <p className="text-[11px]" style={{ color: "var(--text-3)" }}>Bank</p>
                    <p className="text-[13px] font-medium text-1">{vendor.bankName}</p>
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: "var(--text-3)" }}>IFSC</p>
                    <p className="text-[13px] font-mono font-medium text-1">{(vendor as {ifscCode?: string}).ifscCode}</p>
                  </div>
                </>
              )}
              {!vendor.upiId && !vendor.bankName && (
                <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No payment details added</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice history */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-[14px] font-semibold text-1">Invoice History</h3>
          </div>
          {vendorInvoices.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <FileText size={24} className="mx-auto mb-2" style={{ color: "var(--border)" }} />
              <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No invoices found</p>
            </div>
          ) : (
            <div>
              {vendorInvoices.map(inv => {
                const cfg = INVOICE_STATUS_CONFIG[inv.status];
                return (
                  <div key={inv.id} className="tbl-row flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-1">#{inv.invoiceNumber}</p>
                      <p className="text-[11.5px]" style={{ color: "var(--text-3)" }}>
                        {inv.eventName || "General"} · Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-1">{formatCurrency(inv.balanceDue)}</p>
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
