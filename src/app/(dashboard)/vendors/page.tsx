"use client";
import { useState } from "react";
import { Search, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatCurrency } from "@/lib/utils";
import { useData } from "@/contexts/DataContext";
import { useCurrentUser } from "@/contexts/UserContext";

export default function VendorsPage() {
  const { vendors } = useData();
  const { currentUser } = useCurrentUser();
  const [search, setSearch] = useState("");

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.category.toLowerCase().includes(search.toLowerCase()) ||
    v.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = currentUser.role === "finance" || currentUser.role === "developer";

  return (
    <div className="anim-fade">
      <Header
        title="Vendors"
        subtitle={vendors.length > 0 ? `${vendors.length} vendors` : "No vendors yet"}
        action={canEdit ? { label: "Add Vendor", href: "/vendors/new" } : undefined}
      />
      <div className="p-4 md:p-6 space-y-4">
        <div className="relative" style={{ maxWidth: 340 }}>
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input type="text" placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} className="field" style={{ paddingLeft: 36 }} />
        </div>

        {vendors.length === 0 ? (
          <div className="card p-10 flex flex-col items-center text-center gap-3">
            <p className="text-[15px] font-semibold text-1">No vendors yet</p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Add vendors to link them to procurement entries.</p>
            {canEdit && <Link href="/vendors/new" className="btn-primary mt-2">Add First Vendor</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(vendor => (
              <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="block">
                <div className="card p-5 transition-all cursor-pointer">
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

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
                      <Phone size={11} className="shrink-0" />{vendor.phone}
                    </div>
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
                        <Mail size={11} className="shrink-0" />{vendor.email}
                      </div>
                    )}
                    {vendor.address && (
                      <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-3)" }}>
                        <MapPin size={11} className="shrink-0" />{vendor.address}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-3)" }}>Total Spend</p>
                      <p className="text-[14px] font-bold" style={{ color: "var(--success)" }}>{formatCurrency(vendor.totalSpend)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--text-3)" }}>GST</p>
                      <p className="text-[12px]" style={{ color: "var(--text-2)" }}>{vendor.gstin ?? "Not registered"}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
