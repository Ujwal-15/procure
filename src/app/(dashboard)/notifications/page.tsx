"use client";
import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Bell, FileText,
  Package, CheckSquare, X,
} from "lucide-react";
import Header from "@/components/layout/Header";

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
  overdue:  { icon: AlertTriangle, color: "var(--danger)",   bg: "var(--danger-bg)"  },
  approval: { icon: CheckSquare,   color: "var(--warning)",  bg: "var(--warning-bg)" },
  reminder: { icon: Clock,         color: "var(--primary)",  bg: "var(--primary-light)" },
  invoice:  { icon: FileText,      color: "var(--purple)",   bg: "var(--purple-bg)"  },
  paid:     { icon: CheckCircle2,  color: "var(--success)",  bg: "var(--success-bg)" },
  delivery: { icon: Package,       color: "var(--text-3)",   bg: "var(--surface-2)"  },
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
    <div className="anim-fade">
      <Header title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} />

      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 card p-1" style={{ borderRadius: 10 }}>
            {(["all", "unread"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-[12.5px] font-medium rounded-lg transition-all capitalize"
                style={{
                  backgroundColor: filter === f ? "var(--primary)" : "transparent",
                  color: filter === f ? "#fff" : "var(--text-3)",
                }}
              >
                {f}
                {f === "unread" && unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "var(--danger)" }}>{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-[12.5px] font-semibold" style={{ color: "var(--primary)" }}>
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="card p-0 overflow-hidden">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "var(--surface-2)" }}>
                <Bell size={20} style={{ color: "var(--text-3)" }} />
              </div>
              <p className="text-[14px] font-medium" style={{ color: "var(--text-3)" }}>No notifications</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>You&apos;re all caught up</p>
            </div>
          ) : (
            displayed.map(notif => {
              const cfg = TYPE_CONFIG[notif.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className="relative flex items-start gap-3.5 px-5 py-4 tbl-row cursor-pointer"
                  style={!notif.read ? { backgroundColor: "var(--primary-light)" } : {}}
                >
                  {!notif.read && (
                    <div className="absolute left-2.5 top-5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                  )}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon size={16} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-snug" style={{
                      fontWeight: !notif.read ? 600 : 500,
                      color: "var(--text-1)",
                    }}>
                      {notif.title}
                    </p>
                    <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: "var(--text-3)" }}>{notif.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px]" style={{ color: "var(--text-3)" }}>{notif.time}</span>
                      {notif.actionLabel && notif.actionHref && (
                        <a
                          href={notif.actionHref}
                          onClick={e => e.stopPropagation()}
                          className="text-[11.5px] font-semibold"
                          style={{ color: "var(--primary)" }}
                        >
                          {notif.actionLabel} →
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(notif.id); }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 mt-0.5"
                    style={{ color: "var(--text-3)" }}
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
