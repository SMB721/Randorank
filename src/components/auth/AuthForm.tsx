"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signup" | "login";

const passwordChecks = [
  { label: "6 caractères", test: (v: string) => v.length >= 6 },
  { label: "1 majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { label: "1 chiffre", test: (v: string) => /[0-9]/.test(v) },
];

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode: Mode = searchParams.get("mode") === "login" ? "login" : "signup";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const supabase = createClient();

  const passedChecks = useMemo(
    () => passwordChecks.filter((check) => check.test(password)).length,
    [password]
  );
  const strengthLabel =
    password.length === 0
      ? "À compléter"
      : passedChecks <= 1
      ? "Faible"
      : passedChecks === 2
      ? "Moyen"
      : "Fort";
  const strengthColor =
    passedChecks <= 1 ? "bg-red-400" : passedChecks === 2 ? "bg-summit-400" : "bg-trail-400";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setInfo("Compte créé ! Vérifie tes emails pour confirmer ton inscription. 🥾");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleAuth() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-trail-950/70 p-8 text-white shadow-2xl backdrop-blur-xl">
      <div className="space-y-1 text-center">
        <h1 className="font-display text-3xl tracking-wide">
          {mode === "signup" ? "Crée ton compte." : "Content de te revoir 👋"}
        </h1>
        <p className="text-sm text-white/60">
          {mode === "signup"
            ? "Crée ton profil en 2 minutes."
            : "Connecte-toi pour retrouver tes randos."}
        </p>
      </div>

      <div className="flex rounded-xl bg-white/5 p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-lg py-2 transition ${
            mode === "signup" ? "bg-white text-trail-900 shadow" : "text-white/60"
          }`}
        >
          Inscription
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg py-2 transition ${
            mode === "login" ? "bg-white text-trail-900 shadow" : "text-white/60"
          }`}
        >
          Connexion
        </button>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
      >
        <GoogleIcon />
        Continuer avec Google
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-medium uppercase text-white/40">ou</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.com"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-400/20"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-white/80">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 pr-11 text-sm text-white placeholder-white/30 outline-none focus:border-summit-400 focus:ring-2 focus:ring-summit-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        {mode === "signup" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-widest text-white/40">
                Niveau de sécurité
              </span>
              <span className="font-semibold text-white/70">{strengthLabel}</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  {i < passedChecks && (
                    <div className={`h-full w-full ${strengthColor}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
              {passwordChecks.map((check) => {
                const ok = check.test(password);
                return (
                  <span
                    key={check.label}
                    className={`flex items-center gap-1 ${ok ? "text-trail-300" : ""}`}
                  >
                    <span aria-hidden="true">{ok ? "✓" : "○"}</span>
                    {check.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}
        {info && (
          <p className="rounded-lg bg-trail-400/10 px-3 py-2 text-sm text-trail-200">{info}</p>
        )}

        {mode === "signup" && (
          <p className="text-xs text-white/40">
            En continuant, tu acceptes nos{" "}
            <Link href="/mentions-legales#conditions" className="underline hover:text-white/70">
              Conditions d&apos;utilisation
            </Link>{" "}
            et notre{" "}
            <Link href="/mentions-legales#confidentialite" className="underline hover:text-white/70">
              Politique de confidentialité
            </Link>
            .
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-summit-500 py-3 text-sm font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Un instant..."
            : mode === "signup"
            ? "Créer mon compte"
            : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.94 11.94 0 000 12c0 1.92.46 3.74 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.58 10.58a2 2 0 002.83 2.83M9.36 5.36A9.77 9.77 0 0112 5c5 0 9 4 10 7-.32.99-1.06 2.24-2.17 3.36M6.6 6.6C4.6 7.9 3.14 9.8 2 12c1 3 5 7 10 7 1.35 0 2.61-.28 3.74-.74"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
      />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
