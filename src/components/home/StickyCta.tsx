"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Mobile-only bar that follows the scroll once the hero button is out of
// sight, so the invitation is never more than one thumb tap away.
export default function StickyCta({ label, note }: { label: string; note: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-trail-950/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link
        href="/start"
        tabIndex={visible ? 0 : -1}
        className="block rounded-xl bg-summit-500 py-3 text-center text-base font-semibold text-white shadow-lg shadow-summit-500/30"
      >
        {label}
      </Link>
      <p className="mt-1 text-center text-[11px] text-white/50">{note}</p>
    </div>
  );
}
