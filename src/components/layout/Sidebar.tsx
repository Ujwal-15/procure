"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Users, CreditCard,
  BarChart3, Settings, Bell, LogOut, Menu, X, UserCog,
} from "lucide-react";
import { useCurrentUser } from "@/contexts/UserContext";
import { ROLE_LABELS, canViewReports, isAdmin } from "@/lib/utils";

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ElementType;
  roles?: string[]; // if set, only these roles can see it
}

const NAV: NavItem[] = [
  { label: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { label: "Procurements", href: "/procurement",  icon: ShoppingCart    },
  { label: "Vendors",      href: "/vendors",      icon: Users           },
  { label: "Payments",     href: "/payments",     icon: CreditCard      },
  { label: "Reports",      href: "/reports",      icon: BarChart3,      roles: ["developer","management","finance"] },
  { label: "Team",         href: "/team",         icon: UserCog,        roles: ["developer"] },
  { label: "Settings",     href: "/settings",     icon: Settings,       roles: ["developer"] },
];

async function logout() {
  await fetch("/api/logout", { method: "POST" });
  window.location.href = "/login";
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const path = usePathname();
  const { currentUser } = useCurrentUser();

  const visibleNav = NAV.filter(item =>
    !item.roles || item.roles.includes(currentUser.role)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-[60px] shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shrink-0" style={{ boxShadow: "0 2px 8px rgba(0,111,186,0.5)" }}>
            <span className="text-white text-[11px] font-bold">P</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: "#fff" }}>Procure</span>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.5)" }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map(item => {
          const active = path === item.href || path.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`nav-item${active ? " active" : ""}`}
            >
              <item.icon size={15} className="shrink-0" />
              <span className="text-[13px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/notifications" onClick={onClose} className={`nav-item${path === "/notifications" ? " active" : ""}`}>
          <Bell size={15} />
          <span className="text-[13px]">Notifications</span>
        </Link>
        <button onClick={logout} className="nav-item w-full text-left">
          <LogOut size={15} />
          <span className="text-[13px]">Sign Out</span>
        </button>

        {/* User chip */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
          <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">{currentUser.avatar ?? currentUser.name.slice(0, 2).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.9)" }}>
              {currentUser.name.split(" ")[0]}
            </p>
            <p className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>
              {ROLE_LABELS[currentUser.role]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-[220px] shrink-0 h-screen sticky top-0"
        style={{ backgroundColor: "var(--sidebar)", borderRight: "1px solid rgba(255,255,255,0.07)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: "var(--sidebar)" }}
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} style={{ color: "#fff" }} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-[260px] h-full flex flex-col"
            style={{ backgroundColor: "var(--sidebar)" }}
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
          <div className="flex-1 bg-black/50" />
        </div>
      )}
    </>
  );
}
