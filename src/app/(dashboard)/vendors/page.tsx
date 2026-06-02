"use client";
import { useState } from "react";
import { Search, Phone, Mail, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatCurrency } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";

export default function VendorsPage() {
  const { vendors: VENDORS } = useData();
  const [search, setSearch] = useState("");
  const filtered = VENDORS.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase()) ||
    v.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="anim-fade">
      <Header title="Vendors" subtitle={VENDORS.length > 0 ? `${VENDORS.length} vendors` : "No vendors yet"} action={{ label: "Add Vendor", href: "/vendors/new" }} />

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input
            type="text"
            placeholder="Search vendors by name, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field"
            style={{ paddingLeft: 36 }}
          />
        </div>

        {/* Empty state */}
        {VENDORS.length === 0 && (
          <div className="card p-10 flex flex-col items-center text-center gap-3">
            <p className="text-[15px] font-semibold text-1">No vendors yet</p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Add vendors to link them to invoices and payments.</p>
            <Link href="/vendors/new" className="btn-primary mt-2">Add First Vendor</Link>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(vendor => (
            <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="block">
              <div className="card p-5 transition-all cursor-pointer">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-white text-[12px] font-bold">{vendor.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-1 leading-tight">{vendor.name}</h3>
                      <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-3)" }}>{vendor.contactName}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-1 rounded-lg whitespace-nowrap" style={{ color: "var(--text-3)", backgroundColor: "var(--surface-2)" }}>
                    {vendor.category}
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
                    <Phone size={11} className="shrink-0" />
                    {vendor.phone}
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
                      <Mail size={11} className="shrink-0" />
                      {vendor.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
                    <MapPin size={11} className="shrink-0" />
                    {vendor.location}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-3)" }}>Total Paid</p>
                    <p className="text-[14px] font-bold" style={{ color: "var(--success)" }}>{formatCurrency(vendor.totalPaid)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      {vendor.totalPending > 0 && <AlertCircle size={10} style={{ color: "var(--warning)" }} />}
                      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Outstanding</p>
                    </div>
                    <p className="text-[14px] font-bold" style={{ color: vendor.totalPending > 0 ? "var(--danger)" : "var(--text-3)" }}>
                      {vendor.totalPending > 0 ? formatCurrency(vendor.totalPending) : "—"}
                    </p>
                  </div>
                </div>

                {vendor.upiId && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-1.5" style={{ borderColor: "var(--border)" }}>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: "var(--primary)", backgroundColor: "var(--primary-light)" }}>UPI</span>
                    <span className="text-[11.5px] font-mono" style={{ color: "var(--text-3)" }}>{vendor.upiId}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
