"use client";
import { useState } from "react";
import { Search, Plus, Phone, Mail, MapPin, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { VENDORS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const filtered = VENDORS.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase()) ||
    v.contactName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Vendors" subtitle={`${VENDORS.length} vendors`} action={{ label: "Add Vendor", href: "/vendors/new" }} />

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AEAEB2]" />
          <input
            type="text"
            placeholder="Search vendors by name, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-[#E8E8ED] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#0071E3] placeholder:text-[#AEAEB2]"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(vendor => (
            <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="group">
              <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#D2D2D7] transition-all duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1D1D1F] flex items-center justify-center shrink-0">
                      <span className="text-white text-[12px] font-semibold">
                        {vendor.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-[#1D1D1F] leading-tight group-hover:text-[#0071E3] transition-colors">
                        {vendor.name}
                      </h3>
                      <p className="text-[11.5px] text-[#8E8E93] mt-0.5">{vendor.contactName}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#636366] bg-[#F5F5F7] px-2 py-1 rounded-lg whitespace-nowrap">
                    {vendor.category}
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-[12px] text-[#636366]">
                    <Phone size={11} className="text-[#AEAEB2] shrink-0" />
                    {vendor.phone}
                  </div>
                  {vendor.email && (
                    <div className="flex items-center gap-2 text-[12px] text-[#636366]">
                      <Mail size={11} className="text-[#AEAEB2] shrink-0" />
                      {vendor.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[12px] text-[#636366]">
                    <MapPin size={11} className="text-[#AEAEB2] shrink-0" />
                    {vendor.location}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F5F5F7]">
                  <div>
                    <p className="text-[11px] text-[#8E8E93] font-medium uppercase tracking-wide">Total Paid</p>
                    <p className="text-[14px] font-semibold text-[#34C759] mt-0.5">{formatCurrency(vendor.totalPaid)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {vendor.totalPending > 0 && <AlertCircle size={10} className="text-[#FF9F0A]" />}
                      <p className="text-[11px] text-[#8E8E93] font-medium uppercase tracking-wide">Outstanding</p>
                    </div>
                    <p className={`text-[14px] font-semibold mt-0.5 ${vendor.totalPending > 0 ? "text-[#FF3B30]" : "text-[#8E8E93]"}`}>
                      {vendor.totalPending > 0 ? formatCurrency(vendor.totalPending) : "—"}
                    </p>
                  </div>
                </div>

                {/* UPI */}
                {vendor.upiId && (
                  <div className="mt-3 pt-3 border-t border-[#F5F5F7] flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#0071E3] bg-[#E8F1FB] px-2 py-0.5 rounded">UPI</span>
                    <span className="text-[11.5px] text-[#636366] font-mono">{vendor.upiId}</span>
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
