# RandoRank pour Android (Capacitor)

Coque Android autour de https://randorank.com : l'app charge le site en production, donc
chaque mise à jour du site est visible tout de suite, sans republier sur le Play Store.
Seuls les changements de la coque (icône, permissions, plugins natifs) demandent une nouvelle version.

**Version 1 : position au premier plan seulement.** Pas de localisation en arrière-plan
(l'enregistrement en direct s'interrompt quand l'écran se verrouille, comme sur le web).
Le suivi en arrière-plan est prévu en version 2.

## Identifiant de l'application
`com.randorank.app` (dans `capacitor.config.json`). **Il ne pourra plus être changé après la
première publication.** Modifiez-le avant de créer l'app dans la Play Console si besoin.

## Ce dont vous avez besoin
- Android Studio (inclut le SDK et Java) : https://developer.android.com/studio
- Un compte développeur Google Play (frais uniques d'environ 25 $)
- Un téléphone Android pour tester

## Construire l'application
1. `cd mobile && npm install`
2. `npx cap sync android` (reprend la configuration et les icônes)
3. `npx cap open android` ouvre le projet dans Android Studio
4. Test sur téléphone : branchez-le en USB (mode développeur activé) puis Run.
5. Version à publier : *Build > Generate Signed App Bundle > Android App Bundle*.
   - Créez la clé de signature (`.jks`) quand Android Studio le propose.
   - **Sauvegardez ce fichier et ses mots de passe à plusieurs endroits.** Il n'est pas dans
     le dépôt (ignoré par git). Avec « Play App Signing » activé, Google garde la clé finale ;
     votre clé sert de clé d'envoi.
   - Le fichier produit (`.aab`) est celui à envoyer à la Play Console.

## Compiler dans le cloud (sans Android Studio)
Le workflow `.github/workflows/android-apk.yml` compile l'app sur GitHub et produit un APK de
test (clé de débogage automatique, **pas** le fichier du Play Store).
1. GitHub > onglet *Actions* > « Android APK » > *Run workflow* (il se lance aussi à chaque
   modification du dossier `mobile/`).
2. Quand l'exécution est verte, ouvrez-la et téléchargez l'artefact `randorank-debug-apk`
   (un `.zip` qui contient `app-debug.apk`, conservé 14 jours).
3. Envoyez `app-debug.apk` sur un téléphone Android (câble, e-mail, messagerie) et ouvrez-le.
   Android demande d'autoriser l'installation depuis cette source : acceptez.

## Publication (Play Console)
1. Créer l'application (nom, langue par défaut : français, gratuite).
2. Test fermé : ajouter des testeurs (adresses Gmail). À ma connaissance, un compte personnel
   récent doit avoir environ 12 testeurs pendant 14 jours avant la production : à vérifier
   dans la console.
3. Fiche : icône 512×512 (`public/icons/icon-512.png`), image de présentation 1024×500, au moins
   2 captures d'écran, description courte et longue.
4. Politique de confidentialité : l'adresse de la page confidentialité du site.
5. Formulaire « Sécurité des données » : e-mail, localisation précise (au premier plan), photos,
   données d'activité, collectées et chiffrées en transit ; suppression possible depuis le profil.
6. Suppression de compte : bouton dans le profil et adresse web à renseigner.
7. Classification du contenu et public cible (pas destiné aux enfants).

## Points à trancher avant la production
- **Paiement Premium.** Le paiement du site passe par Stripe. Pour une app distribuée sur le
  Play Store, l'achat d'un abonnement numérique doit en principe passer par Google Play Billing.
  Décision à prendre : intégrer Play Billing, ou ne pas proposer l'achat dans l'app Android.
  Vérifiez la politique Google en vigueur. Le test fermé peut se faire avant cette décision.
- **Connexion Google / Facebook.** Google refuse la connexion OAuth dans une WebView. Dans l'app
  (repérée par `RandoRankApp` dans le user agent), seuls e-mail et mot de passe sont proposés.
- **Mentions légales.** Compléter l'éditeur (SIRET, adresse) : le Play Store exige un contact.

## Test hors ligne
Si le site est injoignable, la page `www/index.html` s'affiche avec un bouton Réessayer.
