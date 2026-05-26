"use client";
import { AlertTriangle, Clock, TrendingUp, DollarSign, CheckSquare, Package } from "lucide-react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import { INVOICES, APPROVALS, SPEND_BY_MONTH, SPEND_BY_DEPARTMENT, TOP_VENDORS, CURRENT_USER } from "@/lib/mock-data";
import { formatCurrency, formatDate, getDaysOverdue, INVOICE_STATUS_CONFIG, DEPARTMENT_LABELS } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const overdueInvoices = INVOICES.filter(i => i.status === "overdue");
  const pendingInvoices = INVOICES.filter(i => i.status === "pending" || i.status === "partially_paid");
  const totalOverdue = overdueInvoices.reduce((s, i) => s + i.balanceDue, 0);
  const totalPending = pendingInvoices.reduce((s, i) => s + i.balanceDue, 0);
  const pendingApprovals = APPROVALS.filter(a => a.status === "pending").length;

  const allPending = [...INVOICES]
    .filter(i => i.status !== "paid")
    .sort((a, b) => {
      if (a.status === "overdue" && b.status !== "overdue") return -1;
      if (b.status === "overdue" && a.status !== "overdue") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${CURRENT_USER.name.split(" ")[0]}`}
        action={{ label: "New Request", href: "/procurement/new" }}
      />

      <div className="p-6 space-y-6">
        {/* Overdue alert banner */}
        {overdueInvoices.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-[#FFF2F1] border border-[#FF3B30]/20 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-[#FF3B30]/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-[#FF3B30]" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#FF3B30]">
                {overdueInvoices.length} overdue payment{overdueInvoices.length > 1 ? "s" : ""} — {formatCurrency(totalOverdue)} pending action
              </p>
              <p className="text-[12px] text-[#FF3B30]/70 mt-0.5">Vendor disputes increase after 3 days overdue</p>
            </div>
            <Link href="/invoices" className="text-[12px] font-semibold text-[#FF3B30] hover:underline whitespace-nowrap">
              View all →
            </Link>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Overdue Payments"
            value={formatCurrency(totalOverdue)}
            sub={`${overdueInvoices.length} vendors waiting`}
            icon={AlertTriangle}
            iconColor="#FF3B30"
            iconBg="#FFF2F1"
            accent="red"
          />
          <StatCard
            label="Due This Week"
            value={formatCurrency(totalPending)}
            sub={`${pendingInvoices.length} invoices`}
            icon={Clock}
            iconColor="#FF9F0A"
            iconBg="#FFF8EC"
            accent="yellow"
          />
          <StatCard
            label="This Month Spend"
            value={formatCurrency(8_42_000)}
            sub="Nov 2025"
            trend={{ value: "17% vs last month", positive: false }}
            icon={TrendingUp}
            iconColor="#0071E3"
            iconBg="#E8F1FB"
            accent="blue"
          />
          <StatCard
            label="Pending Approvals"
            value={String(pendingApprovals)}
            sub="requests awaiting you"
            icon={CheckSquare}
            iconColor="#34C759"
            iconBg="#F0FAF3"
            accent={pendingApprovals > 0 ? "yellow" : "default"}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Monthly spend chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] font-semibold text-[#1D1D1F]">Monthly Spend</h3>
                <p className="text-[12px] text-[#8E8E93] mt-0.5">Last 6 months</p>
              </div>
              <span className="text-[12px] font-medium text-[#8E8E93] bg-[#F5F5F7] px-2.5 py-1 rounded-lg">INR</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={SPEND_BY_MONTH} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8E8E93" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8E8E93" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", fontSize: 12 }}
                  formatter={(v) => [formatCurrency(Number(v)), "Spend"]}
                  cursor={{ fill: "#F5F5F7" }}
                />
                <Bar dataKey="amount" fill="#1D1D1F" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dept breakdown */}
          <div className="bg-white rounded-2xl p-5 border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h3 className="text-[14px] font-semibold text-[#1D1D1F] mb-1">By Department</h3>
            <p className="text-[12px] text-[#8E8E93] mb-4">November 2025</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={SPEND_BY_DEPARTMENT} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="amount" paddingAngle={3}>
                  {SPEND_BY_DEPARTMENT.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", fontSize: 12 }}
                  formatter={(v) => [formatCurrency(Number(v)), ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {SPEND_BY_DEPARTMENT.map((d) => (
                <div key={d.department} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-[12px] text-[#636366]">{d.department}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-[#1D1D1F]">{formatCurrency(d.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pending payments */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F5F7]">
              <h3 className="text-[14px] font-semibold text-[#1D1D1F]">Pending Payments</h3>
              <Link href="/invoices" className="text-[12px] font-medium text-[#0071E3] hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-[#F5F5F7]">
              {allPending.slice(0, 5).map((inv) => {
                const cfg = INVOICE_STATUS_CONFIG[inv.status];
                const daysOverdue = inv.status === "overdue" ? getDaysOverdue(inv.dueDate) : null;
                return (
                  <Link
                    key={inv.id}
                    href="/invoices"
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F5F5F7] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
                      <DollarSign size={14} className="text-[#636366]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{inv.vendorName}</p>
                      <p className="text-[11.5px] text-[#8E8E93]">
                        {inv.eventName || DEPARTMENT_LABELS[inv.department]} · Due {formatDate(inv.dueDate)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-semibold text-[#1D1D1F]">{formatCurrency(inv.balanceDue)}</p>
                      <Badge label={daysOverdue !== null ? `${daysOverdue}d overdue` : cfg.label} color={cfg.color} bg={cfg.bg} size="sm" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Top vendors */}
          <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F5F7]">
              <h3 className="text-[14px] font-semibold text-[#1D1D1F]">Top Vendors</h3>
              <span className="text-[12px] text-[#8E8E93]">All time</span>
            </div>
            <div className="divide-y divide-[#F5F5F7]">
              {TOP_VENDORS.map((v, i) => (
                <div key={v.name} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-[12px] font-semibold text-[#AEAEB2] w-4 shrink-0">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-[#F5F5F7] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-[#636366]">
                      {v.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-[#1D1D1F] truncate">{v.name}</p>
                    <p className="text-[11px] text-[#8E8E93]">{v.invoices} orders</p>
                  </div>
                  <span className="text-[12.5px] font-semibold text-[#1D1D1F] shrink-0">{formatCurrency(v.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
