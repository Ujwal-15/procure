"use client";
import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Bell, FileText,
  IndianRupee, Package, CheckSquare, X
} from "lucide-react";
import Header from "@/components/layout/Header";
import { formatCurrency } from "@/lib/utils";

type NotifType = "overdue" | "approval" | "paid" | "invoice" | "delivery" | "reminder";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  amount?: number;
  actionLabel?: string;
  actionHref?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "overdue", read: false,
    title: "Payment Overdue — Sharma AV Solutions",
    body: "₹1,24,500 was due on 20 Nov 2025. Now 6 days overdue. Vendor has been waiting.",
    time: "10 min ago", amount: 124500,
    actionLabel: "Mark as Paid", actionHref: "/invoices",
  },
  {
    id: "n2", type: "overdue", read: false,
    title: "Payment Overdue — Kapoor Logistics",
    body: "₹18,500 was due on 22 Nov 2025. Now 4 days overdue.",
    time: "10 min ago", amount: 18500,
    actionLabel: "Mark as Paid", actionHref: "/invoices",
  },
  {
    id: "n3", type: "approval", read: false,
    title: "Approval Required — PR-2025-0041",
    body: "Vikram Nair requested 10x LED Stage Panels for Sunburn Goa 2025. Amount: ₹42,000.",
    time: "2 hours ago", amount: 42000,
    actionLabel: "Review", actionHref: "/approvals",
  },
  {
    id: "n4", type: "reminder", read: false,
    title: "Payment Due in 2 Days — LightCraft Productions",
    body: "₹42,000 (Invoice LCP-0445) is due on 28 Nov 2025 for Sunburn Goa 2025.",
    time: "9 hours ago", amount: 42000,
    actionLabel: "View Invoice", actionHref: "/invoices",
  },
  {
    id: "n5", type: "invoice", read: true,
    title: "Invoice Uploaded — TechRent India",
    body: "Invoice TRI-0892 for ₹62,000 uploaded by Ananya Singh. Due 25 Nov 2025.",
    time: "Yesterday",
    actionLabel: "View", actionHref: "/invoices",
  },
  {
    id: "n6", type: "paid", read: true,
    title: "Payment Confirmed — CreativeFabric Studio",
    body: "Advance payment of ₹35,000 marked as paid via NEFT. UTR: NEFT20251112ABC123.",
    time: "3 days ago", amount: 35000,
  },
  {
    id: "n7", type: "delivery", read: true,
    title: "Delivery Confirmed — PO-2025-0033",
    body: "Rohan Kapoor confirmed delivery of Stage Truss System from CreativeFabric Studio.",
    time: "4 days ago",
  },
  {
    id: "n8", type: "approval", read: true,
    title: "Request Approved — PR-2025-0035",
    body: "Your approval for Signal Analyser Kit (₹28,000) from R&D team has been recorded.",
    time: "5 days ago", amount: 28000,
  },
];

const TYPE_CONFIG: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  overdue:  { icon: AlertTriangle,  color: "#FF3B30", bg: "#FFF2F1" },
  approval: { icon: CheckSquare,    color: "#FF9F0A", bg: "#FFF8EC" },
  reminder: { icon: Clock,          color: "#0071E3", bg: "#E8F1FB" },
  invoice:  { icon: FileText,       color: "#AF52DE", bg: "#F5EEFA" },
  paid:     { icon: CheckCircle2,   color: "#34C759", bg: "#F0FAF3" },
  delivery: { icon: Package,        color: "#636366", bg: "#F5F5F7" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayed = filter === "unread" ? notifications.filter(n => !n.read) : notifications;

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} />

      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-[#E8E8ED] p-1 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            {(["all", "unread"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[12.5px] font-medium rounded-lg transition-all capitalize ${
                  filter === f ? "bg-[#1D1D1F] text-white" : "text-[#636366] hover:text-[#1D1D1F]"
                }`}
              >
                {f}
                {f === "unread" && unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px] bg-[#FF3B30] text-white rounded-full px-1.5 py-0.5">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[12.5px] font-medium text-[#0071E3] hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden divide-y divide-[#F5F5F7]">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-3">
                <Bell size={20} className="text-[#D2D2D7]" />
              </div>
              <p className="text-[14px] font-medium text-[#AEAEB2]">No notifications</p>
              <p className="text-[12px] text-[#D2D2D7] mt-1">You&apos;re all caught up</p>
            </div>
          ) : (
            displayed.map(notif => {
              const cfg = TYPE_CONFIG[notif.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`relative flex items-start gap-3.5 px-5 py-4 hover:bg-[#F5F5F7] transition-colors cursor-pointer ${
                    !notif.read ? "bg-[#F5F5F7]/40" : ""
                  }`}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="absolute left-2.5 top-5 w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
                  )}

                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-snug ${!notif.read ? "font-semibold text-[#1D1D1F]" : "font-medium text-[#3A3A3C]"}`}>
                      {notif.title}
                    </p>
                    <p className="text-[12px] text-[#8E8E93] mt-0.5 leading-relaxed">{notif.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-[#AEAEB2]">{notif.time}</span>
                      {notif.actionLabel && notif.actionHref && (
                        <a
                          href={notif.actionHref}
                          onClick={e => e.stopPropagation()}
                          className="text-[11.5px] font-semibold text-[#0071E3] hover:underline"
                        >
                          {notif.actionLabel} →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-[#D2D2D7] hover:text-[#636366] hover:bg-[#E8E8ED] transition-colors shrink-0 mt-0.5"
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
