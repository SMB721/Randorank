# Rando App — V1

Base du projet SaaS de randonnée décrite dans le cahier des charges : Next.js
(App Router) + TypeScript + Tailwind CSS, authentification via Supabase Auth
(email/mot de passe + Google), prête à être étendue (Stripe, GPX, carte
Leaflet, génération de tracé IA...).

## Stack (V1 — base)

- **Frontend** : Next.js 16 (App Router) + Tailwind CSS
- **Auth** : Supabase Auth (email + Google OAuth ; Apple à activer plus tard
  dans le dashboard Supabase)
- **Base de données** : à connecter — Supabase Postgres + PostGIS recommandé
  (cf. cahier des charges)

## Démarrage

```bash
npm install
cp .env.local.example .env.local
# puis renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Configurer Supabase (auth)

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dans **Project Settings → API**, copier l'URL et la clé `anon` dans
   `.env.local`.
3. Dans **Authentication → URL Configuration**, ajouter
   `http://localhost:3000/auth/callback` comme Redirect URL (et l'URL de
   prod plus tard).
4. Pour Google : **Authentication → Providers → Google**, activer et
   renseigner un Client ID / Secret OAuth (Google Cloud Console).
5. Pour Apple : à activer plus tard (non bloquant pour la V1 de base).

## Structure

```
src/
  app/
    page.tsx              → landing page
    auth/page.tsx          → page inscription / connexion
    auth/callback/route.ts → callback OAuth / confirmation email
    dashboard/page.tsx     → page protégée (redirige vers /auth si non connecté)
  components/auth/AuthForm.tsx → formulaire inscription/connexion (email + Google)
  lib/supabase/client.ts       → client Supabase (navigateur)
  lib/supabase/server.ts       → client Supabase (Server Components)
```

## Prochaines étapes (voir cahier des charges)

1. Compte & abonnement : brancher Stripe (essai 5 jours + mensuel/annuel)
2. Suivi GPS / import GPX + carte du tracé (Leaflet + OpenStreetMap)
3. Photos géolocalisées + fiche rando auto-générée
4. Classement & défis (national + filtre région)
5. Génération de tracé par IA (OpenRouteService / GraphHopper)

## Note sur cette base de projet

Base vérifiée : `npm install`, `npm run lint`, `npx tsc --noEmit`, `npm run
dev` et `npm run build` passent tous sans erreur. Sans variables Supabase
réelles dans `.env.local`, `/auth` et `/dashboard` restent utilisables mais
les appels Supabase échoueront silencieusement (redirection vers `/auth` par
défaut) — configure un vrai projet Supabase pour tester le flux complet.
