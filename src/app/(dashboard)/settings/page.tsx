"use client";
import { useState } from "react";
import Header from "@/components/layout/Header";
import { USERS } from "@/lib/mock-data";
import { ROLE_LABELS } from "@/lib/utils";
import type { UserRole } from "@/types";

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "#AF52DE",
  management: "#0071E3",
  finance: "#34C759",
  procurement: "#FF9F0A",
  requester: "#636366",
};

export default function SettingsPage() {
  const [threshold, setThreshold] = useState("15000");
  const [reminderDays, setReminderDays] = useState("3");

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <Header title="Settings" subtitle="Manage team, approvals, and notifications" />
      <div className="p-6 max-w-2xl mx-auto space-y-4">

        {/* Approval rules */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">Approval Rules</h2>
          <div>
            <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">
              Management approval required above (₹)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-[#636366]">₹</span>
              <input
                type="number"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                className="w-40 px-3 py-2 text-[14px] font-semibold border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
            <p className="text-[12px] text-[#8E8E93] mt-1.5">
              Requests below ₹{parseInt(threshold).toLocaleString("en-IN")} are auto-approved.
            </p>
          </div>
        </div>

        {/* Notification settings */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <h2 className="text-[14px] font-semibold text-[#1D1D1F] mb-4">Payment Reminder Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#1D1D1F] mb-1.5">First reminder (days before due date)</label>
              <input
                type="number"
                value={reminderDays}
                onChange={e => setReminderDays(e.target.value)}
                className="w-24 px-3 py-2 text-[14px] font-semibold border border-[#E8E8ED] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
              <p className="text-[12px] text-[#8E8E93] mt-1.5">Daily reminders fire after due date until paid.</p>
            </div>

            {[
              { label: "Email notifications", enabled: true },
              { label: "WhatsApp notifications", enabled: true },
              { label: "Escalate to management after 3 days overdue", enabled: true },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[13px] text-[#1D1D1F]">{s.label}</span>
                <button className={`w-11 h-6 rounded-full transition-colors relative ${s.enabled ? "bg-[#34C759]" : "bg-[#E8E8ED]"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${s.enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-2xl border border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F5F7]">
            <h2 className="text-[14px] font-semibold text-[#1D1D1F]">Team Members</h2>
            <button className="text-[12.5px] font-medium text-[#0071E3] hover:underline">+ Invite</button>
          </div>
          <div className="divide-y divide-[#F5F5F7]">
            {USERS.map(user => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-[#1D1D1F] flex items-center justify-center shrink-0">
                  <span className="text-white text-[11px] font-semibold">{user.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1D1D1F]">{user.name}</p>
                  <p className="text-[11.5px] text-[#8E8E93]">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] capitalize text-[#8E8E93] bg-[#F5F5F7] px-2 py-0.5 rounded-md">
                    {user.location}
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      color: ROLE_COLORS[user.role],
                      backgroundColor: ROLE_COLORS[user.role] + "18",
                    }}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full py-3 text-[13px] font-semibold text-white bg-[#1D1D1F] rounded-xl hover:bg-[#3A3A3C] transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
