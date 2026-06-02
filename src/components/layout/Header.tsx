"use client";
import { Search, Plus, Bell } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeProvider";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <header
      className="h-[60px] flex items-center px-6 gap-4 sticky top-0 z-10 border-b"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex-1">
        <h1 className="text-[16px] font-semibold text-1 tracking-tight leading-none">{title}</h1>
        {subtitle && <p className="text-[11.5px] text-3 mt-0.5">{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="relative hidden md:flex items-center">
        <Search size={13} className="absolute left-3" style={{ color: "var(--text-3)" }} />
        <input
          type="text"
          placeholder="Search..."
          className="field"
          style={{ width: 200, paddingLeft: 34, paddingTop: 7, paddingBottom: 7, fontSize: 13 }}
        />
      </div>

      <ThemeToggle />

      {/* Bell */}
      <Link
        href="/notifications"
        className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
        style={{ backgroundColor: "var(--surface-2)", color: "var(--text-3)" }}
      >
        <Bell size={15} />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
          style={{ backgroundColor: "var(--danger)", borderColor: "var(--surface)" }}
        />
      </Link>

      {/* CTA */}
      {action && (
        action.href ? (
          <Link href={action.href} className="btn-primary">
            <Plus size={14} />{action.label}
          </Link>
        ) : (
          <button onClick={action.onClick} className="btn-primary">
            <Plus size={14} />{action.label}
          </button>
        )
      )}
    </header>
  );
}
