"use client";
import { useState } from "react";
import { Plus, Calendar, MapPin, IndianRupee } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { EVENTS, INVOICES, REQUESTS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CFG = {
  upcoming:  { label: "Upcoming",  color: "#0071E3", bg: "#E8F1FB" },
  active:    { label: "Active",    color: "#34C759", bg: "#F0FAF3" },
  completed: { label: "Completed", color: "#636366", bg: "#F5F5F7" },
  cancelled: { label: "Cancelled", color: "#FF3B30", bg: "#FFF2F1" },
};

export default function EventsPage() {
  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Events & Projects" subtitle={`${EVENTS.length} events`} action={{ label: "New Event", href: "/events/new" }} />

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {EVENTS.map(event => {
          const eventRequests = REQUESTS.filter(r => r.eventName === event.name);
          const eventInvoices = INVOICES.filter(i => i.eventName === event.name);
          const totalSpent = eventInvoices.reduce((s, i) => s + i.grossAmount, 0);
          const pending = eventInvoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.balanceDue, 0);
          const cfg = STATUS_CFG[event.status];
          const budgetPct = event.estimatedBudget > 0 ? Math.min(100, Math.round((totalSpent / event.estimatedBudget) * 100)) : 0;

          return (
            <div key={event.id} className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:border-[#D2D2D7] transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1D1D1F] leading-tight">{event.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin size={11} className="text-[#AEAEB2]" />
                    <span className="text-[12px] text-[#8E8E93] capitalize">{event.location}</span>
                    <span className="text-[#E8E8ED]">·</span>
                    <Calendar size={11} className="text-[#AEAEB2]" />
                    <span className="text-[12px] text-[#8E8E93]">{formatDate(event.eventDate)}</span>
                  </div>
                </div>
                <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size="sm" />
              </div>

              {/* Budget bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#8E8E93] font-medium">Budget Used</span>
                  <span className="text-[11px] font-semibold text-[#1D1D1F]">{budgetPct}%</span>
                </div>
                <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${budgetPct}%`,
                      backgroundColor: budgetPct > 90 ? "#FF3B30" : budgetPct > 70 ? "#FF9F0A" : "#34C759",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11.5px] text-[#636366]">{formatCurrency(totalSpent)} spent</span>
                  <span className="text-[11.5px] text-[#8E8E93]">of {formatCurrency(event.estimatedBudget)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#F5F5F7]">
                <div className="text-center">
                  <p className="text-[16px] font-semibold text-[#1D1D1F]">{eventRequests.length}</p>
                  <p className="text-[11px] text-[#8E8E93]">Requests</p>
                </div>
                <div className="text-center">
                  <p className="text-[16px] font-semibold text-[#1D1D1F]">{eventInvoices.length}</p>
                  <p className="text-[11px] text-[#8E8E93]">Invoices</p>
                </div>
                <div className="text-center">
                  <p className={`text-[14px] font-semibold ${pending > 0 ? "text-[#FF3B30]" : "text-[#8E8E93]"}`}>
                    {pending > 0 ? formatCurrency(pending) : "—"}
                  </p>
                  <p className="text-[11px] text-[#8E8E93]">Due</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add event CTA */}
        <Link href="/events/new" className="flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border-2 border-dashed border-[#E8E8ED] p-8 hover:border-[#0071E3] hover:bg-[#E8F1FB]/30 transition-all group min-h-[200px]">
          <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] group-hover:bg-[#E8F1FB] flex items-center justify-center transition-colors">
            <Plus size={18} className="text-[#8E8E93] group-hover:text-[#0071E3] transition-colors" />
          </div>
          <span className="text-[13px] font-medium text-[#8E8E93] group-hover:text-[#0071E3] transition-colors">Add New Event</span>
        </Link>
      </div>
    </div>
  );
}
