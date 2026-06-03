"use client";
import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import Header from "@/components/layout/Header";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/contexts/UserContext";

interface Notif { id: string; title: string; body?: string; type: string; procurement_id?: string; read: boolean; created_at: string; }

const TYPE_ICON: Record<string, React.ElementType> = {
  approval: Clock, approved: CheckCircle2, rejected: AlertTriangle,
  overdue: AlertTriangle, payment: CheckCircle2,
};

export default function NotificationsPage() {
  const { currentUser } = useCurrentUser();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.from("notifications")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => { setNotifs(data ?? []); setLoading(false); });
  }, [currentUser.id]);

  const markRead = async (id: string) => {
    if (!supabase) return;
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="anim-fade">
      <Header title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} />
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="card p-10 flex items-center justify-center"><p className="text-[13px]" style={{ color: "var(--text-3)" }}>Loading…</p></div>
        ) : notifs.length === 0 ? (
          <div className="card p-10 flex flex-col items-center gap-3">
            <Bell size={28} style={{ color: "var(--border)" }} />
            <p className="text-[15px] font-semibold text-1">No notifications yet</p>
            <p className="text-[13px]" style={{ color: "var(--text-3)" }}>You'll see updates here when procurements are submitted or approved.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            {notifs.map(n => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              return (
                <div
                  key={n.id}
                  className="tbl-row flex items-start gap-3 px-5 py-4 cursor-pointer"
                  style={{ backgroundColor: n.read ? undefined : "rgba(0,111,186,0.04)" }}
                  onClick={() => markRead(n.id)}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "var(--primary-light)" }}>
                    <Icon size={15} style={{ color: "var(--primary)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-1">{n.title}</p>
                    {n.body && <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>{n.body}</p>}
                    <p className="text-[11px] mt-1" style={{ color: "var(--text-3)" }}>{formatDate(n.created_at)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: "var(--primary)" }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
