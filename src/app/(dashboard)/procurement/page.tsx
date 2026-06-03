"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import {
  formatCurrency, formatDate,
  PROCUREMENT_STATUS_CONFIG, PAYMENT_STATUS_CONFIG,
  canApprove, canCreateEntry,
} from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import { useData } from "@/contexts/DataContext";
import type { ProcurementStatus } from "@/types";

const PAGE_SIZE = 20;

const STATUS_TABS: { label: string; value: ProcurementStatus | "all" }[] = [
  { label: "All",              value: "all"              },
  { label: "Draft",            value: "draft"            },
  { label: "Pending Approval", value: "pending_approval" },
  { label: "Approved",         value: "approved"         },
  { label: "In Progress",      value: "in_progress"      },
  { label: "Completed",        value: "completed"        },
  { label: "Rejected",         value: "rejected"         },
];

export default function ProcurementPage() {
  const { currentUser } = useCurrentUser();
  const { requests, loading, approveProcurement } = useData();

  const [activeTab, setActiveTab]     = useState<ProcurementStatus | "all">("all");
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [approving, setApproving]     = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (activeTab !== "all") list = list.filter(r => r.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          (r.vendorName ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, activeTab, search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pendingCount = requests.filter(r => r.status === "pending_approval").length;

  async function handleApprove(id: string) {
    setApproving(id);
    try {
      await approveProcurement(id, currentUser.name, currentUser.id);
    } finally {
      setApproving(null);
    }
  }

  const showNew = canCreateEntry(currentUser.role);
  const showApprove = canApprove(currentUser.role);

  return (
    <div className="anim-fade">
      <Header
        title="Procurements"
        subtitle={`${requests.length} total`}
        action={showNew ? { label: "New Procurement", href: "/procurement/new" } : undefined}
      />

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative flex items-center" style={{ maxWidth: 340 }}>
          <Search size={13} className="absolute left-3" style={{ color: "var(--text-3)" }} />
          <input
            type="text"
            placeholder="Search by title or vendor…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="field w-full"
            style={{ paddingLeft: 34, fontSize: 13 }}
          />
        </div>

        <div className="card p-0 overflow-hidden">
          {/* Tabs */}
          <div
            className="flex items-center gap-0.5 px-4 pt-3 border-b overflow-x-auto"
            style={{ borderColor: "var(--border)" }}
          >
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setPage(1); }}
                className="px-3 py-2 text-[12.5px] font-medium whitespace-nowrap transition-all"
                style={{
                  color: activeTab === tab.value ? "var(--primary)" : "var(--text-3)",
                  borderBottom: `2px solid ${activeTab === tab.value ? "var(--primary)" : "transparent"}`,
                  paddingBottom: 10,
                }}
              >
                {tab.label}
                {tab.value === "pending_approval" && pendingCount > 0 && (
                  <span
                    className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: "var(--warning)" }}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-[13px]" style={{ color: "var(--text-3)" }}>Loading…</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-[14px] font-semibold text-1">No procurements found</p>
              <p className="text-[13px]" style={{ color: "var(--text-3)" }}>
                {search ? "Try a different search term." : "Nothing in this status yet."}
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div
                className="tbl-head grid gap-4 px-5 py-2.5"
                style={{ gridTemplateColumns: showApprove ? "2fr 1.2fr 1fr 1fr 1fr 1fr 100px 120px" : "2fr 1.2fr 1fr 1fr 1fr 1fr 100px" }}
              >
                {["Title", "Vendor", "Category", "Amount", "Status", "Payment", "Date", ...(showApprove ? ["Actions"] : [])].map(h => (
                  <span key={h}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {paginated.map(req => {
                const pCfg  = PROCUREMENT_STATUS_CONFIG[req.status];
                const pmCfg = PAYMENT_STATUS_CONFIG[req.paymentStatus];
                return (
                  <div
                    key={req.id}
                    className="tbl-row grid gap-4 items-center px-5 py-3.5"
                    style={{ gridTemplateColumns: showApprove ? "2fr 1.2fr 1fr 1fr 1fr 1fr 100px 120px" : "2fr 1.2fr 1fr 1fr 1fr 1fr 100px" }}
                  >
                    <Link href={`/procurement/${req.id}`} className="min-w-0 group">
                      <span
                        className="text-[10.5px] font-semibold font-mono"
                        style={{ color: "var(--text-3)" }}
                      >
                        {req.requestNumber}
                      </span>
                      <p className="text-[13px] font-semibold text-1 truncate mt-0.5 group-hover:underline">
                        {req.title}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                        {req.requesterName}
                      </p>
                    </Link>

                    <p className="text-[12.5px] text-2 truncate">{req.vendorName || "—"}</p>
                    <p className="text-[12.5px] text-2 truncate">{req.category}</p>

                    <div>
                      <p className="text-[13px] font-semibold text-1">{formatCurrency(req.totalAmount)}</p>
                      {req.amountPaid > 0 && (
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                          Paid {formatCurrency(req.amountPaid)}
                        </p>
                      )}
                    </div>

                    <Badge label={pCfg.label} color={pCfg.color} bg={pCfg.bg} size="sm" dot />
                    <Badge label={pmCfg.label} color={pmCfg.color} bg={pmCfg.bg} size="sm" />
                    <p className="text-[12px]" style={{ color: "var(--text-3)" }}>{formatDate(req.createdAt)}</p>

                    {showApprove && (
                      <div className="flex items-center gap-1.5">
                        {req.status === "pending_approval" && (
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={approving === req.id}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                            style={{
                              backgroundColor: "var(--success-bg)",
                              color: "var(--success)",
                              opacity: approving === req.id ? 0.5 : 1,
                            }}
                          >
                            {approving === req.id ? "…" : "Approve"}
                          </button>
                        )}
                        <Link
                          href={`/procurement/${req.id}`}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                          style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)" }}
                        >
                          View
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-5 py-3 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)" }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[12px] font-medium text-2 px-1">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
