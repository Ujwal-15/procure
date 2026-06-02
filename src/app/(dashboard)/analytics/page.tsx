"use client";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { formatCurrency, DEPARTMENT_LABELS, DEPARTMENT_COLORS } from "@/lib/utils";
import Header from "@/components/layout/Header";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DonutChart from "@/components/ui/DonutChart";
import type { Department } from "@/types";

/* ── Helpers ── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TEAM   = ["Prem","Yashwanth","Vikram"];

const DEPT_COLORS: Record<Department, string> = {
  event: "#FF9F0A", r_and_d: "#006FBA", embedded: "#00BDCD",
  software: "#00AE5E", general_office: "#8E8E93",
};

/* Vertical bar chart — used for vendor & team tabs */
function VerticalBars({
  data,
  dark = false,
  labelKey = "name",
}: {
  data: { name: string; amount: number; sub?: string }[];
  dark?: boolean;
  labelKey?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="h-[160px] flex items-center justify-center">
        <p className="text-[12px]" style={{ color: dark ? "rgba(255,255,255,0.35)" : "var(--text-3)" }}>No data yet</p>
      </div>
    );
  }
  const max   = Math.max(...data.map(d => d.amount));
  const total = data.reduce((s, d) => s + d.amount, 0);
  return (
    <div className="flex items-end gap-3 h-[160px]">
      {data.map(d => {
        const pct      = max > 0 ? d.amount / max : 0;
        const sharePct = total > 0 ? Math.round((d.amount / total) * 100) : 0;
        return (
          <div key={d.name} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold" style={{ color: dark ? "rgba(255,255,255,0.7)" : "var(--text-2)" }}>{sharePct}%</span>
            <div className="w-full relative rounded-xl overflow-hidden" style={{ height: "120px", backgroundColor: dark ? "rgba(255,255,255,0.1)" : "var(--surface-2)" }}>
              <div className="absolute bottom-0 left-0 right-0 rounded-xl" style={{ height: `${pct * 100}%`, background: "linear-gradient(180deg, #00BDCD 0%, #006FBA 100%)" }} />
            </div>
            <span className="text-[10.5px] text-center truncate w-full font-medium" style={{ color: dark ? "rgba(255,255,255,0.55)" : "var(--text-2)" }}>
              {d.name.split(" ")[0]}
            </span>
            {d.sub && (
              <span className="text-[9px] text-center" style={{ color: dark ? "rgba(255,255,255,0.35)" : "var(--text-3)" }}>{d.sub}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Horizontal bar — used for "By Team" section */
function HorizontalPersonBars({ data }: { data: { name: string; amount: number; count: number; avatar: string }[] }) {
  if (data.length === 0 || data.every(d => d.amount === 0)) {
    return <p className="text-[13px] py-6 text-center" style={{ color: "var(--text-3)" }}>No data yet</p>;
  }
  const max = Math.max(...data.map(d => d.amount));
  return (
    <div className="space-y-5">
      {data.map(d => {
        const pct = max > 0 ? (d.amount / max) * 100 : 0;
        return (
          <div key={d.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-[9px] font-bold">{d.avatar}</span>
                </div>
                <span className="text-[13px] font-semibold text-1">{d.name}</span>
              </div>
              <div className="text-right">
                <span className="text-[13px] font-bold text-1">{d.amount > 0 ? formatCurrency(d.amount) : "—"}</span>
                <span className="text-[11px] text-3 ml-2">{d.count} req</span>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #00BDCD 0%, #006FBA 100%)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const { requests, invoices } = useData();
  const [reportTab, setReportTab] = useState<"by_vendor" | "by_dept" | "by_team">("by_team");
  const [spendTab,  setSpendTab]  = useState<"trend" | "invoice_status">("trend");

  /* ── Computed analytics from live requests ── */
  const spendByMonth = MONTHS.map(month => ({
    month,
    amount: requests
      .filter(r => new Date(r.createdAt).toLocaleString("en-IN", { month: "short" }) === month)
      .reduce((s, r) => s + r.estimatedTotal, 0),
  })).filter(m => m.amount > 0);

  const depts: Department[] = ["event","r_and_d","embedded","software","general_office"];
  const spendByDept = depts.map(d => ({
    label:  DEPARTMENT_LABELS[d],
    value:  requests.filter(r => r.department === d).reduce((s, r) => s + r.estimatedTotal, 0),
    color:  DEPT_COLORS[d],
  })).filter(d => d.value > 0);

  const spendByPerson = TEAM.map(name => ({
    name,
    avatar: name.slice(0, 2).toUpperCase(),
    amount: requests.filter(r => r.requesterName === name).reduce((s, r) => s + r.estimatedTotal, 0),
    count:  requests.filter(r => r.requesterName === name).length,
  })).sort((a, b) => b.amount - a.amount);

  /* vendor bars from invoice data (grouped by vendor name) */
  const vendorMap: Record<string, number> = {};
  invoices.forEach(i => { vendorMap[i.vendorName] = (vendorMap[i.vendorName] ?? 0) + i.grossAmount; });
  const spendByVendor = Object.entries(vendorMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const totalSpend = requests.reduce((s, r) => s + r.estimatedTotal, 0);
  const maySpend   = spendByMonth.find(m => m.month === "May")?.amount ?? 0;
  const overdueAmt = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.balanceDue, 0);
  const hasData    = totalSpend > 0;

  /* invoice status counts for the status tab */
  const invPaid     = invoices.filter(i => i.status === "paid");
  const invOverdue  = invoices.filter(i => i.status === "overdue");
  const invPending  = invoices.filter(i => i.status === "pending" || i.status === "partially_paid");

  return (
    <div className="anim-fade">
      <Header title="Analytics" subtitle="Spend insights — Jan to May 2026" />
      <div className="p-6 space-y-5">

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Spend",    value: hasData ? formatCurrency(totalSpend) : "—",                                                              sub: "All time"          },
            { label: "May 2026",       value: maySpend > 0 ? formatCurrency(maySpend) : "—",                                                          sub: "Current month"     },
            { label: "Overdue",        value: overdueAmt > 0 ? formatCurrency(overdueAmt) : "—",                                                      sub: "From vendors"      },
            { label: "Total Requests", value: String(requests.length),                                                                                sub: `${TEAM.join(", ")}` },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-3 mb-2">{s.label}</p>
              <p className="text-[22px] font-bold text-1 leading-none">{s.value}</p>
              <p className="text-[12px] text-3 mt-1.5 truncate">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Reporting tabs — By Team / By Vendor / By Department */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center px-5 pt-4 pb-0">
            <div className="flex gap-6">
              {([
                { key: "by_team",   label: "By Team Member" },
                { key: "by_dept",   label: "By Department"  },
                { key: "by_vendor", label: "By Vendor"      },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setReportTab(tab.key)}
                  className="text-[13px] font-medium pb-3 border-b-2 transition-colors"
                  style={{
                    color: reportTab === tab.key ? "var(--primary)" : "var(--text-3)",
                    borderBottomColor: reportTab === tab.key ? "var(--primary)" : "transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t" style={{ borderColor: "var(--border)" }} />

          {reportTab === "by_team" ? (
            /* White card for team — more legible */
            <div className="p-6">
              <p className="text-[12px] text-3 mb-5">How much each person raised in procurement requests</p>
              <HorizontalPersonBars data={spendByPerson} />
            </div>
          ) : reportTab === "by_dept" ? (
            <div className="rounded-b-2xl p-5" style={{ background: "linear-gradient(160deg, #001E3C 0%, #00437A 100%)" }}>
              {spendByDept.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.45)" }}>Total spend</p>
                    <p className="text-[22px] font-bold" style={{ color: "#fff" }}>{formatCurrency(totalSpend)}</p>
                  </div>
                  <DonutChart
                    data={spendByDept.map(d => ({ label: d.label, value: d.value, color: d.color }))}
                    size={170}
                    dark
                    centerLabel={`₹${(totalSpend / 100000).toFixed(1)}L`}
                  />
                </>
              ) : (
                <div className="h-[160px] flex items-center justify-center">
                  <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>No department data yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-b-2xl p-5" style={{ background: "linear-gradient(160deg, #001E3C 0%, #00437A 100%)" }}>
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Top vendors by invoice value</p>
              </div>
              <VerticalBars data={spendByVendor} dark />
            </div>
          )}
        </div>

        {/* Per-person detail table (always visible) */}
        {spendByPerson.some(p => p.amount > 0) && (
          <div className="grid grid-cols-3 gap-4">
            {spendByPerson.map(p => {
              const deptBreakdown = depts.map(d => ({
                label: DEPARTMENT_LABELS[d],
                amount: requests.filter(r => r.requesterName === p.name && r.department === d).reduce((s, r) => s + r.estimatedTotal, 0),
                color:  DEPT_COLORS[d],
              })).filter(d => d.amount > 0);

              return (
                <div key={p.name} className="card p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-white text-[11px] font-bold">{p.avatar}</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-1">{p.name}</p>
                      <p className="text-[11px] text-3">{p.count} requests · {formatCurrency(p.amount)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {deptBreakdown.map(d => (
                      <div key={d.label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="text-[11.5px] truncate" style={{ color: "var(--text-2)" }}>{d.label}</span>
                        </div>
                        <span className="text-[11.5px] font-semibold shrink-0 text-1">{formatCurrency(d.amount)}</span>
                      </div>
                    ))}
                    {deptBreakdown.length === 0 && (
                      <p className="text-[12px]" style={{ color: "var(--text-3)" }}>No requests yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Spend trend / Invoice status */}
        <div className="card p-0 overflow-hidden">
          <div className="flex px-5 pt-4 pb-0 border-b" style={{ borderColor: "var(--border)" }}>
            {([
              { key: "trend",          label: "Spend Trend"    },
              { key: "invoice_status", label: "Invoice Status" },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setSpendTab(tab.key)}
                className="text-[13px] font-medium pb-3 mr-6 border-b-2 transition-colors"
                style={{
                  color: spendTab === tab.key ? "var(--primary)" : "var(--text-3)",
                  borderBottomColor: spendTab === tab.key ? "var(--primary)" : "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {spendTab === "trend" ? (
              spendByMonth.length > 0 ? (
                <>
                  <p className="text-[12px] text-3 mb-4">Monthly procurement spend · INR</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={spendByMonth}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#006FBA" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#006FBA" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--text-3)" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-1)" }} formatter={(v) => [formatCurrency(Number(v)), "Spend"]} />
                      <Area type="monotone" dataKey="amount" stroke="#006FBA" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: "#006FBA", r: 3 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="h-[180px] flex items-center justify-center">
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No spend data yet</p>
                </div>
              )
            ) : (
              /* Invoice status — replaces "Payment Health" */
              <div>
                <p className="text-[12px] text-3 mb-5">Overview of invoice payment status</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Paid",        count: invPaid.length,    total: invPaid.reduce((s,i) => s+i.grossAmount,0),    color: "var(--success)", bg: "var(--success-bg)"   },
                    { label: "Pending",     count: invPending.length,  total: invPending.reduce((s,i) => s+i.balanceDue,0),  color: "var(--warning)", bg: "var(--warning-bg)"   },
                    { label: "Overdue",     count: invOverdue.length,  total: invOverdue.reduce((s,i) => s+i.balanceDue,0),  color: "var(--danger)",  bg: "var(--danger-bg)"    },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-4" style={{ backgroundColor: s.bg }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: s.color }}>{s.label}</p>
                      <p className="text-[22px] font-bold" style={{ color: s.color }}>{s.count}</p>
                      <p className="text-[12px] font-medium mt-1" style={{ color: s.color }}>{s.total > 0 ? formatCurrency(s.total) : "₹0"}</p>
                    </div>
                  ))}
                </div>
                {invoices.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {invoices.slice(0, 5).map(i => (
                      <div key={i.id} className="flex items-center gap-3">
                        <span className="text-[11px] text-3 w-32 truncate shrink-0">{i.vendorName}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${i.grossAmount > 0 ? Math.round(((i.grossAmount - i.balanceDue) / i.grossAmount) * 100) : 0}%`,
                            backgroundColor: i.status === "paid" ? "var(--success)" : i.status === "overdue" ? "var(--danger)" : "var(--warning)",
                          }} />
                        </div>
                        <span className="text-[11px] font-semibold text-1 w-24 text-right shrink-0">
                          {i.balanceDue > 0 ? `${formatCurrency(i.balanceDue)} due` : "Cleared"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vendor spend table */}
        {spendByVendor.length > 0 && (
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-[14px] font-semibold text-1">Vendor Spend</h3>
            </div>
            <div className="tbl-head grid grid-cols-[40px_2fr_1fr_1fr] gap-4 px-5 py-2.5">
              {["#","Vendor","Invoiced","Share"].map(h => <span key={h}>{h}</span>)}
            </div>
            {spendByVendor.map((v, i) => {
              const vTotal = spendByVendor.reduce((s, x) => s + x.amount, 0);
              const pct    = vTotal > 0 ? Math.round((v.amount / vTotal) * 100) : 0;
              return (
                <div key={v.name} className="tbl-row grid grid-cols-[40px_2fr_1fr_1fr] gap-4 items-center px-5 py-3">
                  <span className="text-[12px] font-bold text-3">{i + 1}</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-bold">{v.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-[13px] font-medium text-1 truncate">{v.name}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-1">{formatCurrency(v.amount)}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] font-medium w-7 shrink-0 text-3">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!hasData && (
          <div className="card p-10 flex flex-col items-center text-center gap-3">
            <p className="text-[15px] font-semibold text-1">No analytics data yet</p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
              Analytics populate automatically as procurement requests are raised.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
