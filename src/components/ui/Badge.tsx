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
      className="inline-flex items-center gap-1.5 font-semibold rounded-full whitespace-nowrap"
      style={{
        color,
        backgroundColor: bg,
        fontSize: size === "sm" ? 11 : 12,
        padding: size === "sm" ? "2px 8px" : "3px 10px",
      }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />}
      {label}
    </span>
  );
}
