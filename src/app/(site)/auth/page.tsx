import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";

const authImage =
  "https://images.unsplash.com/photo-1600807497639-3b5d8e74a232?auto=format&fit=crop&w=1600&q=80";

export default function AuthPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      <Image
        src={authImage}
        alt="Randonneur face à un lac d'altitude entouré de sommets enneigés"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-trail-950" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-2xl tracking-wide text-white">
          RANDO<span className="text-summit-400">RANK</span>
        </Link>
        <Link
          href="/"
          aria-label="Retour à l'accueil"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur transition hover:border-white/60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      </div>

      <div className="relative z-10 w-full">
        <Suspense fallback={null}>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
