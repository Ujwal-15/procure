"use client";
import { Bell, Search, Plus } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-[#E8E8ED] flex items-center px-6 gap-4 sticky top-0 z-10">
      <div className="flex-1">
        <h1 className="text-[17px] font-semibold text-[#1D1D1F] tracking-tight">{title}</h1>
        {subtitle && <p className="text-[12px] text-[#8E8E93] mt-0.5">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={13} className="absolute left-3 text-[#AEAEB2]" />
        <input
          type="text"
          placeholder="Search..."
          className="w-52 pl-8 pr-3 py-1.5 text-[13px] bg-[#F5F5F7] border border-[#E8E8ED] rounded-lg placeholder:text-[#AEAEB2] text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:ring-offset-0 transition-all"
        />
      </div>

      {/* Notifications */}
      <Link href="/notifications" className="relative w-8 h-8 rounded-lg hover:bg-[#F5F5F7] flex items-center justify-center transition-colors">
        <Bell size={16} className="text-[#636366]" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B30] rounded-full border-2 border-white" />
      </Link>

      {/* CTA */}
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1D1D1F] text-white text-[13px] font-medium rounded-lg hover:bg-[#3A3A3C] transition-colors"
        >
          <Plus size={14} />
          {action.label}
        </Link>
      )}
    </header>
  );
}
