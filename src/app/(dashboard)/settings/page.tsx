"use client";
import { useState } from "react";
import Header from "@/components/layout/Header";
import { USERS } from "@/lib/mock-data";
import { ROLE_LABELS } from "@/lib/utils";
import type { UserRole } from "@/types";

const ROLE_COLORS: Record<UserRole, { color: string; bg: string }> = {
  management: { color: "var(--primary)", bg: "var(--primary-light)" },
  finance:    { color: "var(--success)", bg: "var(--success-bg)"   },
  requester:  { color: "var(--text-3)",  bg: "var(--surface-2)"    },
};

const LOCATION_LABELS: Record<string, string> = {
  mumbai: "Mumbai", bengaluru: "Bengaluru", delhi: "Delhi",
};

export default function SettingsPage() {
  const [threshold, setThreshold] = useState("15000");
  const [reminderDays, setReminderDays] = useState("3");
  const [toggles, setToggles] = useState({
    email: true,
    whatsapp: true,
    escalate: true,
  });

  const toggle = (key: keyof typeof toggles) =>
    setToggles(t => ({ ...t, [key]: !t[key] }));

  return (
    <div className="anim-fade">
      <Header title="Settings" subtitle="Manage team, approvals, and notifications" />
      <div className="p-6 max-w-2xl mx-auto space-y-4">

        {/* Approval rules */}
        <div className="card p-5">
          <h2 className="text-[14px] font-semibold text-1 mb-4">Approval Rules</h2>
          <div>
            <label className="block text-[12px] font-medium text-1 mb-1.5">
              Finance + management approval required above (₹)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[15px]" style={{ color: "var(--text-3)" }}>₹</span>
              <input
                type="number"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                className="field"
                style={{ width: 160, fontWeight: 700, fontSize: 15 }}
              />
            </div>
            <p className="text-[12px] mt-1.5" style={{ color: "var(--text-3)" }}>
              Requests below ₹{parseInt(threshold || "0").toLocaleString("en-IN")} are auto-approved.
            </p>
          </div>
        </div>

        {/* Notification settings */}
        <div className="card p-5">
          <h2 className="text-[14px] font-semibold text-1 mb-4">Payment Reminder Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-1 mb-1.5">First reminder (days before due date)</label>
              <input
                type="number"
                value={reminderDays}
                onChange={e => setReminderDays(e.target.value)}
                className="field"
                style={{ width: 100, fontWeight: 700, fontSize: 15 }}
              />
              <p className="text-[12px] mt-1.5" style={{ color: "var(--text-3)" }}>Daily reminders fire after due date until paid.</p>
            </div>

            {[
              { key: "email" as const, label: "Email notifications" },
              { key: "whatsapp" as const, label: "WhatsApp notifications" },
              { key: "escalate" as const, label: "Escalate to management after 3 days overdue" },
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between py-1">
                <span className="text-[13px] text-1">{s.label}</span>
                <button
                  onClick={() => toggle(s.key)}
                  className="w-11 h-6 rounded-full transition-colors relative shrink-0"
                  style={{ backgroundColor: toggles[s.key] ? "var(--success)" : "var(--border)" }}
                >
                  <div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ transform: `translateX(${toggles[s.key] ? 22 : 4}px)` }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Team members */}
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[14px] font-semibold text-1">Team Members</h2>
            <button className="text-[12.5px] font-semibold" style={{ color: "var(--primary)" }}>+ Invite</button>
          </div>
          <div>
            {USERS.map(user => (
              <div key={user.id} className="tbl-row flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-[11px] font-bold">{user.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-1">{user.name}</p>
                  <p className="text-[11.5px]" style={{ color: "var(--text-3)" }}>{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] capitalize px-2 py-0.5 rounded-md"
                    style={{ color: "var(--text-3)", backgroundColor: "var(--surface-2)" }}
                  >
                    {user.location ? (LOCATION_LABELS[user.location] ?? user.location) : "—"}
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={ROLE_COLORS[user.role]}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary w-full justify-center">Save Settings</button>
      </div>
    </div>
  );
}
