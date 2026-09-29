import type { ReactNode } from "react";

// Pure-CSS device frame — no external mockup asset to source or license,
// and it inherits the brand palette instead of a generic silver/black frame.
export default function PhoneMockup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[9/19.5] w-[260px] shrink-0 rounded-[2.5rem] border-[6px] border-trail-950 bg-trail-950 p-1.5 shadow-2xl shadow-black/40 sm:w-[280px] ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-trail-950"
      />
      <div className="h-full w-full overflow-hidden rounded-[2rem] bg-white">{children}</div>
    </div>
  );
}
