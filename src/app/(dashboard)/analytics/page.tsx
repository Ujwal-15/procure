"use client";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import { SPEND_BY_MONTH, SPEND_BY_DEPARTMENT, SPEND_BY_EVENT, TOP_VENDORS, INVOICES } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from "recharts";

const PAYMENT_HEALTH = [
  { month: "Jun", onTime: 8, late: 2 },
  { month: "Jul", onTime: 10, late: 4 },
  { month: "Aug", onTime: 7, late: 1 },
  { month: "Sep", onTime: 12, late: 5 },
  { month: "Oct", onTime: 14, late: 3 },
  { month: "Nov", onTime: 9, late: 4 },
];

export default function AnalyticsPage() {
  const overdueAmt = INVOICES.filter(i => i.status === "overdue").reduce((s, i) => s + i.balanceDue, 0);

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Analytics" subtitle="Spend insights and procurement health" />

      <div className="p-6 space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Spend (2025)" value={formatCurrency(32_14_000)} sub="Jan – Nov" trend={{ value: "23% YoY", positive: false }} />
          <StatCard label="Avg Monthly Spend" value={formatCurrency(2_92_000)} sub="Last 6 months" />
          <StatCard label="Active Vendors" value="8" sub="from 100+ registered" accent="blue" />
          <StatCard label="On-time Payment Rate" value="71%" sub="Nov 2025" accent={overdueAmt > 0 ? "yellow" : "green"} />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-1">Monthly Spend Trend</h3>
            <p className="text-[12px] text-[#8E8E93] mb-4">6-month overview</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={SPEND_BY_MONTH}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D1D1F" stopOpacity={0.08} />
                    <stop offset="95%" stopColor="#1D1D1F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8E8E93" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8E8E93" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
                <Tooltip
                  contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", fontSize: 12 }}
                  formatter={(v) => [formatCurrency(Number(v)), "Spend"]}
                />
                <Area type="monotone" dataKey="amount" stroke="#1D1D1F" strokeWidth={2} fill="url(#spendGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-1">By Department</h3>
            <p className="text-[12px] text-[#8E8E93] mb-3">November 2025</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={SPEND_BY_DEPARTMENT} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="amount" paddingAngle={3}>
                  {SPEND_BY_DEPARTMENT.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", fontSize: 12 }}
                  formatter={(v) => [formatCurrency(Number(v))]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {SPEND_BY_DEPARTMENT.map(d => (
                <div key={d.department} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[12px] text-[#636366]">{d.department}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-[#1D1D1F]">{formatCurrency(d.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-1">By Event</h3>
            <p className="text-[12px] text-[#8E8E93] mb-4">Current active events</p>
            <div className="space-y-3">
              {SPEND_BY_EVENT.map(e => {
                const maxAmt = Math.max(...SPEND_BY_EVENT.map(x => x.amount));
                return (
                  <div key={e.event}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[12px] font-medium text-[#1D1D1F] truncate mr-2">{e.event}</span>
                      <span className="text-[12px] font-semibold text-[#1D1D1F] shrink-0">{formatCurrency(e.amount)}</span>
                    </div>
                    <div className="h-1.5 bg-[#F5F5F7] rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${(e.amount / maxAmt) * 100}%`, backgroundColor: e.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-1">Payment Health</h3>
            <p className="text-[12px] text-[#8E8E93] mb-4">On-time vs late payments per month</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={PAYMENT_HEALTH} barSize={20} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8E8E93" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8E8E93" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="onTime" name="On Time" fill="#34C759" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" name="Late" fill="#FF3B30" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top vendors table */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F5F5F7]">
            <h3 className="text-[14px] font-semibold text-[#1D1D1F]">Vendor Spend Analysis</h3>
          </div>
          <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 px-5 py-2.5 bg-[#F5F5F7]">
            {["#", "Vendor", "Total Spend", "Orders", "Share"].map(h => (
              <span key={h} className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-[#F5F5F7]">
            {TOP_VENDORS.map((v, i) => {
              const total = TOP_VENDORS.reduce((s, x) => s + x.amount, 0);
              const pct = Math.round((v.amount / total) * 100);
              return (
                <div key={v.name} className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 items-center px-5 py-3 hover:bg-[#F5F5F7] transition-colors">
                  <span className="text-[12px] font-semibold text-[#AEAEB2]">{i + 1}</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center shrink-0">
                      <span className="text-white text-[10px] font-semibold">{v.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <span className="text-[13px] font-medium text-[#1D1D1F]">{v.name}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#1D1D1F]">{formatCurrency(v.amount)}</span>
                  <span className="text-[13px] text-[#636366]">{v.invoices}</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#F5F5F7] rounded-full">
                      <div className="h-full bg-[#1D1D1F] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11.5px] font-medium text-[#636366] w-7">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
