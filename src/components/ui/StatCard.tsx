import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
  accent?: "red" | "yellow" | "green" | "blue" | "default";
  className?: string;
}

const ACCENT_STYLES = {
  red: { border: "#FF3B30", bg: "bg-[#FFF2F1]", text: "text-[#FF3B30]" },
  yellow: { border: "#FF9F0A", bg: "bg-[#FFF8EC]", text: "text-[#FF9F0A]" },
  green: { border: "#34C759", bg: "bg-[#F0FAF3]", text: "text-[#34C759]" },
  blue: { border: "#0071E3", bg: "bg-[#E8F1FB]", text: "text-[#0071E3]" },
  default: { border: "#E8E8ED", bg: "bg-white", text: "text-[#1D1D1F]" },
};

export default function StatCard({
  label, value, sub, icon: Icon, iconColor, iconBg, trend, accent = "default", className
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div
      className={cn("bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-[#E8E8ED]", className)}
      style={accent !== "default" ? { borderLeftColor: styles.border, borderLeftWidth: 3 } : {}}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-[#8E8E93] uppercase tracking-wide">{label}</p>
          <p className={cn("text-[26px] font-semibold tracking-tight mt-1 leading-none", styles.text)}>
            {value}
          </p>
          {sub && <p className="text-[12px] text-[#8E8E93] mt-1.5">{sub}</p>}
          {trend && (
            <p className={cn("text-[12px] font-medium mt-1.5", trend.positive ? "text-[#34C759]" : "text-[#FF3B30]")}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: iconBg || "#F5F5F7" }}
          >
            <Icon size={18} style={{ color: iconColor || "#636366" }} />
          </div>
        )}
      </div>
    </div>
  );
}
