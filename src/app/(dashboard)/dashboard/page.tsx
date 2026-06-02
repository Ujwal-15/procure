"use client";
import { AlertTriangle, Clock, TrendingUp, CheckSquare, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { INVOICES, APPROVALS, SPEND_BY_MONTH, SPEND_BY_DEPARTMENT, TOP_VENDORS, CURRENT_USER, REQUESTS } from "@/lib/mock-data";
import { formatCurrency, formatDate, getDaysOverdue, INVOICE_STATUS_CONFIG, DEPARTMENT_LABELS } from "@/lib/utils";
import DonutChart from "@/components/ui/DonutChart";

/* ── Custom bar chart — pure CSS ── */
function SpendBars({ data }: { data: { month: string; amount: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[160px] flex items-center justify-center mt-2">
        <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No spend data yet</p>
      </div>
    );
  }
  const max = Math.max(...data.map(d => d.amount));
  return (
    <div className="flex items-end gap-2.5 h-[160px] mt-2">
      {data.map(d => {
        const pct = d.amount / max;
        const isLast = d.month === data[data.length - 1].month;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold" style={{ color: "var(--text-3)" }}>
              ₹{(d.amount / 100000).toFixed(1)}L
            </span>
            <div
              className="w-full relative rounded-xl overflow-hidden"
              style={{ height: "130px", backgroundColor: "var(--surface-2)" }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-xl transition-all"
                style={{
                  height: `${pct * 100}%`,
                  background: isLast
                    ? "linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)"
                    : "linear-gradient(180deg, #818CF8 0%, #6366F1 100%)",
                  opacity: isLast ? 1 : 0.7,
                }}
              />
            </div>
            <span className="text-[10.5px]" style={{ color: "var(--text-3)" }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}


export default function DashboardPage() {
  const overdue      = INVOICES.filter(i => i.status === "overdue");
  const dueSoon      = INVOICES.filter(i => i.status === "pending" || i.status === "partially_paid");
  const totalOverdue = overdue.reduce((s, i) => s + i.balanceDue, 0);
  const totalDue     = dueSoon.reduce((s, i) => s + i.balanceDue, 0);
  const pendingApprv = APPROVALS.filter(a => a.status === "pending").length;

  const pending = [...INVOICES]
    .filter(i => i.status !== "paid")
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const actions = [
    { label: "Drafts",    count: REQUESTS.filter(r => r.status === "draft").length, href: "/procurement" },
    { label: "Approvals", count: pendingApprv,                                       href: "/approvals"   },
    { label: "Overdue",   count: overdue.length,                                     href: "/invoices"    },
    { label: "Due Soon",  count: dueSoon.length,                                     href: "/invoices"    },
  ];

  const hasAnyData = REQUESTS.length > 0 || INVOICES.length > 0;

  return (
    <div className="anim-fade">
      <Header title="Dashboard" subtitle={`Good day, ${CURRENT_USER.name}`} action={{ label: "New Request", href: "/procurement/new" }} />

      <div className="p-6 space-y-5">

        {/* Action bar */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="text-[11px] font-semibold text-3 uppercase tracking-widest">Needs your action</span>
          </div>
          <div className="grid grid-cols-4 divide-x" style={{ borderColor: "var(--border)" }}>
            {actions.map(a => (
              <Link key={a.label} href={a.href}
                className="flex items-center justify-between px-5 py-4 hover:bg-[var(--surface-2)] transition-colors group"
              >
                <div>
                  <p className="text-[26px] font-bold text-1 leading-none">{a.count}</p>
                  <p className="text-[12px] text-3 mt-1">{a.label}</p>
                </div>
                <ArrowRight size={14} className="text-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Overdue",     value: totalOverdue > 0 ? formatCurrency(totalOverdue) : "—", sub: overdue.length > 0 ? `${overdue.length} vendors` : "None", icon: AlertTriangle, color: "var(--danger)",  bg: "var(--danger-bg)"    },
            { label: "Due Soon",    value: totalDue > 0 ? formatCurrency(totalDue) : "—",         sub: dueSoon.length > 0 ? `${dueSoon.length} invoices` : "None", icon: Clock,         color: "var(--warning)", bg: "var(--warning-bg)"   },
            { label: "Month Spend", value: SPEND_BY_MONTH.length > 0 ? formatCurrency(SPEND_BY_MONTH[SPEND_BY_MONTH.length - 1].amount) : "—", sub: "Current month", icon: TrendingUp, color: "var(--primary)", bg: "var(--primary-light)" },
            { label: "Approvals",   value: String(pendingApprv), sub: "pending", icon: CheckSquare, color: "var(--success)", bg: "var(--success-bg)" },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-3 mb-2">{s.label}</p>
                  <p className="text-[20px] font-bold text-1 leading-none">{s.value}</p>
                  <p className="text-[12px] text-3 mt-1.5">{s.sub}</p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 card p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-[14px] font-semibold text-1">Monthly Spend</h3>
                <p className="text-[12px] text-3 mt-0.5">Last 6 months</p>
              </div>
            </div>
            <SpendBars data={SPEND_BY_MONTH} />
          </div>

          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(160deg, #0D1270 0%, #181DA0 100%)" }}>
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold" style={{ color: "#fff" }}>By Department</h3>
            </div>
            {SPEND_BY_DEPARTMENT.length > 0 ? (
              <DonutChart
                data={SPEND_BY_DEPARTMENT.map(d => ({ label: d.department, value: d.amount, color: d.color }))}
                size={160}
                dark
                centerLabel={`₹${(SPEND_BY_DEPARTMENT.reduce((s,d)=>s+d.amount,0)/100000).toFixed(1)}L`}
              />
            ) : (
              <div className="h-[140px] flex items-center justify-center">
                <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        {hasAnyData ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-[13.5px] font-semibold text-1">Pending Payments</h3>
                <Link href="/invoices" className="text-[12px] font-semibold text-primary hover:underline">View all →</Link>
              </div>
              {pending.length > 0 ? (
                <>
                  <div className="tbl-head grid grid-cols-[2fr_1fr_1fr_100px] gap-4 px-5 py-2.5">
                    {["Vendor", "Event / Dept", "Amount Due", "Status"].map(h => <span key={h}>{h}</span>)}
                  </div>
                  {pending.slice(0, 5).map(inv => {
                    const cfg = INVOICE_STATUS_CONFIG[inv.status];
                    const daysOvd = inv.status === "overdue" ? getDaysOverdue(inv.dueDate) : null;
                    return (
                      <Link key={inv.id} href="/invoices"
                        className="tbl-row grid grid-cols-[2fr_1fr_1fr_100px] gap-4 items-center px-5 py-3"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-1 truncate">{inv.vendorName}</p>
                          <p className="text-[11px] text-3">Due {formatDate(inv.dueDate)}</p>
                        </div>
                        <p className="text-[12px] text-3">{inv.eventName || DEPARTMENT_LABELS[inv.department]}</p>
                        <div>
                          <p className="text-[13px] font-semibold text-1">{formatCurrency(inv.balanceDue)}</p>
                          {daysOvd !== null && <p className="text-[11px]" style={{ color: "var(--danger)" }}>{daysOvd}d overdue</p>}
                        </div>
                        <Badge label={daysOvd !== null ? `${daysOvd}d late` : cfg.label} color={cfg.color} bg={cfg.bg} size="sm" dot />
                      </Link>
                    );
                  })}
                </>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No pending payments</p>
                </div>
              )}
            </div>

            <div className="card overflow-hidden">
              <div className="px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-[13.5px] font-semibold text-1">Top Vendors</h3>
              </div>
              {TOP_VENDORS.length > 0 ? TOP_VENDORS.map((v, i) => (
                <div key={v.name} className="tbl-row flex items-center gap-3 px-5 py-3">
                  <span className="text-[11px] font-bold w-4 shrink-0 text-3">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">{v.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-1 truncate">{v.name}</p>
                    <p className="text-[11px] text-3">{v.invoices} orders</p>
                  </div>
                  <span className="text-[12.5px] font-bold text-1 shrink-0">{formatCurrency(v.amount)}</span>
                </div>
              )) : (
                <div className="flex items-center justify-center py-10">
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No vendor data yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty state — getting started */
          <div className="card p-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-1">Ready to get started</p>
              <p className="text-[13px] mt-1" style={{ color: "var(--text-3)" }}>
                Raise your first procurement request and the dashboard will populate with live data.
              </p>
            </div>
            <Link href="/procurement/new" className="btn-primary">New Request</Link>
          </div>
        )}
      </div>
    </div>
  );
}
