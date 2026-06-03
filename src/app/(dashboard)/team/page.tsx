"use client";
import { Lock } from "lucide-react";
import Header from "@/components/layout/Header";
import { ROLE_LABELS } from "@/lib/utils";
import { useCurrentUser } from "@/contexts/UserContext";
import { USERS } from "@/lib/mock-data";
import type { UserRole } from "@/types";

const ROLE_ORDER: UserRole[] = ["developer", "management", "finance", "requester"];

const ROLE_SECTION_LABEL: Record<UserRole, string> = {
  developer:  "Developer",
  management: "Owners",
  finance:    "Accountant",
  requester:  "Procurement Team",
};

const ROLE_COLORS: Record<UserRole, { color: string; bg: string }> = {
  developer:  { color: "#006FBA", bg: "rgba(0,111,186,0.12)"  },
  management: { color: "#00AE5E", bg: "rgba(0,174,94,0.12)"   },
  finance:    { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  requester:  { color: "#00BDCD", bg: "rgba(0,189,205,0.12)"  },
};

/* Initials avatar */
function Avatar({ initials, role }: { initials: string; role: UserRole }) {
  const c = ROLE_COLORS[role];
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-[12px]"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {initials.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function TeamPage() {
  const { currentUser } = useCurrentUser();

  if (currentUser.role !== "developer") {
    return (
      <div className="anim-fade">
        <Header title="Team" />
        <div className="p-6 flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "var(--surface-2)" }}
          >
            <Lock size={22} style={{ color: "var(--text-3)" }} />
          </div>
          <p className="text-[16px] font-semibold text-1">Access Restricted</p>
          <p className="text-[13px] text-center" style={{ color: "var(--text-3)", maxWidth: 320 }}>
            The Team page is only visible to developers.
          </p>
        </div>
      </div>
    );
  }

  const grouped = ROLE_ORDER.map(role => ({
    role,
    users: USERS.filter(u => u.role === role),
  }));

  const totalUsers = USERS.length;

  return (
    <div className="anim-fade">
      <Header
        title="Team"
        subtitle={`${totalUsers} members`}
      />

      <div className="p-6 space-y-6">
        {grouped.map(({ role, users }) => {
          if (users.length === 0) return null;
          const c = ROLE_COLORS[role];
          return (
            <div key={role}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-[13px] font-semibold text-1">{ROLE_SECTION_LABEL[role]}</h2>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: c.bg, color: c.color }}
                >
                  {users.length}
                </span>
                <span className="text-[11px] font-medium" style={{ color: "var(--text-3)" }}>
                  {ROLE_LABELS[role]}
                </span>
              </div>

              {/* User cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {users.map(user => (
                  <div
                    key={user.id}
                    className="card p-4 flex items-center gap-3"
                  >
                    <Avatar initials={user.avatar ?? user.name.slice(0, 2)} role={user.role} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-1 truncate">{user.name}</p>
                      <p className="text-[11px] truncate" style={{ color: "var(--text-3)" }}>
                        {user.email}
                      </p>
                      <span
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1"
                        style={{ backgroundColor: c.bg, color: c.color }}
                      >
                        {ROLE_LABELS[role]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
