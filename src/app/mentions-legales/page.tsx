import Link from "next/link";

export const metadata = {
  title: "Mentions légales — RandoRank",
};

const sections = [
  { id: "mentions-legales", label: "Mentions légales" },
  { id: "conditions", label: "Conditions générales d'utilisation" },
  { id: "confidentialite", label: "Politique de confidentialité" },
  { id: "cookies", label: "Cookies" },
  { id: "contact", label: "Contact" },
];

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <Link href="/" className="text-sm font-semibold text-summit-600 hover:underline">
        ← Retour à l&apos;accueil
      </Link>

      <h1 className="mt-6 font-display text-4xl tracking-wide text-trail-900">
        Mentions légales &amp; conditions
      </h1>

      <div className="mt-4 rounded-xl border border-summit-200 bg-summit-50 px-4 py-3 text-sm text-summit-800">
        Ce document est un modèle de travail. Les champs entre crochets doivent être
        complétés avec les informations réelles de l&apos;éditeur dès l&apos;immatriculation
        de la structure, et l&apos;ensemble doit être validé par un professionnel du droit
        avant toute mise en ligne publique — voir la responsabilité liée aux itinéraires
        de montagne et le traitement de données de localisation, qui sont sensibles.
      </div>

      <nav className="mt-8 flex flex-wrap gap-2 text-sm">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-trail-200 px-3 py-1 text-trail-700 transition hover:border-summit-400 hover:text-summit-600"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Mentions légales */}
      <section id="mentions-legales" className="mt-12 scroll-mt-24 space-y-4">
        <h2 className="text-2xl font-bold text-trail-900">1. Mentions légales</h2>

        <h3 className="text-lg font-semibold text-trail-900">Éditeur du site</h3>
        <p className="text-trail-700">
          Le site RandoRank est édité par [Raison sociale à compléter], [forme juridique
          à compléter — ex. société par actions simplifiée, entreprise individuelle], au
          capital de [montant à compléter le cas échéant], immatriculée au Registre du
          Commerce et des Sociétés de [ville à compléter] sous le numéro SIREN/SIRET
          [à compléter], dont le siège social est situé [adresse à compléter].
        </p>
        <p className="text-trail-700">
          Numéro de TVA intracommunautaire : [à compléter, le cas échéant].
          <br />
          Directeur de la publication : [nom et qualité à compléter].
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Hébergement</h3>
        <p className="text-trail-700">
          Le site est hébergé par Vercel Inc. (frontend) et par [Railway / Render — à
          confirmer selon le choix retenu] (backend et base de données). Les mentions
          légales complètes de chaque hébergeur sont disponibles sur leurs sites
          respectifs.
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Propriété intellectuelle</h3>
        <p className="text-trail-700">
          La marque RandoRank, son logo, sa charte graphique et l&apos;ensemble des
          contenus du site (textes, visuels, badges, noms d&apos;offres) sont protégés au
          titre de la propriété intellectuelle. Toute reproduction non autorisée est
          interdite. Les traces GPX, photos et contenus que tu publies restent ta
          propriété ; tu accordes à RandoRank une licence limitée pour les afficher dans
          le cadre du service (classements, fiches de rando, partage).
        </p>
      </section>

      {/* CGU */}
      <section id="conditions" className="mt-12 scroll-mt-24 space-y-4">
        <h2 className="text-2xl font-bold text-trail-900">
          2. Conditions générales d&apos;utilisation
        </h2>

        <h3 className="text-lg font-semibold text-trail-900">Objet</h3>
        <p className="text-trail-700">
          RandoRank est un service de suivi de randonnée permettant d&apos;enregistrer ou
          d&apos;importer des sorties, de générer des itinéraires indicatifs, de participer
          à des défis et classements, et de partager ses résultats. L&apos;utilisation du
          site implique l&apos;acceptation pleine et entière des présentes conditions.
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Compte et offres</h3>
        <p className="text-trail-700">
          L&apos;accès à certaines fonctionnalités nécessite la création d&apos;un compte.
          RandoRank propose une offre gratuite (Freemium) et des offres payantes
          (Premium, VIP) par abonnement mensuel ou annuel, résiliables à tout moment
          depuis l&apos;espace compte ; la résiliation prend effet à la fin de la période
          déjà payée. Le détail des offres et de leurs tarifs est disponible sur la page
          d&apos;accueil.
        </p>

        <h3 className="text-lg font-semibold text-trail-900">
          Itinéraires et responsabilité
        </h3>
        <p className="text-trail-700">
          Les itinéraires générés ou suggérés par RandoRank sont fournis à titre
          indicatif, à partir de données cartographiques tierces (OpenStreetMap) et des
          informations renseignées par l&apos;utilisateur. Ils ne remplacent ni une carte
          topographique à jour, ni l&apos;appréciation personnelle des conditions
          météorologiques, du niveau technique requis et de sa propre condition physique.
          Chaque randonneur reste seul responsable de la préparation et de la sécurité de
          sa sortie, en particulier en montagne. RandoRank ne saurait être tenu
          responsable des conséquences d&apos;une sortie mal préparée.
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Règles de la communauté</h3>
        <p className="text-trail-700">
          Le classement et les défis reposent sur des sorties réellement effectuées. Toute
          tentative de falsification d&apos;une trace (vitesse incohérente, téléportation,
          dénivelé fabriqué) peut entraîner l&apos;invalidation des kilomètres concernés et,
          en cas de récidive, la suspension du compte.
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Modification des CGU</h3>
        <p className="text-trail-700">
          RandoRank peut modifier les présentes conditions ; les utilisateurs en seront
          informés avant l&apos;entrée en vigueur des changements.
        </p>
      </section>

      {/* Confidentialité */}
      <section id="confidentialite" className="mt-12 scroll-mt-24 space-y-4">
        <h2 className="text-2xl font-bold text-trail-900">
          3. Politique de confidentialité
        </h2>
        <p className="text-trail-700">
          RandoRank traite des données personnelles conformément au Règlement Général sur
          la Protection des Données (RGPD). Le responsable du traitement est
          [éditeur à compléter, cf. section 1].
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Données collectées</h3>
        <ul className="list-inside list-disc space-y-1 text-trail-700">
          <li>Données d&apos;identification : email, nom d&apos;utilisateur, avatar, région.</li>
          <li>
            Données de localisation issues de tes traces GPX ou de l&apos;enregistrement de
            tes sorties — des données sensibles, car elles peuvent révéler ton lieu de
            domicile ou tes habitudes.
          </li>
          <li>Photos géolocalisées rattachées à tes randos.</li>
          <li>
            Informations de santé que tu choisis de renseigner (facultatif), utilisées
            uniquement pour adapter la génération d&apos;itinéraire à ton niveau.
          </li>
          <li>Données d&apos;abonnement et de facturation, traitées par Stripe.</li>
        </ul>

        <h3 className="text-lg font-semibold text-trail-900">Finalités et base légale</h3>
        <p className="text-trail-700">
          Ces données sont utilisées pour fournir le service (suivi, classement, génération
          d&apos;itinéraire, partage), sur la base de l&apos;exécution du contrat qui te lie à
          RandoRank. Le traitement des données de localisation et de santé repose sur ton
          consentement explicite, recueilli séparément et retirable à tout moment.
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Confidentialité et floutage</h3>
        <p className="text-trail-700">
          Tes statistiques détaillées sont privées. Seuls les kilomètres validés
          apparaissent dans le classement public. Tu peux activer un floutage des points
          de départ et d&apos;arrivée de tes traces pour ne pas exposer ton domicile sur les
          cartes ou fiches partagées.
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Destinataires des données</h3>
        <p className="text-trail-700">
          Tes données sont hébergées et traitées par nos sous-traitants techniques :
          Supabase (authentification et base de données), Stripe (paiement des
          abonnements), un service de stockage compatible S3 (photos), et les moteurs de
          routing utilisés pour la génération d&apos;itinéraire. Aucune donnée n&apos;est
          vendue à des tiers.
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Durée de conservation</h3>
        <p className="text-trail-700">
          Tes données sont conservées tant que ton compte est actif. En cas de suppression
          de compte, tes données personnelles sont supprimées sous [délai à compléter],
          sauf obligation légale de conservation plus longue.
        </p>

        <h3 className="text-lg font-semibold text-trail-900">Tes droits</h3>
        <p className="text-trail-700">
          Conformément au RGPD, tu disposes d&apos;un droit d&apos;accès, de rectification,
          d&apos;export et de suppression de tes données, ainsi que du droit de retirer ton
          consentement à tout moment. Tu peux exercer ces droits depuis les paramètres de
          ton compte ou en écrivant à l&apos;adresse indiquée en section Contact. Tu peux
          également introduire une réclamation auprès de la CNIL (cnil.fr).
        </p>
      </section>

      {/* Cookies */}
      <section id="cookies" className="mt-12 scroll-mt-24 space-y-4">
        <h2 className="text-2xl font-bold text-trail-900">4. Cookies</h2>
        <p className="text-trail-700">
          RandoRank utilise des cookies strictement nécessaires au fonctionnement du
          service, notamment pour maintenir ta session connectée (authentification
          Supabase). Ces cookies ne nécessitent pas de consentement préalable.
        </p>
        <p className="text-trail-700">
          Si des cookies de mesure d&apos;audience ou de publicité venaient à être ajoutés,
          un bandeau de consentement te permettrait de les accepter ou de les refuser
          avant tout dépôt, conformément à la réglementation en vigueur.
        </p>
      </section>

      {/* Contact */}
      <section id="contact" className="mt-12 scroll-mt-24 space-y-4">
        <h2 className="text-2xl font-bold text-trail-900">5. Contact</h2>
        <p className="text-trail-700">
          Pour toute question relative à ces conditions ou à tes données personnelles,
          contacte-nous à [adresse email à compléter].
        </p>
      </section>
    </main>
  );
}