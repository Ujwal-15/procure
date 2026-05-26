import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
  size?: "sm" | "md";
  dot?: boolean;
}

export default function Badge({ label, color, bg, size = "md", dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap",
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-[12px] px-2.5 py-1"
      )}
      style={{ color, backgroundColor: bg }}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      )}
      {label}
    </span>
  );
}
