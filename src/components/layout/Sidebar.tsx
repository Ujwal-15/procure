"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Users, CreditCard,
  BarChart3, CheckSquare, Settings, Package, Bell
} from "lucide-react";
import { useCurrentUser } from "@/contexts/UserContext";
import { ROLE_LABELS } from "@/lib/utils";

const NAV = [
  { label: "Dashboard",           href: "/dashboard",       icon: LayoutDashboard },
  { label: "Procurement",         href: "/procurement",     icon: ShoppingCart    },
  { label: "Purchase Orders",     href: "/purchase-orders", icon: Package         },
  { label: "Invoices & Payments", href: "/invoices",        icon: CreditCard      },
  { label: "Vendors",             href: "/vendors",         icon: Users           },
  { label: "Approvals",           href: "/approvals",       icon: CheckSquare     },
  { label: "Analytics",           href: "/analytics",       icon: BarChart3       },
  { label: "Notifications",       href: "/notifications",   icon: Bell            },
];

/* Role-based "home" page — highlighted as the primary nav for that role */
const ROLE_HOME: Record<string, string> = {
  requester:  "/procurement",
  finance:    "/invoices",
  management: "/approvals",
};

export default function Sidebar() {
  const path = usePathname();
  const { currentUser, switchableUsers, setCurrentUser } = useCurrentUser();
  const roleHome = ROLE_HOME[currentUser.role] ?? "/dashboard";

  return (
    <aside
      className="flex flex-col w-[220px] shrink-0 h-screen sticky top-0"
      style={{ backgroundColor: "var(--sidebar)", borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-[60px]" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(79,70,229,0.5)]">
          <span className="text-white text-[11px] font-bold tracking-tight">P</span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight" style={{ color: "#fff" }}>Procure</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = path === item.href || path.startsWith(item.href + "/");
          const isPrimary = item.href === roleHome;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${active ? " active" : ""}`}
            >
              <item.icon size={15} className="shrink-0" />
              <span className="flex-1 text-[13px]">{item.label}</span>
              {/* Subtle dot for role's primary section */}
              {isPrimary && !active && (
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/settings" className={`nav-item${path === "/settings" ? " active" : ""}`}>
          <Settings size={15} />
          <span className="text-[13px]">Settings</span>
        </Link>

        {/* User switcher */}
        <div className="px-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
            Switch user
          </p>
          <div className="flex gap-2">
            {switchableUsers.map(u => {
              const isActive = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => setCurrentUser(u)}
                  title={`${u.name} · ${ROLE_LABELS[u.role]}`}
                  className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                    outline: isActive ? "1.5px solid rgba(255,255,255,0.35)" : "none",
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: isActive ? "linear-gradient(135deg,#818CF8,#4F46E5)" : "rgba(255,255,255,0.12)" }}
                  >
                    {u.avatar}
                  </div>
                  <span className="text-[9px] font-semibold truncate" style={{ color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}>
                    {u.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current user chip */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">{currentUser.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.9)" }}>
              {currentUser.name}
            </p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              {ROLE_LABELS[currentUser.role]}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
