import type { ReactNode } from "react";

export default function FloatingStatCard({
  icon,
  label,
  value,
  className = "",
  delay = "0s",
  dark = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
  delay?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`animate-float absolute z-20 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${
        dark
          ? "border-white/15 bg-trail-950/80 text-white"
          : "border-trail-100 bg-white/95 text-trail-900"
      } ${className}`}
      style={{ animationDelay: delay }}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
          dark ? "bg-summit-500/20 text-summit-400" : "bg-summit-50 text-summit-600"
        }`}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span>
        <span className="block text-[0.65rem] font-semibold uppercase tracking-widest opacity-60">
          {label}
        </span>
        <span className="block font-display text-lg tracking-wide">{value}</span>
      </span>
    </div>
  );
}
