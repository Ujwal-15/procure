"use client";
import { AlertTriangle, Clock, TrendingUp, CheckSquare, ArrowRight, FileText, CreditCard, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { TOP_VENDORS } from "@/lib/mock-data";
import { formatCurrency, formatDate, getDaysOverdue, INVOICE_STATUS_CONFIG, DEPARTMENT_LABELS, DEPARTMENT_COLORS } from "@/lib/utils";
import DonutChart from "@/components/ui/DonutChart";
import { useCurrentUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";
import type { Department } from "@/types";

const DEPT_COLORS: Record<Department, string> = {
  event: "#FF9F0A", r_and_d: "#0071E3", embedded: "#AF52DE",
  software: "#34C759", general_office: "#8E8E93",
};

/* ── Custom bar chart ── */
function SpendBars({ data }: { data: { month: string; amount: number }[] }) {
  if (data.length === 0) {
    return <div className="h-[160px] flex items-center justify-center mt-2"><p className="text-[13px]" style={{ color: "var(--text-3)" }}>No spend data yet</p></div>;
  }
  const max = Math.max(...data.map(d => d.amount));
  return (
    <div className="flex items-end gap-2.5 h-[160px] mt-2">
      {data.map(d => {
        const pct    = d.amount / max;
        const isLast = d.month === data[data.length - 1].month;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold" style={{ color: isLast ? "var(--primary)" : "var(--text-3)" }}>
              ₹{(d.amount / 100000).toFixed(1)}L
            </span>
            <div className="w-full relative rounded-xl overflow-hidden" style={{ height: "130px", backgroundColor: "var(--surface-2)" }}>
              <div className="absolute bottom-0 left-0 right-0 rounded-xl transition-all"
                style={{ height: `${pct * 100}%`, background: isLast ? "linear-gradient(180deg, #818CF8 0%, #4F46E5 100%)" : "linear-gradient(180deg, #818CF8 0%, #6366F1 100%)", opacity: isLast ? 1 : 0.65 }}
              />
            </div>
            <span className="text-[10.5px] font-medium" style={{ color: isLast ? "var(--primary)" : "var(--text-3)" }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useCurrentUser();
  const { requests, invoices, approvals } = useData();
  const canRaise = currentUser.role === "requester";

  const overdue      = invoices.filter(i => i.status === "overdue");
  const dueSoon      = invoices.filter(i => i.status === "pending" || i.status === "partially_paid");
  const totalOverdue = overdue.reduce((s, i) => s + i.balanceDue, 0);
  const totalDue     = dueSoon.reduce((s, i) => s + i.balanceDue, 0);
  const pendingApprv = approvals.filter(a => a.status === "pending").length;
  const myRequests   = requests.filter(r => r.requesterName === currentUser.name);

  const pendingInvoices = [...invoices]
    .filter(i => i.status !== "paid")
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  /* compute spend from live requests */
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const spendByMonth = MONTHS.map(month => ({
    month,
    amount: requests.filter(r => new Date(r.createdAt).toLocaleString("en-IN",{month:"short"}) === month)
      .reduce((s, r) => s + r.estimatedTotal, 0),
  })).filter(m => m.amount > 0);

  const depts: Department[] = ["event","r_and_d","embedded","software","general_office"];
  const spendByDept = depts
    .map(d => ({ label: DEPARTMENT_LABELS[d], value: requests.filter(r => r.department === d).reduce((s,r) => s+r.estimatedTotal, 0), color: DEPT_COLORS[d] }))
    .filter(d => d.value > 0);

  const maySpend = spendByMonth.find(m => m.month === "May")?.amount ?? 0;

  /* Role-specific quick actions */
  const actions =
    currentUser.role === "requester" ? [
      { label: "My Requests",  count: myRequests.length,                                              href: "/procurement" },
      { label: "Pending Appr", count: myRequests.filter(r => r.status === "pending_approval").length, href: "/approvals"   },
      { label: "Overdue",      count: overdue.length,                                                 href: "/invoices"    },
      { label: "Approvals",    count: pendingApprv,                                                   href: "/approvals"   },
    ]
    : currentUser.role === "finance" ? [
      { label: "Outstanding",  count: dueSoon.length + overdue.length, href: "/invoices"    },
      { label: "Overdue",      count: overdue.length,                  href: "/invoices"    },
      { label: "Approvals",    count: pendingApprv,                    href: "/approvals"   },
      { label: "Vendors",      count: TOP_VENDORS.length,              href: "/vendors"     },
    ]
    : /* management */ [
      { label: "Pending Appr", count: pendingApprv,      href: "/approvals"   },
      { label: "Overdue",      count: overdue.length,    href: "/invoices"    },
      { label: "Total Req",    count: requests.length,   href: "/procurement" },
      { label: "Vendors",      count: TOP_VENDORS.length,href: "/vendors"     },
    ];

  return (
    <div className="anim-fade">
      <Header
        title="Dashboard"
        subtitle={`Good day, ${currentUser.name}`}
        action={canRaise ? { label: "New Request", href: "/procurement/new" } : undefined}
      />

      <div className="p-6 space-y-5">

        {/* Action bar */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <span className="text-[11px] font-semibold text-3 uppercase tracking-widest">Quick view</span>
          </div>
          <div className="grid grid-cols-4 divide-x" style={{ borderColor: "var(--border)" }}>
            {actions.map(a => (
              <Link key={a.label} href={a.href} className="flex items-center justify-between px-5 py-4 hover:bg-[var(--surface-2)] transition-colors group">
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
            { label: "Overdue",      value: totalOverdue > 0 ? formatCurrency(totalOverdue) : "—", sub: overdue.length > 0 ? `${overdue.length} vendors` : "None",   icon: AlertTriangle, color: "var(--danger)",  bg: "var(--danger-bg)"    },
            { label: "Due Soon",     value: totalDue > 0 ? formatCurrency(totalDue) : "—",         sub: dueSoon.length > 0 ? `${dueSoon.length} invoices` : "None", icon: Clock,         color: "var(--warning)", bg: "var(--warning-bg)"   },
            { label: "May Spend",    value: maySpend > 0 ? formatCurrency(maySpend) : "—",         sub: "May 2026",                                                    icon: TrendingUp,    color: "var(--primary)", bg: "var(--primary-light)" },
            { label: "Approvals",    value: String(pendingApprv),                                   sub: "pending sign-off",                                            icon: CheckSquare,   color: "var(--success)", bg: "var(--success-bg)"   },
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

        {/* Charts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 card p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-[14px] font-semibold text-1">Monthly Spend</h3>
                <p className="text-[12px] text-3 mt-0.5">Jan – May 2026</p>
              </div>
              {maySpend > 0 && (
                <div className="text-right">
                  <p className="text-[20px] font-bold gradient-text">{formatCurrency(maySpend)}</p>
                  <p className="text-[11px] text-3 mt-0.5">May 2026</p>
                </div>
              )}
            </div>
            <SpendBars data={spendByMonth} />
          </div>

          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(160deg, #0D1270 0%, #181DA0 100%)" }}>
            <div className="mb-4">
              <h3 className="text-[13px] font-semibold" style={{ color: "#fff" }}>By Department</h3>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Jan – May 2026</p>
            </div>
            {spendByDept.length > 0 ? (
              <DonutChart
                data={spendByDept.map(d => ({ label: d.label, value: d.value, color: d.color }))}
                size={160}
                dark
                centerLabel={`₹${(spendByDept.reduce((s,d)=>s+d.value,0)/100000).toFixed(1)}L`}
              />
            ) : (
              <div className="h-[140px] flex items-center justify-center">
                <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Pending payments */}
          <div className="col-span-2 card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-[13.5px] font-semibold text-1">Pending Payments</h3>
              <Link href="/invoices" className="text-[12px] font-semibold text-primary hover:underline">View all →</Link>
            </div>
            {pendingInvoices.length > 0 ? (
              <>
                <div className="tbl-head grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-2.5">
                  {["Vendor", "Event", "Advance Paid", "Balance Due"].map(h => <span key={h}>{h}</span>)}
                </div>
                {pendingInvoices.slice(0, 5).map(inv => {
                  const cfg     = INVOICE_STATUS_CONFIG[inv.status];
                  const daysOvd = inv.status === "overdue" ? getDaysOverdue(inv.dueDate) : null;
                  return (
                    <Link key={inv.id} href="/invoices"
                      className="tbl-row grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center px-5 py-3"
                      style={inv.status === "overdue" ? { backgroundColor: "var(--danger-bg)" } : {}}
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-1 truncate">{inv.vendorName}</p>
                        <p className="text-[11px] text-3">Due {formatDate(inv.dueDate)}</p>
                        {daysOvd !== null && <p className="text-[11px]" style={{ color: "var(--danger)" }}>{daysOvd}d overdue</p>}
                      </div>
                      <p className="text-[12px] text-3 truncate">{inv.eventName || DEPARTMENT_LABELS[inv.department]}</p>
                      <p className="text-[13px] font-medium" style={{ color: inv.advancePaid > 0 ? "var(--success)" : "var(--text-3)" }}>
                        {inv.advancePaid > 0 ? formatCurrency(inv.advancePaid) : "—"}
                      </p>
                      <div>
                        <p className="text-[13px] font-semibold text-1">{formatCurrency(inv.balanceDue)}</p>
                        <Badge label={cfg.label} color={cfg.color} bg={cfg.bg} size="sm" />
                      </div>
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

          {/* Top vendors */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-[13.5px] font-semibold text-1">Top Vendors</h3>
            </div>
            {TOP_VENDORS.map((v, i) => (
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
            ))}
          </div>
        </div>

        {/* Finance shortcut */}
        {currentUser.role === "finance" && (
          <div className="card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--primary-light)" }}>
                <CreditCard size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-1">Mark invoices as paid</p>
                <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                  {overdue.length > 0 ? `${overdue.length} overdue · ` : ""}{dueSoon.length} pending review
                </p>
              </div>
            </div>
            <Link href="/invoices" className="btn-primary">Go to Invoices</Link>
          </div>
        )}

        {/* Management shortcut */}
        {currentUser.role === "management" && pendingApprv > 0 && (
          <div className="card p-5 flex items-center justify-between" style={{ borderLeft: "3px solid var(--warning)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--warning-bg)" }}>
                <CheckSquare size={18} style={{ color: "var(--warning)" }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-1">{pendingApprv} request{pendingApprv > 1 ? "s" : ""} waiting for your approval</p>
                <p className="text-[12px]" style={{ color: "var(--text-3)" }}>Switch to Alok or Sanjeev to approve</p>
              </div>
            </div>
            <Link href="/approvals" className="btn-primary">Review</Link>
          </div>
        )}

        {/* Requester shortcut */}
        {currentUser.role === "requester" && (
          <div className="card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--primary-light)" }}>
                <ShoppingCart size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-1">Raise a new procurement request</p>
                <p className="text-[12px]" style={{ color: "var(--text-3)" }}>Items above ₹15,000 go to Jigar → Alok / Sanjeev for approval</p>
              </div>
            </div>
            <Link href="/procurement/new" className="btn-primary">New Request</Link>
          </div>
        )}
      </div>
    </div>
  );
}
