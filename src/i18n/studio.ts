import type { Lang } from "./strings";

/**
 * The studio page in the four site languages. Written in the studio's voice
 * ("we"), with no personal name: the studio is not yet registered and the
 * founder prefers not to appear for now.
 */

type Item = { title: string; text: string; /** what the client receives */ list?: string[] };

export type Studio = {
  statement: string;
  disciplinesLabel: string;
  disciplines: Item[];
  processLabel: string;
  processTitle: string;
  process: Item[];
  /** Under each discipline: the cases where it can be seen */
  seenIn: string;
  /** Under the video example: what the studio did on it, with no client named */
  videoNote: string;
  /** Under the disciplines' tabs: an invitation to keep scrolling */
  scrollHint: string;
  voiceLabel: string;
  /** `{name}` is replaced with the project's name, as a link; `{ep}` with the EP's title. */
  voice: string;
  contactLabel: string;
  /** Shortcut under the statement, down to the contact chapter */
  cta: string;
  contactLead: string;
  form: { name: string; email: string; message: string; send: string; note: string; sending: string; sent: string; error: string };
};

export const STUDIO: Record<Lang, Studio> = {
  en: {
    statement:
      "Independent design studio. Strategy, identity and visual language for brands that want to be told beyond words. Less noise, more intent.",
    disciplinesLabel: "disciplines",
    disciplines: [
      {
        title: "Audiovisual",
        text: "Spaces and brands told in motion, for campaigns and social media, from footage or from renders.",
        list: ["Concept, filming and editing", "Motion and graphics", "Original music and sound design"],
      },
      {
        title: "Spaces and events",
        text: "The brand carried into physical space, where it is seen, touched and walked through.",
        list: ["Stands for fairs and congresses", "Shops, venues and window displays", "Signage and point-of-sale material"],
      },
      {
        title: "Web and interactive 3D",
        text: "Bespoke websites and experiences you can explore: fast, finished to the last detail and made to tell.",
        list: ["Bespoke web design and development", "Spaces and products in 3D to explore", "Ongoing care and improvements"],
      },
      {
        title: "Strategy and identity",
        text: "What a brand is, who it speaks to and how it looks: one clear idea behind everything it does.",
        list: ["Positioning and brand story", "Name, logo and visual system", "Brand guidelines and applications"],
      },
    ],
    seenIn: "in projects",
    videoNote: "In-house production.",
    scrollHint: "scroll to see each discipline",
    processLabel: "process",
    processTitle: "How we work",
    process: [
      { title: "Listen", text: "Understand the project, its context and what it needs to convey." },
      { title: "Find the story", text: "What to tell, in what tone and with what material, before anything is designed." },
      { title: "Build", text: "Design and development, with clear reviews at every stage." },
      { title: "Refine", text: "The details that make everything feel finished." },
    ],
    voiceLabel: "own voice",
    voice:
      "The studio also has a sound of its own: {name}, minimal, spatial, instrumental electronic music. Its first EP, {ep}, is out now.",
    contactLabel: "contact",
    cta: "start a project",
    contactLead: "Have a project in mind? Let's talk.",
    form: {
      name: "name",
      email: "email",
      message: "message",
      send: "send",
      note: "We usually reply within two working days.",
      sending: "sending…",
      sent: "Thank you. Your message has arrived; we'll be in touch soon.",
      error: "It couldn't be sent. Try again, or write to hola@fugahaus.com.",
    },
  },

  es: {
    statement:
      "Estudio de diseño independiente. Estrategia, identidad y lenguaje visual para marcas que quieren contarse más allá de las palabras. Menos ruido, más intención.",
    disciplinesLabel: "disciplinas",
    disciplines: [
      {
        title: "Audiovisual",
        text: "Espacios y marcas contados en movimiento, para campañas y redes, a partir de rodaje o de renders.",
        list: ["Concepto, grabación y montaje", "Motion y grafismo", "Música y diseño sonoro original"],
      },
      {
        title: "Espacios y eventos",
        text: "La marca llevada al espacio físico, donde se ve, se toca y se recorre.",
        list: ["Stands para ferias y congresos", "Imagen de tiendas, locales y escaparates", "Señalética y material de punto de venta"],
      },
      {
        title: "Web y 3D interactivo",
        text: "Webs a medida y experiencias que se recorren: rápidas, cuidadas hasta el último detalle y hechas para contar.",
        list: ["Diseño y desarrollo web a medida", "Espacios y productos en 3D que se pueden explorar", "Mantenimiento y mejoras continuas"],
      },
      {
        title: "Estrategia e identidad",
        text: "Qué es una marca, a quién habla y cómo se ve: una idea clara detrás de todo lo que hace.",
        list: ["Posicionamiento y relato de marca", "Nombre, logotipo y sistema visual", "Guía de marca y aplicaciones"],
      },
    ],
    seenIn: "en proyectos",
    videoNote: "Producción propia.",
    scrollHint: "desliza para ver cada disciplina",
    processLabel: "proceso",
    processTitle: "Cómo trabajamos",
    process: [
      { title: "Escuchar", text: "Entender el proyecto, su contexto y lo que tiene que transmitir." },
      { title: "Encontrar la historia", text: "Qué contar, con qué tono y con qué material, antes de diseñar nada." },
      { title: "Construir", text: "Diseño y desarrollo, con revisiones claras en cada etapa." },
      { title: "Afinar", text: "Los detalles que hacen que todo se sienta terminado." },
    ],
    voiceLabel: "voz propia",
    voice:
      "El estudio también tiene su propio sonido: {name}, música electrónica minimal, espacial e instrumental. Su primer EP, {ep}, ya está publicado.",
    contactLabel: "contacto",
    cta: "empezar un proyecto",
    contactLead: "¿Tienes un proyecto en mente? Hablemos.",
    form: {
      name: "nombre",
      email: "email",
      message: "mensaje",
      send: "enviar",
      note: "Solemos responder en dos días laborables.",
      sending: "enviando…",
      sent: "Gracias. Tu mensaje ha llegado; te escribimos pronto.",
      error: "No se pudo enviar. Inténtalo de nuevo o escribe a hola@fugahaus.com.",
    },
  },

  fr: {
    statement:
      "Studio de design indépendant. Stratégie, identité et langage visuel pour les marques qui veulent se raconter au-delà des mots. Moins de bruit, plus d'intention.",
    disciplinesLabel: "disciplines",
    disciplines: [
      {
        title: "Audiovisuel",
        text: "Des lieux et des marques racontés en mouvement, pour campagnes et réseaux, à partir de tournages ou de rendus.",
        list: ["Concept, tournage et montage", "Motion et graphisme", "Musique et design sonore originaux"],
      },
      {
        title: "Espaces et événements",
        text: "La marque portée dans l'espace physique, là où on la voit, la touche et la parcourt.",
        list: ["Stands pour salons et congrès", "Image de boutiques, de lieux et de vitrines", "Signalétique et PLV"],
      },
      {
        title: "Web et 3D interactive",
        text: "Des sites sur mesure et des expériences à parcourir : rapides, soignés jusqu'au moindre détail et faits pour raconter.",
        list: ["Conception et développement web sur mesure", "Espaces et produits en 3D à explorer", "Maintenance et améliorations continues"],
      },
      {
        title: "Stratégie et identité",
        text: "Ce qu'est une marque, à qui elle parle et à quoi elle ressemble : une idée claire derrière tout ce qu'elle fait.",
        list: ["Positionnement et récit de marque", "Nom, logo et système visuel", "Charte de marque et déclinaisons"],
      },
    ],
    seenIn: "dans les projets",
    videoNote: "Production maison.",
    scrollHint: "faites défiler pour voir chaque discipline",
    processLabel: "processus",
    processTitle: "Notre méthode",
    process: [
      { title: "Écouter", text: "Comprendre le projet, son contexte et ce qu'il doit transmettre." },
      { title: "Trouver l'histoire", text: "Quoi raconter, sur quel ton et avec quelle matière, avant de dessiner quoi que ce soit." },
      { title: "Construire", text: "Design et développement, avec des validations claires à chaque étape." },
      { title: "Affiner", text: "Les détails qui donnent le sentiment d'un travail abouti." },
    ],
    voiceLabel: "voix propre",
    voice:
      "Le studio a aussi son propre son : {name}, musique électronique minimale, spatiale et instrumentale. Son premier EP, {ep}, est disponible.",
    contactLabel: "contact",
    cta: "démarrer un projet",
    contactLead: "Un projet en tête ? Parlons-en.",
    form: {
      name: "nom",
      email: "email",
      message: "message",
      send: "envoyer",
      note: "Nous répondons en général sous deux jours ouvrés.",
      sending: "envoi…",
      sent: "Merci. Votre message est bien arrivé ; nous vous écrivons bientôt.",
      error: "L'envoi a échoué. Réessayez ou écrivez à hola@fugahaus.com.",
    },
  },

  de: {
    statement:
      "Unabhängiges Designstudio. Strategie, Identität und Bildsprache für Marken, die sich jenseits der Worte erzählen wollen. Weniger Rauschen, mehr Absicht.",
    disciplinesLabel: "disziplinen",
    disciplines: [
      {
        title: "Audiovisuell",
        text: "Räume und Marken in Bewegung erzählt, für Kampagnen und Social Media, aus Drehmaterial oder aus Renderings.",
        list: ["Konzept, Dreh und Schnitt", "Motion und Grafik", "Eigene Musik und Sounddesign"],
      },
      {
        title: "Räume und Events",
        text: "Die Marke im physischen Raum, wo man sie sieht, berührt und durchschreitet.",
        list: ["Messe- und Kongressstände", "Läden, Lokale und Schaufenster", "Beschilderung und Point-of-Sale-Material"],
      },
      {
        title: "Web und interaktives 3D",
        text: "Maßgeschneiderte Websites und Erlebnisse zum Erkunden: schnell, bis ins Detail ausgearbeitet und gemacht, um zu erzählen.",
        list: ["Webdesign und -entwicklung nach Maß", "Räume und Produkte in 3D zum Erkunden", "Laufende Pflege und Verbesserungen"],
      },
      {
        title: "Strategie und Identität",
        text: "Was eine Marke ist, wen sie anspricht und wie sie aussieht: eine klare Idee hinter allem, was sie tut.",
        list: ["Positionierung und Markengeschichte", "Name, Logo und visuelles System", "Markenrichtlinien und Anwendungen"],
      },
    ],
    seenIn: "in projekten",
    videoNote: "Eigenproduktion.",
    scrollHint: "scrollen, um jede Disziplin zu sehen",
    processLabel: "prozess",
    processTitle: "Wie wir arbeiten",
    process: [
      { title: "Zuhören", text: "Das Projekt verstehen, seinen Kontext und was es vermitteln soll." },
      { title: "Die Geschichte finden", text: "Was erzählt wird, in welchem Ton und mit welchem Material, bevor etwas gestaltet wird." },
      { title: "Bauen", text: "Design und Entwicklung, mit klaren Abstimmungen in jeder Phase." },
      { title: "Verfeinern", text: "Die Details, durch die alles vollendet wirkt." },
    ],
    voiceLabel: "eigene stimme",
    voice:
      "Das Studio hat auch einen eigenen Klang: {name}, minimale, räumliche, instrumentale elektronische Musik. Die erste EP, {ep}, ist erschienen.",
    contactLabel: "kontakt",
    cta: "projekt starten",
    contactLead: "Ein Projekt im Kopf? Sprechen wir darüber.",
    form: {
      name: "name",
      email: "e-mail",
      message: "nachricht",
      send: "senden",
      note: "Wir antworten in der Regel innerhalb von zwei Werktagen.",
      sending: "wird gesendet…",
      sent: "Danke. Ihre Nachricht ist angekommen; wir melden uns bald.",
      error: "Senden fehlgeschlagen. Versuchen Sie es erneut oder schreiben Sie an hola@fugahaus.com.",
    },
  },
};
