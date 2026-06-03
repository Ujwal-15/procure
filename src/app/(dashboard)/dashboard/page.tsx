"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, AlertTriangle, Clock, TrendingUp, Users } from "lucide-react";
import Header from "@/components/layout/Header";
import { formatCurrency, formatDate, PROCUREMENT_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, canCreateEntry, canApprove, canUpdatePayment } from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";
import DonutChart from "@/components/ui/DonutChart";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DEPT_COLORS: Record<string, string> = {
  "Equipment": "#006FBA", "Materials": "#00BDCD", "Labour": "#F59E0B",
  "Services": "#00AE5E", "Software": "#AF52DE", "Venue & Logistics": "#FF9F0A",
  "AV & Tech": "#F52F34", "Fabrication": "#8E8E93", "Marketing": "#34C759", "Other": "#9CA3AF",
};

function SpendBars({ data }: { data: { month: string; amount: number }[] }) {
  if (!data.length) return <div className="h-[140px] flex items-center justify-center"><p className="text-[13px]" style={{ color: "var(--text-3)" }}>No data yet</p></div>;
  const max = Math.max(...data.map(d => d.amount), 1);
  return (
    <div className="flex items-end gap-2 h-[140px]">
      {data.map((d, i) => {
        const pct = d.amount / max;
        const isLast = i === data.length - 1;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] font-semibold" style={{ color: isLast ? "var(--primary)" : "var(--text-3)" }}>
              {d.amount > 0 ? `₹${(d.amount/100000).toFixed(1)}L` : ""}
            </span>
            <div className="w-full relative rounded-lg overflow-hidden" style={{ height: "110px", backgroundColor: "var(--surface-2)" }}>
              <div className="absolute bottom-0 left-0 right-0 rounded-lg" style={{ height: `${Math.max(pct * 100, 2)}%`, background: isLast ? "linear-gradient(180deg,#00BDCD,#006FBA)" : "linear-gradient(180deg,#00BDCD,#006FBA)", opacity: isLast ? 1 : 0.6 }} />
            </div>
            <span className="text-[10px]" style={{ color: isLast ? "var(--primary)" : "var(--text-3)" }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useCurrentUser();
  const { requests, vendors, auditLogs, loading } = useData();
  const [period, setPeriod] = useState<"month" | "all">("month");

  const now   = new Date();
  const isThisMonth = (d: string) => { const dt = new Date(d); return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear(); };

  const active = useMemo(() => requests.filter(r => !["draft","rejected","cancelled"].includes(r.status)), [requests]);
  const scoped  = period === "month" ? active.filter(r => isThisMonth(r.createdAt)) : active;

  const totalSpend       = scoped.reduce((s, r) => s + r.totalAmount, 0);
  const pendingApprovals = requests.filter(r => r.status === "pending_approval").length;
  const outstanding      = requests.filter(r => !["fully_paid"].includes(r.paymentStatus) && !["draft","rejected","cancelled"].includes(r.status)).reduce((s, r) => s + (r.totalAmount - r.amountPaid), 0);
  const activeVendors    = vendors.filter(v => v.isActive).length;

  /* Spend by category */
  const catMap: Record<string, number> = {};
  scoped.forEach(r => { catMap[r.category] = (catMap[r.category] ?? 0) + r.totalAmount; });
  const spendByCategory = Object.entries(catMap).map(([label, value]) => ({ label, value, color: DEPT_COLORS[label] ?? "#9CA3AF" })).sort((a,b) => b.value - a.value).slice(0, 6);

  /* Monthly spend (last 6 months) */
  const spendByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const month = MONTHS[d.getMonth()];
    const amt = requests.filter(r => {
      const rd = new Date(r.createdAt);
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear() && !["draft","rejected","cancelled"].includes(r.status);
    }).reduce((s, r) => s + r.totalAmount, 0);
    return { month, amount: amt };
  });

  /* Top 5 vendors */
  const vendorSpend: Record<string, number> = {};
  requests.forEach(r => { if (r.vendorName) vendorSpend[r.vendorName] = (vendorSpend[r.vendorName] ?? 0) + r.totalAmount; });
  const topVendors = Object.entries(vendorSpend).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxVendor  = topVendors[0]?.[1] ?? 1;

  /* Recent activity */
  const recentActivity = auditLogs.slice(0, 10);

  const kpis = [
    { label: "Total Spend",          value: formatCurrency(totalSpend),      sub: period === "month" ? "This month" : "All time",       icon: TrendingUp,    color: "var(--primary)",  bg: "var(--primary-light)" },
    { label: "Pending Approvals",    value: String(pendingApprovals),         sub: "Awaiting sign-off",                                    icon: Clock,         color: "var(--warning)",  bg: "var(--warning-bg)"   },
    { label: "Outstanding Payments", value: formatCurrency(outstanding),       sub: "Unpaid balance",                                       icon: AlertTriangle, color: "var(--danger)",   bg: "var(--danger-bg)"    },
    { label: "Active Vendors",       value: String(activeVendors),             sub: "In vendor directory",                                  icon: Users,         color: "var(--success)",  bg: "var(--success-bg)"   },
  ];

  return (
    <div className="anim-fade">
      <Header
        title={`Good day, ${currentUser.name.split(" ")[0]}`}
        subtitle="4Brains Procurement"
        action={canCreateEntry(currentUser.role) ? { label: "New Procurement", href: "/procurement/new" } : undefined}
      />

      <div className="p-4 md:p-6 space-y-5">

        {/* Period toggle */}
        <div className="flex items-center gap-2">
          {(["month","all"] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
              style={{ backgroundColor: period === p ? "var(--primary)" : "var(--surface-2)", color: period === p ? "#fff" : "var(--text-3)" }}>
              {p === "month" ? "This Month" : "All Time"}
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(k => (
            <Link
              key={k.label}
              href={k.label === "Pending Approvals" ? "/approvals" : k.label === "Outstanding Payments" ? "/payments" : k.label === "Active Vendors" ? "/vendors" : "#"}
              className="card p-5 block"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-3 mb-2">{k.label}</p>
                  <p className="text-[20px] font-bold text-1 leading-none">{k.value}</p>
                  <p className="text-[11.5px] text-3 mt-1.5">{k.sub}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: k.bg }}>
                  <k.icon size={16} style={{ color: k.color }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 card p-5">
            <h3 className="text-[14px] font-semibold text-1 mb-1">Monthly Spend Trend</h3>
            <p className="text-[12px] text-3 mb-4">Last 6 months · approved entries</p>
            <SpendBars data={spendByMonth} />
          </div>

          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(160deg,#001E3C,#00437A)" }}>
            <h3 className="text-[13px] font-semibold mb-1" style={{ color: "#fff" }}>Spend by Category</h3>
            <p className="text-[11px] mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{period === "month" ? "This month" : "All time"}</p>
            {spendByCategory.length > 0 ? (
              <DonutChart data={spendByCategory} size={150} dark
                centerLabel={`₹${(spendByCategory.reduce((s,d)=>s+d.value,0)/100000).toFixed(1)}L`} />
            ) : (
              <div className="h-[140px] flex items-center justify-center">
                <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top vendors */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-1">Top Vendors</h3>
              <Link href="/vendors" className="text-[12px] font-semibold" style={{ color: "var(--primary)" }}>View all →</Link>
            </div>
            {topVendors.length > 0 ? (
              <div className="space-y-3">
                {topVendors.map(([name, amt]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12.5px] font-medium text-1 truncate flex-1">{name}</span>
                      <span className="text-[12px] font-semibold shrink-0 ml-2 text-1">{formatCurrency(amt)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${(amt/maxVendor)*100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No vendor data yet</p>
            )}
          </div>

          {/* Recent activity */}
          <div className="md:col-span-2 card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-[14px] font-semibold text-1">Recent Activity</h3>
            </div>
            {recentActivity.length > 0 ? (
              recentActivity.map(log => (
                <Link key={log.id} href={log.procurementId ? `/procurement/${log.procurementId}` : "#"}
                  className="tbl-row flex items-center gap-3 px-5 py-3">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-[9px] font-bold">{log.userName.slice(0,2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-1"><span className="font-semibold">{log.userName.split(" ")[0]}</span> · {log.action}</p>
                    <p className="text-[11px] text-3">{log.createdAt.replace("T"," ").slice(0,16)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex items-center justify-center py-10">
                <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No activity yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Role-specific shortcuts */}
        {canApprove(currentUser.role) && pendingApprovals > 0 && (
          <Link href="/approvals" className="card p-5 flex items-center justify-between border-l-4" style={{ borderLeftColor: "var(--warning)" }}>
            <div>
              <p className="text-[14px] font-semibold text-1">{pendingApprovals} procurement{pendingApprovals > 1 ? "s" : ""} awaiting your approval</p>
              <p className="text-[12px] text-3">Review and approve or reject</p>
            </div>
            <ArrowRight size={18} style={{ color: "var(--warning)" }} />
          </Link>
        )}
        {canUpdatePayment(currentUser.role) && (
          <Link href="/payments" className="card p-5 flex items-center justify-between border-l-4" style={{ borderLeftColor: "var(--primary)" }}>
            <div>
              <p className="text-[14px] font-semibold text-1">Payments to update</p>
              <p className="text-[12px] text-3">{formatCurrency(outstanding)} outstanding across all entries</p>
            </div>
            <ArrowRight size={18} style={{ color: "var(--primary)" }} />
          </Link>
        )}
      </div>
    </div>
  );
}
