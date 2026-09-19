import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FaqAccordion from "@/components/home/FaqAccordion";
import PricingSection from "@/components/home/PricingSection";

const heroImage =
  "https://images.unsplash.com/photo-1616494268339-f49a1c4ac8f8?auto=format&fit=crop&w=2000&q=80";
const forestSpot =
  "https://images.unsplash.com/photo-1562593028-1fe2d15bde36?auto=format&fit=crop&w=900&q=80";
const lakeSpot =
  "https://images.unsplash.com/photo-1600807497639-3b5d8e74a232?auto=format&fit=crop&w=900&q=80";
const groupSpot =
  "https://images.unsplash.com/photo-1674085678761-5472e776e4c8?auto=format&fit=crop&w=900&q=80";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center">
          <Image
            src={heroImage}
            alt="Randonneur au sommet d'une crête face aux montagnes"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-trail-950" />

          <div className="relative z-10 space-y-6 pt-16">
            <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm font-semibold text-white backdrop-blur">
              🥾 Rejoins la communauté RandoRank
            </span>
            <h1 className="font-display text-6xl leading-[0.95] tracking-wide text-white sm:text-8xl">
              Chaque sentier
              <br />
              <span className="text-summit-400">devient un défi.</span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-white/85">
              Suis tes randos, débloque de nouveaux badges, grimpe au classement et
              partage tes plus belles sorties.
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
              <Link
                href="/auth"
                className="rounded-xl bg-summit-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
              >
                Créer mon profil
              </Link>
              <Link
                href="/auth?mode=login"
                className="rounded-xl border-2 border-white/40 bg-white/5 px-8 py-3 text-base font-semibold text-white backdrop-blur transition hover:border-white/70"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
          </div>
        </section>

        {/* Spots & communauté */}
        <section id="spots" className="bg-trail-950 px-6 py-24 text-white">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-400">
                Spots &amp; communauté
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide sm:text-5xl">
                Tes spots. Tes repères.
              </h2>
              <p className="mt-4 text-white/70">
                Forêt, lac d&apos;altitude ou ascension entre amis : découvre les spots
                partagés par la communauté et retrouve les randonneurs qui vivent les
                mêmes levers de soleil que toi.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                {
                  src: forestSpot,
                  alt: "Randonneur sur un sentier forestier face aux montagnes",
                  title: "Sous-bois",
                  caption: "Sentiers ombragés",
                },
                {
                  src: lakeSpot,
                  alt: "Randonneur face à un lac d'altitude entouré de sommets enneigés",
                  title: "Lac d'altitude",
                  caption: "Eaux turquoise",
                },
                {
                  src: groupSpot,
                  alt: "Groupe de randonneurs sur un sentier menant à un sommet rocheux",
                  title: "Cimes en vue",
                  caption: "Entre randonneurs",
                },
              ].map((spot) => (
                <div
                  key={spot.title}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={spot.src}
                    alt={spot.alt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs uppercase tracking-widest text-summit-400">
                      {spot.caption}
                    </p>
                    <p className="font-display text-2xl tracking-wide">{spot.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Génération d'itinéraire */}
        <section id="navigation" className="bg-trail-50 px-6 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
                Génère ton parcours
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide text-trail-900 sm:text-5xl">
                Indique ta distance.
                <br />
                RandoRank prépare la suite.
              </h2>
              <p className="mt-4 text-trail-700">
                Renseigne la distance que tu es prêt·e à réaliser — et ton objectif si
                tu en as un. RandoRank te propose un parcours réellement praticable,
                puis l&apos;ajuste selon ton niveau et les informations de santé de ton
                profil, pour te suggérer un tracé adapté plutôt qu&apos;un itinéraire
                générique.
              </p>
              <Link
                href="/auth"
                className="mt-6 inline-block rounded-xl bg-trail-900 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-trail-900/20 transition hover:bg-trail-800"
              >
                Préparer mon itinéraire
              </Link>
            </div>

            <div className="rounded-2xl border border-trail-200 bg-white p-6 shadow-xl shadow-trail-900/5">
              <p className="text-xs font-semibold uppercase tracking-widest text-trail-400">
                Exemple de proposition
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-trail-50 px-4 py-3">
                  <span className="text-sm font-medium text-trail-700">Distance visée</span>
                  <span className="font-display text-xl tracking-wide text-trail-900">12 km</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-trail-50 px-4 py-3">
                  <span className="text-sm font-medium text-trail-700">Niveau</span>
                  <span className="font-display text-xl tracking-wide text-trail-900">Amateur</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-trail-50 px-4 py-3">
                  <span className="text-sm font-medium text-trail-700">Dénivelé max</span>
                  <span className="font-display text-xl tracking-wide text-trail-900">+450 m</span>
                </div>
                <div className="rounded-xl bg-summit-50 px-4 py-3 text-sm font-medium text-summit-700">
                  Boucle proposée : retour au point de départ, 3h15 estimées.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Classement */}
        <section id="classement" className="bg-trail-900 px-6 py-24 text-white">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-400">
                Classement
              </span>
              <h2 className="mt-3 font-display text-4xl tracking-wide sm:text-5xl">
                Chaque kilomètre
                <br />
                compte.
              </h2>
              <p className="mt-4 text-white/70">
                Les kilomètres réellement parcourus te font grimper. Suis ta position
                au classement, débloque des badges et bats tes propres objectifs, ou
                ceux de tes amis.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Septembre 2026
              </p>
              <div className="mt-4 flex items-center gap-4 rounded-xl bg-white/10 p-4">
                <span className="font-display text-3xl text-summit-400">#3</span>
                <div className="flex-1">
                  <p className="font-semibold">Toi</p>
                  <p className="text-sm text-white/60">42 km ce mois-ci</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/60">
                Plus que <span className="font-semibold text-summit-400">6,4 km</span>{" "}
                pour passer #2.
              </p>
            </div>
          </div>
        </section>

        {/* Offres */}
        <section id="offres" className="bg-white px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
              Offres
            </span>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-trail-900 sm:text-5xl">
              Le Monchu, Le MUL ou Le Thru-Hiker.
            </h2>
            <p className="mt-4 text-trail-600">
              Trois profils de randonneurs, trois niveaux d&apos;accès. Commence
              gratuitement, passe à la vitesse supérieure quand tu es prêt·e.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-6xl">
            <PricingSection />
          </div>
        </section>

        {/* RandoRank en quelques mots */}
        <section id="apropos" className="bg-trail-50 px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
              RandoRank en quelques mots
            </span>
            <p className="mt-4 text-xl leading-relaxed text-trail-800">
              RandoRank t&apos;aide à préparer des itinéraires de randonnée selon ton
              niveau, à partager ta passion et à découvrir de nouveaux spots.
              Enregistre chaque parcours, analyse tes randos et compare-toi à tes amis
              comme à l&apos;ensemble des randonneurs du site — par région, par
              département, jusqu&apos;à l&apos;échelle du pays.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-white px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-summit-600">
              Tout est clair
            </span>
            <h2 className="mt-3 font-display text-4xl tracking-wide text-trail-900 sm:text-5xl">
              Questions fréquentes
            </h2>
          </div>

          <div className="mt-12">
            <FaqAccordion />
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-sm text-trail-500">
            RandoRank te donne des repères, pas des consignes de sécurité en montagne :
            vérifie toujours la météo et tes propres capacités avant de partir.
          </p>
        </section>

        {/* CTA final */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <Image
            src={forestSpot}
            alt="Sentier forestier menant vers les montagnes"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-trail-950/80" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
              Prêt·e à relever le premier défi ?
            </h2>
            <p className="mt-4 text-white/80">
              Rejoins les randonneurs qui suivent, partagent et progressent ensemble.
            </p>
            <Link
              href="/auth"
              className="mt-6 inline-block rounded-xl bg-summit-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-summit-500/30 transition hover:bg-summit-600"
            >
              Créer mon profil
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}