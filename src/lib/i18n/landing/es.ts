import type { LandingDict } from "./types";

export const es: LandingDict = {
  meta: {
    title: "RandoRank — Cada sendero se convierte en un reto",
    description:
      "La app de senderismo divertida y comunitaria: retos, clasificaciones e insignias para caminantes y senderistas.",
  },
  header: {
    openMenu: "Abrir el menú",
    closeMenu: "Cerrar el menú",
    menuLabel: "Menú",
    login: "Iniciar sesión",
    signup: "Registrarse",
    language: "Idioma",
    links: {
      ranking: "Clasificación",
      navigation: "Navegación",
      offers: "Ofertas",
      faq: "FAQ",
      spots: "Spots y comunidad",
      follow: "Síganos",
    },
  },
  hero: {
    badge: "🥾 Únase a la comunidad RandoRank",
    titleLine1: "Cada sendero",
    titleLine2: "se convierte en un reto.",
    subtitle:
      "Registre sus rutas, desbloquee nuevas insignias, escale en la clasificación y comparta sus mejores salidas.",
    ctaPrimary: "Crear mi perfil",
    ctaSecondary: "Ya tengo una cuenta",
    imageAlt: "Senderista en una cresta frente a las montañas",
  },
  spots: {
    eyebrow: "Spots y comunidad",
    title: "Sus spots. Sus referencias.",
    text: "Bosque, lago de altura o ascensión con amigos: descubra los spots compartidos por la comunidad y encuentre a los senderistas que ven los mismos amaneceres que usted.",
    items: [
      {
        alt: "Senderista en un sendero de bosque frente a las montañas",
        title: "Sotobosque",
        caption: "Senderos con sombra",
      },
      {
        alt: "Senderista frente a un lago de altura rodeado de cumbres nevadas",
        title: "Lago de altura",
        caption: "Aguas turquesa",
      },
      {
        alt: "Grupo de senderistas en un sendero hacia una cumbre rocosa",
        title: "Cumbres a la vista",
        caption: "Entre senderistas",
      },
    ],
  },
  share: {
    eyebrow: "Presuma de sus hazañas",
    titleLine1: "Una ficha con estilo.",
    titleLine2: "Lista para sus stories.",
    text: "Al final de cada ruta, RandoRank genera automáticamente una ficha visual con su recorrido, sus estadísticas y sus mejores fotos — pensada para Instagram, TikTok y Facebook, no para quedarse olvidada en un cajón.",
    shareOn: "Comparta en",
    cta: "Crear mi primera ficha",
    floatingTap: { label: "En un toque", value: "Lista para compartir" },
    floatingUnlocked: { label: "Desbloqueado", value: "Pico del Diablo" },
    imageAlt: "Ficha de ruta generada por RandoRank, lista para compartir",
    date: "12.06.26",
    routeName: "Cresta de las Tres Cumbres",
    stats: [
      { v: "14,2", u: "km" },
      { v: "+680", u: "m D+" },
      { v: "4h05", u: "duración" },
    ],
  },
  route: {
    eyebrow: "Genere su ruta",
    titleLine1: "Indique su distancia.",
    titleLine2: "RandoRank se ocupa del resto.",
    text: "Indique la distancia que se ve capaz de recorrer — y su objetivo, si lo tiene. RandoRank le propone una ruta realmente transitable y luego la ajusta a su nivel y a la información de salud de su perfil, para sugerirle un trazado adaptado en lugar de un itinerario genérico.",
    cta: "Preparar mi itinerario",
    floatingRoute: { label: "Itinerario generado", value: "12 km" },
    floatingElevation: { label: "Desnivel máx.", value: "+450 m" },
    level: "Nivel aficionado",
    start: "Salida",
    end: "Llegada",
    mapAlt: "Extracto de mapa, zona de Chamonix",
    distance: "Distancia",
    distanceValue: "12 km",
    duration: "Duración estimada",
    durationValue: "3h15",
    startCta: "Empezar la salida",
  },
  ranking: {
    eyebrow: "Clasificación",
    titleLine1: "Cada kilómetro",
    titleLine2: "cuenta.",
    text: "Los kilómetros realmente recorridos le hacen subir. Siga su posición en la clasificación, desbloquee insignias y supere sus propios objetivos, o los de sus amigos.",
    floatingPosition: { label: "Su posición", value: "#3" },
    floatingNext: { label: "Para pasar al #2", value: "6,4 km" },
    month: "Clasificación · Septiembre 2026",
    tabs: { national: "Nacional", region: "Región", friends: "Amigos" },
    you: "Usted",
    kms: ["58,1 km", "48,5 km", "42,0 km", "39,7 km"],
  },
  community: {
    eyebrow: "Comunidad en movimiento",
    title: "No son solo cifras.",
    text: "Son todos los kilómetros realmente recorridos y validados por todos los senderistas de RandoRank.",
    kmLabel: "Recorridos por la comunidad",
    elevationLabel: "De desnivel acumulado",
    chartLabel: "Kilómetros acumulados por semana, toda la comunidad",
  },
  offers: {
    eyebrow: "Ofertas",
    title: "Le MUL. Punto.",
    text: "Una sola oferta, todo incluido: rutas, trazados y fotos ilimitados, clasificación completa. El detalle de las tarifas se muestra en cuanto cree su perfil.",
    cta: "Crear mi perfil",
  },
  about: {
    eyebrow: "RandoRank en pocas palabras",
    text: "RandoRank le ayuda a preparar itinerarios de senderismo según su nivel, a compartir su pasión y a descubrir nuevos spots. Registre cada recorrido, analice sus rutas y compárese con sus amigos y con todos los senderistas del sitio — por región, por departamento, hasta el ámbito nacional.",
  },
  faq: {
    eyebrow: "Todo claro",
    title: "Preguntas frecuentes",
    items: [
      {
        question: "¿RandoRank es de pago?",
        answer:
          "Sí: RandoRank funciona únicamente con suscripción Premium (mensual o anual, cancelable en cualquier momento). Tiene acceso a todo: rutas y trazados ilimitados, fotos, clasificación nacional y regional, insignias — el detalle de las tarifas se muestra al crear su perfil.",
      },
      {
        question: "¿Cómo funciona la generación de itinerarios?",
        answer:
          "Usted indica la distancia que quiere recorrer (y, si lo desea, un punto de partida o un desnivel máximo). RandoRank le propone una ruta realmente transitable y luego afina la propuesta según su nivel y la información de salud que indica en su perfil, para sugerirle un trazado adaptado en lugar de un simple itinerario genérico.",
      },
      {
        question: "¿Mis estadísticas son públicas?",
        answer:
          "Sus estadísticas detalladas siguen siendo privadas y le sirven sobre todo para analizar su propia evolución. Solo los kilómetros validados aparecen en la clasificación pública, para comparar su progreso con el de otros senderistas sin exponer el detalle de sus salidas.",
      },
      {
        question: "¿Cómo se validan los kilómetros?",
        answer:
          "Cada track importado o grabado pasa por controles de coherencia: velocidad plausible, continuidad en el tiempo, desnivel coherente con el relieve y detección de teletransportes. Objetivo: una clasificación que refleje salidas reales, no archivos manipulados.",
      },
    ],
    disclaimer:
      "RandoRank le da referencias, no consignas de seguridad en montaña: compruebe siempre el tiempo y sus propias capacidades antes de salir.",
  },
  finalCta: {
    title: "Su primer reto le espera.",
    text: "Únase a los senderistas que registran, comparten y progresan juntos.",
    cta: "Crear mi perfil",
    imageAlt: "Sendero de bosque que lleva hacia las montañas",
  },
  footer: {
    tagline:
      "El cuaderno de ruta de los senderistas: salidas, retos y clasificaciones entre apasionados.",
    navTitle: "Navegación",
    nav: {
      routes: "Itinerarios",
      analyses: "Análisis",
      rankings: "Clasificaciones",
      offers: "Ofertas",
      faq: "FAQ",
    },
    legalTitle: "Legal",
    legal: {
      notice: "Aviso legal (FR)",
      privacy: "Privacidad (FR)",
      cookies: "Cookies (FR)",
      terms: "Condiciones (FR)",
    },
    followTitle: "Síganos",
    rights: "Todos los derechos reservados.",
  },
};
