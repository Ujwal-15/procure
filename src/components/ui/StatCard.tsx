import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
  variant?: "default" | "danger" | "warning" | "success" | "primary";
  className?: string;
}

const VARIANTS = {
  default:  { bar: "var(--border)",   val: "var(--text-1)" },
  danger:   { bar: "var(--danger)",   val: "var(--danger)" },
  warning:  { bar: "var(--warning)",  val: "var(--warning)" },
  success:  { bar: "var(--success)",  val: "var(--success)" },
  primary:  { bar: "var(--primary)",  val: "var(--primary)" },
};

export default function StatCard({ label, value, sub, icon: Icon, iconColor, iconBg, trend, variant = "default", className }: StatCardProps) {
  const v = VARIANTS[variant];
  return (
    <div
      className={`card p-5 relative overflow-hidden ${className ?? ""}`}
      style={{ borderLeftColor: v.bar, borderLeftWidth: variant !== "default" ? 3 : 1 }}
    >
      {/* Subtle gradient blob */}
      {variant !== "default" && (
        <div
          className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-xl"
          style={{ backgroundColor: v.bar }}
        />
      )}
      <div className="flex items-start justify-between gap-3 relative">
        <div className="flex-1 min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide leading-tight" style={{ color: "var(--text-3)" }}>{label}</p>
          <p className="text-[17px] font-bold tracking-tight mt-1.5 leading-snug" style={{ color: v.val }}>{value}</p>
          {sub && <p className="text-[12px] mt-1.5" style={{ color: "var(--text-3)" }}>{sub}</p>}
          {trend && (
            <p className="text-[12px] font-medium mt-1" style={{ color: trend.positive ? "var(--success)" : "var(--danger)" }}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg || "var(--surface-2)" }}>
            <Icon size={18} style={{ color: iconColor || "var(--text-3)" }} />
          </div>
        )}
      </div>
    </div>
  );
}
