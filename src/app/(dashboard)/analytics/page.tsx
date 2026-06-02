"use client";
import { useState } from "react";
import { SPEND_BY_MONTH, SPEND_BY_DEPARTMENT, TOP_VENDORS, INVOICES } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import Header from "@/components/layout/Header";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DonutChart from "@/components/ui/DonutChart";

/* Custom vertical bar chart */
function VendorBars({ data, dark = false }: { data: { name: string; amount: number }[]; dark?: boolean; }) {
  if (data.length === 0) {
    return (
      <div className="h-[160px] flex items-center justify-center">
        <p className="text-[12px]" style={{ color: dark ? "rgba(255,255,255,0.35)" : "var(--text-3)" }}>No vendor data yet</p>
      </div>
    );
  }
  const max = Math.max(...data.map(d => d.amount));
  const total = data.reduce((s, d) => s + d.amount, 0);
  return (
    <div className="flex items-end gap-3 h-[160px]">
      {data.map(d => {
        const pct = d.amount / max;
        const sharePct = Math.round((d.amount / total) * 100);
        return (
          <div key={d.name} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-bold" style={{ color: dark ? "rgba(255,255,255,0.7)" : "var(--text-2)" }}>
              {sharePct}%
            </span>
            <div
              className="w-full relative rounded-xl overflow-hidden"
              style={{ height: "128px", backgroundColor: dark ? "rgba(255,255,255,0.1)" : "var(--surface-2)" }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 rounded-xl"
                style={{ height: `${pct * 100}%`, background: "linear-gradient(180deg, #818CF8 0%, #4338CA 100%)" }}
              />
            </div>
            <span className="text-[10.5px] text-center truncate w-full" style={{ color: dark ? "rgba(255,255,255,0.45)" : "var(--text-3)" }}>
              {d.name.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const hasData = SPEND_BY_MONTH.length > 0;
const totalSpend = SPEND_BY_MONTH.reduce((s, m) => s + m.amount, 0);
const overdueAmt = INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.balanceDue, 0);

export default function AnalyticsPage() {
  const [reportTab, setReportTab] = useState<"by_vendor" | "by_dept">("by_vendor");
  const [spendTab,  setSpendTab]  = useState<"trend" | "health">("trend");

  return (
    <div className="anim-fade">
      <Header title="Analytics" subtitle="Spend insights and procurement health" />
      <div className="p-6 space-y-5">

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Spend",    value: hasData ? formatCurrency(totalSpend) : "—",                                                                 sub: "All time"          },
            { label: "Avg Monthly",    value: hasData ? formatCurrency(Math.round(totalSpend / SPEND_BY_MONTH.length)) : "—",                             sub: "Last 6 months"     },
            { label: "Active Vendors", value: String(TOP_VENDORS.length),                                                                                 sub: "With transactions"  },
            { label: "Overdue",        value: overdueAmt > 0 ? formatCurrency(overdueAmt) : "—",                                                         sub: "Currently due"     },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-3 mb-2">{s.label}</p>
              <p className="text-[22px] font-bold text-1 leading-none">{s.value}</p>
              <p className="text-[12px] text-3 mt-1.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Reporting */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center px-5 pt-4 pb-0">
            <div className="flex gap-6">
              {(["by_vendor", "by_dept"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setReportTab(tab)}
                  className="text-[13px] font-medium pb-3 border-b-2 transition-colors"
                  style={{
                    color: reportTab === tab ? "var(--primary)" : "var(--text-3)",
                    borderBottomColor: reportTab === tab ? "var(--primary)" : "transparent",
                  }}
                >
                  {tab === "by_vendor" ? "By Vendor" : "By Department"}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t" style={{ borderColor: "var(--border)" }} />

          <div className="rounded-b-2xl p-5" style={{ background: "linear-gradient(160deg, #0D1270 0%, #181DA0 100%)" }}>
            {reportTab === "by_vendor" ? (
              <VendorBars data={TOP_VENDORS.map(v => ({ name: v.name, amount: v.amount }))} dark />
            ) : (
              SPEND_BY_DEPARTMENT.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-[24px] font-bold" style={{ color: "#fff" }}>{formatCurrency(totalSpend)}</p>
                  </div>
                  <DonutChart
                    data={SPEND_BY_DEPARTMENT.map(d => ({ label: d.department, value: d.amount, color: d.color }))}
                    size={170}
                    dark
                    centerLabel={`₹${(SPEND_BY_DEPARTMENT.reduce((s,d)=>s+d.amount,0)/100000).toFixed(1)}L`}
                  />
                </>
              ) : (
                <div className="h-[160px] flex items-center justify-center">
                  <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>No department data yet</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Spend trend / Payment health */}
        <div className="card p-0 overflow-hidden">
          <div className="flex px-5 pt-4 pb-0 border-b" style={{ borderColor: "var(--border)" }}>
            {(["trend", "health"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSpendTab(tab)}
                className="text-[13px] font-medium pb-3 mr-6 border-b-2 transition-colors"
                style={{
                  color: spendTab === tab ? "var(--primary)" : "var(--text-3)",
                  borderBottomColor: spendTab === tab ? "var(--primary)" : "transparent",
                }}
              >
                {tab === "trend" ? "Spend Trend" : "Payment Health"}
              </button>
            ))}
          </div>
          <div className="p-5">
            {spendTab === "trend" ? (
              SPEND_BY_MONTH.length > 0 ? (
                <>
                  <p className="text-[12px] text-3 mb-4">Monthly overview · INR</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={SPEND_BY_MONTH}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4F46E5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "var(--text-3)" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-1)" }}
                        formatter={(v) => [formatCurrency(Number(v)), "Spend"]}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#4F46E5" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: "#4F46E5", r: 3 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="h-[180px] flex items-center justify-center">
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No spend data yet</p>
                </div>
              )
            ) : (
              INVOICES.length > 0 ? (
                <div className="space-y-2">
                  {Array.from(new Set(INVOICES.map(i => new Date(i.dueDate).toLocaleString("en-IN", { month: "short" })))).map(m => {
                    const monthInv = INVOICES.filter(i => new Date(i.dueDate).toLocaleString("en-IN", { month: "short" }) === m);
                    const onTime = monthInv.filter(i => i.status === "paid").length;
                    const total  = monthInv.length;
                    const pct    = total > 0 ? (onTime / total) * 100 : 0;
                    return (
                      <div key={m} className="flex items-center gap-3">
                        <span className="text-[11px] text-3 w-7 shrink-0">{m}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--surface-2)" }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "var(--success)" }} />
                        </div>
                        <span className="text-[11px] font-semibold text-1 w-10 text-right shrink-0">{onTime}/{total}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-[160px] flex items-center justify-center">
                  <p className="text-[13px]" style={{ color: "var(--text-3)" }}>No invoice data yet</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Vendor table */}
        {TOP_VENDORS.length > 0 && (
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h3 className="text-[14px] font-semibold text-1">Vendor Spend Analysis</h3>
            </div>
            <div className="tbl-head grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 px-5 py-2.5">
              {["#", "Vendor", "Total Spend", "Orders", "Share"].map(h => <span key={h}>{h}</span>)}
            </div>
            {TOP_VENDORS.map((v, i) => {
              const total = TOP_VENDORS.reduce((s, x) => s + x.amount, 0);
              const pct = Math.round((v.amount / total) * 100);
              return (
                <div key={v.name} className="tbl-row grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 items-center px-5 py-3">
                  <span className="text-[12px] font-bold text-3">{i + 1}</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-bold">{v.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-[13px] font-medium text-1">{v.name}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-1">{formatCurrency(v.amount)}</span>
                  <span className="text-[13px] text-3">{v.invoices}</span>
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

        {!hasData && TOP_VENDORS.length === 0 && (
          <div className="card p-10 flex flex-col items-center text-center gap-3">
            <p className="text-[15px] font-semibold text-1">No analytics data yet</p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
              Analytics will populate as procurement requests are raised and invoices are processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
