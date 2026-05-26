"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, Users, FileText, CreditCard,
  BarChart3, CheckSquare, Calendar, Settings, Package, ChevronRight, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENT_USER } from "@/lib/mock-data";
import { ROLE_LABELS } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Procurement", href: "/procurement", icon: ShoppingCart },
  { label: "Purchase Orders", href: "/purchase-orders", icon: Package },
  { label: "Invoices & Payments", href: "/invoices", icon: CreditCard },
  { label: "Vendors", href: "/vendors", icon: Users },
  { label: "Events & Projects", href: "/events", icon: Calendar },
  { label: "Approvals", href: "/approvals", icon: CheckSquare, badge: 1 },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Notifications", href: "/notifications", icon: Bell, badge: 4 },
];

const BOTTOM_ITEMS = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 shrink-0 bg-white border-r border-[#E8E8ED] h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#E8E8ED]">
        <div className="w-8 h-8 rounded-lg bg-[#1D1D1F] flex items-center justify-center">
          <span className="text-white text-xs font-semibold tracking-tight">P</span>
        </div>
        <span className="text-[15px] font-semibold text-[#1D1D1F] tracking-tight">Procure</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-[#1D1D1F] text-white"
                    : "text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
                )}
              >
                <item.icon
                  size={15}
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive ? "text-white" : "text-[#8E8E93] group-hover:text-[#1D1D1F]"
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className={cn(
                    "text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center",
                    isActive ? "bg-white text-[#1D1D1F]" : "bg-[#FF3B30] text-white"
                  )}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 border-t border-[#E8E8ED] pt-3">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150",
                isActive
                  ? "bg-[#1D1D1F] text-white"
                  : "text-[#636366] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
              )}
            >
              <item.icon size={15} className={cn("shrink-0", isActive ? "text-white" : "text-[#8E8E93]")} />
              {item.label}
            </Link>
          );
        })}

        {/* User profile */}
        <div className="mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#F5F5F7]">
          <div className="w-7 h-7 rounded-full bg-[#1D1D1F] flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-semibold">{CURRENT_USER.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-[#1D1D1F] truncate">{CURRENT_USER.name}</p>
            <p className="text-[11px] text-[#8E8E93]">{ROLE_LABELS[CURRENT_USER.role]}</p>
          </div>
          <ChevronRight size={13} className="text-[#AEAEB2] shrink-0" />
        </div>
      </div>
    </aside>
  );
}
