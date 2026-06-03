"use client";
import { useMemo } from "react";
import { Download, Lock, TrendingUp, Clock, CreditCard, Building2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { formatCurrency, canUpdatePayment, canViewReports } from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";

/* ── CSS bar chart (no Recharts) ───────────────────────────────────────── */
function SpendBars({ data }: { data: { month: string; amount: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[160px] flex items-center justify-center mt-2">
        <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No spend data yet</p>
      </div>
    );
  }
  const max = Math.max(...data.map(d => d.amount), 1);
  const last = data[data.length - 1]?.month;
  return (
    <div className="flex items-end gap-2.5 h-[160px] mt-2">
      {data.map(d => {
        const pct    = d.amount / max;
        const isLast = d.month === last;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
            <span
              className="text-[10px] font-semibold"
              style={{ color: isLast ? "var(--primary)" : "var(--text-3)" }}
            >
              ₹{(d.amount / 100000).toFixed(1)}L
            </span>
            <div
              className="w-full relative rounded-xl overflow-hidden"
              style={{ height: 130, backgroundColor: "var(--surface-2)" }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-xl transition-all"
                style={{
                  height: `${Math.max(pct * 100, 2)}%`,
                  background: "linear-gradient(180deg, #00BDCD 0%, #006FBA 100%)",
                  opacity: isLast ? 1 : 0.65,
                }}
              />
            </div>
            <span
              className="text-[10.5px] font-medium"
              style={{ color: isLast ? "var(--primary)" : "var(--text-3)" }}
            >
              {d.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Horizontal bar ─────────────────────────────────────────────────────── */
function HBar({ label, amount, max, rank }: { label: string; amount: number; max: number; rank: number }) {
  const pct = max > 0 ? (amount / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-[11px] font-bold w-4 shrink-0 text-right"
        style={{ color: "var(--text-3)" }}
      >
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[12.5px] font-medium text-1 truncate">{label}</p>
          <p className="text-[12px] font-semibold shrink-0 ml-2" style={{ color: "var(--primary)" }}>
            {formatCurrency(amount)}
          </p>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 6, backgroundColor: "var(--surface-2)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg, #006FBA, #00BDCD)" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── CSV export ─────────────────────────────────────────────────────────── */
function exportCSV(
  rows: { title: string; vendor: string; category: string; amount: number; status: string; paymentStatus: string; date: string }[]
) {
  const headers = ["Title", "Vendor", "Category", "Total Amount", "Status", "Payment Status", "Date"];
  const lines = [
    headers.join(","),
    ...rows.map(r =>
      [
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.vendor.replace(/"/g, '""')}"`,
        `"${r.category}"`,
        r.amount,
        r.status,
        r.paymentStatus,
        r.date,
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `procurements_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function ReportsPage() {
  const { currentUser } = useCurrentUser();
  const { requests, vendors, loading } = useData();

  const canExport = canUpdatePayment(currentUser.role);
  const hasAccess = canViewReports(currentUser.role);

  /* active statuses for spend calculations */
  const activeRequests = useMemo(
    () => requests.filter(r => !["draft", "rejected", "cancelled"].includes(r.status)),
    [requests]
  );

  /* summary stats */
  const totalSpend = activeRequests.reduce((s, r) => s + r.totalAmount, 0);
  const pendingApprovals = requests.filter(r => r.status === "pending_approval").length;
  const outstanding = activeRequests
    .filter(r => r.paymentStatus !== "fully_paid")
    .reduce((s, r) => s + Math.max(0, r.totalAmount - r.amountPaid), 0);
  const activeVendors = vendors.filter(v => v.isActive).length;

  /* last 6 months spend */
  const monthlySpend = useMemo(() => {
    const now    = new Date();
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-IN", { month: "short" });
      const yr  = d.getFullYear();
      const mo  = d.getMonth();
      const amount = activeRequests
        .filter(r => {
          const rd = new Date(r.createdAt);
          return rd.getFullYear() === yr && rd.getMonth() === mo;
        })
        .reduce((s, r) => s + r.totalAmount, 0);
      months.push({ month: `${key} ${String(yr).slice(2)}`, amount });
    }
    return months;
  }, [activeRequests]);

  /* spend by category */
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of activeRequests) {
      map[r.category] = (map[r.category] ?? 0) + r.totalAmount;
    }
    return Object.entries(map)
      .map(([cat, amount]) => ({ cat, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeRequests]);

  /* top 5 vendors */
  const topVendors = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of activeRequests) {
      if (r.vendorName) map[r.vendorName] = (map[r.vendorName] ?? 0) + r.totalAmount;
    }
    return Object.entries(map)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [activeRequests]);

  const maxVendor   = topVendors[0]?.amount ?? 1;
  const maxCategory = byCategory[0]?.amount ?? 1;

  /* access guard */
  if (!hasAccess) {
    return (
      <div className="anim-fade">
        <Header title="Reports" />
        <div className="p-6 flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "var(--surface-2)" }}
          >
            <Lock size={22} style={{ color: "var(--text-3)" }} />
          </div>
          <p className="text-[16px] font-semibold text-1">Access Restricted</p>
          <p className="text-[13px] text-center" style={{ color: "var(--text-3)", maxWidth: 320 }}>
            Reports are available to management, finance, and developer roles only.
          </p>
        </div>
      </div>
    );
  }

  const SUMMARY = [
    {
      label: "Total Spend",
      value: formatCurrency(totalSpend),
      sub: `${activeRequests.length} approved procurements`,
      icon: <TrendingUp size={16} style={{ color: "var(--primary)" }} />,
      bg: "var(--primary-light)",
    },
    {
      label: "Pending Approvals",
      value: String(pendingApprovals),
      sub: "awaiting sign-off",
      icon: <Clock size={16} style={{ color: "var(--warning)" }} />,
      bg: "var(--warning-bg)",
    },
    {
      label: "Outstanding Payments",
      value: formatCurrency(outstanding),
      sub: "across active items",
      icon: <CreditCard size={16} style={{ color: "var(--danger)" }} />,
      bg: "var(--danger-bg)",
    },
    {
      label: "Active Vendors",
      value: String(activeVendors),
      sub: `of ${vendors.length} total`,
      icon: <Building2 size={16} style={{ color: "var(--success)" }} />,
      bg: "var(--success-bg)",
    },
  ];

  return (
    <div className="anim-fade">
      <Header
        title="Reports"
        subtitle="Analytics & spend overview"
        action={
          canExport
            ? {
                label: "Export CSV",
                onClick: () =>
                  exportCSV(
                    requests.map(r => ({
                      title:         r.title,
                      vendor:        r.vendorName || "",
                      category:      r.category,
                      amount:        r.totalAmount,
                      status:        r.status,
                      paymentStatus: r.paymentStatus,
                      date:          r.createdAt,
                    }))
                  ),
              }
            : undefined
        }
      />

      <div className="p-6 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Loading…</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4">
              {SUMMARY.map(s => (
                <div key={s.label} className="card p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-3 mb-2">{s.label}</p>
                      <p className="text-[22px] font-bold text-1 leading-none">{s.value}</p>
                      <p className="text-[12px] text-3 mt-1.5">{s.sub}</p>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: s.bg }}
                    >
                      {s.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Monthly spend */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-[14px] font-semibold text-1">Monthly Spend Trend</h3>
                    <p className="text-[12px] text-3 mt-0.5">Last 6 months</p>
                  </div>
                  <p className="text-[18px] font-bold gradient-text">
                    {formatCurrency(monthlySpend[monthlySpend.length - 1]?.amount ?? 0)}
                  </p>
                </div>
                <SpendBars data={monthlySpend} />
              </div>

              {/* Spend by category */}
              <div className="card p-5">
                <h3 className="text-[14px] font-semibold text-1 mb-4">Spend by Category</h3>
                {byCategory.length === 0 ? (
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {byCategory.slice(0, 7).map((c, i) => (
                      <HBar key={c.cat} label={c.cat} amount={c.amount} max={maxCategory} rank={i + 1} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top 5 vendors */}
            <div className="card p-5">
              <h3 className="text-[14px] font-semibold text-1 mb-4">Top 5 Vendors by Spend</h3>
              {topVendors.length === 0 ? (
                <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No vendor spend data yet</p>
              ) : (
                <div className="space-y-4">
                  {topVendors.map((v, i) => (
                    <HBar key={v.name} label={v.name} amount={v.amount} max={maxVendor} rank={i + 1} />
                  ))}
                </div>
              )}
            </div>

            {/* Export card for finance/developer */}
            {canExport && (
              <div
                className="card p-5 flex items-center justify-between"
                style={{ borderLeft: "3px solid var(--primary)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary-light)" }}
                  >
                    <Download size={18} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-1">Export Procurement Data</p>
                    <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                      Download all {requests.length} records as CSV
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    exportCSV(
                      requests.map(r => ({
                        title:         r.title,
                        vendor:        r.vendorName || "",
                        category:      r.category,
                        amount:        r.totalAmount,
                        status:        r.status,
                        paymentStatus: r.paymentStatus,
                        date:          r.createdAt,
                      }))
                    )
                  }
                  className="btn-primary"
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
