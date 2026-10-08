import type { Lang } from "./strings";

/**
 * The studio page in the four site languages. Written in the studio's voice
 * ("we"), with no personal name: the studio is not yet registered and the
 * founder prefers not to appear for now.
 */

type Item = { title: string; text: string };

export type Studio = {
  statement: string;
  disciplinesLabel: string;
  disciplines: Item[];
  processLabel: string;
  process: Item[];
  /** Under each discipline: the cases where it can be seen */
  seenIn: string;
  /** Under the video example: what the studio did on it, with no client named */
  videoNote: string;
  voiceLabel: string;
  /** `{name}` is replaced with the project's name, as a link; `{ep}` with the EP's title. */
  voice: string;
  contactLabel: string;
  /** Shortcut under the statement, down to the contact chapter */
  cta: string;
  contactLead: string;
  form: { name: string; email: string; message: string; send: string; note: string };
};

export const STUDIO: Record<Lang, Studio> = {
  en: {
    statement:
      "Fuga Haus is an independent design studio. We create video, interactive 3D, websites and identities on one principle: less noise, more intent.",
    disciplinesLabel: "disciplines",
    disciplines: [
      {
        title: "Brand identity",
        text: "Name, mark, typography, colour and visual system: a complete, coherent identity, ready to grow.",
      },
      {
        title: "Web",
        text: "Bespoke sites, fast and finished to the last detail, from design to launch. Made to tell, not to fill.",
      },
      {
        title: "Video",
        text: "Pieces for campaigns, spaces and social media: script, editing and motion, from footage or from renders.",
      },
      {
        title: "Interactive 3D",
        text: "Spaces and products in 3D to explore on the web: stands, prototypes and scenes you can turn and touch, light and made to tell.",
      },
    ],
    seenIn: "in projects",
    videoNote: "Editing and scene detail over residential renders.",
    processLabel: "process",
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
      note: "The form opens your mail app.",
    },
  },

  es: {
    statement:
      "Fuga Haus es un estudio de diseño independiente. Creamos vídeo, experiencias 3D, webs e identidades con un mismo principio: menos ruido, más intención.",
    disciplinesLabel: "disciplinas",
    disciplines: [
      {
        title: "Identidad de marca",
        text: "Nombre, símbolo, tipografía, color y sistema visual: una identidad completa y coherente, lista para crecer.",
      },
      {
        title: "Web",
        text: "Sitios a medida, rápidos y cuidados hasta el último detalle, del diseño a la publicación. Hechos para contar, no para rellenar.",
      },
      {
        title: "Vídeo",
        text: "Piezas para campañas, espacios y redes: guion, montaje y motion, a partir de rodaje o de renders.",
      },
      {
        title: "3D interactivo",
        text: "Espacios y productos en 3D que se recorren en la web: stands, prototipos y escenas que se giran y se tocan, ligeras y pensadas para contar.",
      },
    ],
    seenIn: "en proyectos",
    videoNote: "Montaje y dirección de detalle sobre renders residenciales.",
    processLabel: "proceso",
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
      note: "El formulario abre tu aplicación de correo.",
    },
  },

  fr: {
    statement:
      "Fuga Haus est un studio de design indépendant. Nous créons vidéos, expériences 3D, sites web et identités selon un même principe : moins de bruit, plus d'intention.",
    disciplinesLabel: "disciplines",
    disciplines: [
      {
        title: "Identité de marque",
        text: "Nom, symbole, typographie, couleur et système visuel : une identité complète et cohérente, prête à grandir.",
      },
      {
        title: "Web",
        text: "Des sites sur mesure, rapides et soignés jusqu'au moindre détail, de la conception à la mise en ligne. Faits pour raconter, pas pour remplir.",
      },
      {
        title: "Vidéo",
        text: "Des pièces pour campagnes, espaces et réseaux : scénario, montage et motion, à partir de tournages ou de rendus.",
      },
      {
        title: "3D interactive",
        text: "Des espaces et des produits en 3D à parcourir sur le web : stands, prototypes et scènes que l'on tourne et que l'on touche, légers et faits pour raconter.",
      },
    ],
    seenIn: "dans les projets",
    videoNote: "Montage et direction du détail sur des rendus résidentiels.",
    processLabel: "processus",
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
      note: "Le formulaire ouvre votre messagerie.",
    },
  },

  de: {
    statement:
      "Fuga Haus ist ein unabhängiges Designstudio. Wir gestalten Videos, 3D-Erlebnisse, Websites und Identitäten nach einem Prinzip: weniger Rauschen, mehr Absicht.",
    disciplinesLabel: "disziplinen",
    disciplines: [
      {
        title: "Markenidentität",
        text: "Name, Zeichen, Typografie, Farbe und visuelles System: eine vollständige, stimmige Identität, bereit zu wachsen.",
      },
      {
        title: "Web",
        text: "Maßgeschneiderte Websites, schnell und bis ins Detail ausgearbeitet, vom Entwurf bis zum Launch. Gemacht, um zu erzählen, nicht um zu füllen.",
      },
      {
        title: "Video",
        text: "Stücke für Kampagnen, Räume und Social Media: Drehbuch, Schnitt und Motion, aus Drehmaterial oder aus Renderings.",
      },
      {
        title: "Interaktives 3D",
        text: "Räume und Produkte in 3D, die man im Web erkundet: Messestände, Prototypen und Szenen zum Drehen und Berühren, leicht und gemacht, um zu erzählen.",
      },
    ],
    seenIn: "in projekten",
    videoNote: "Schnitt und Szenendetail über Wohnbau-Renderings.",
    processLabel: "prozess",
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
      note: "Das Formular öffnet Ihr E-Mail-Programm.",
    },
  },
};
