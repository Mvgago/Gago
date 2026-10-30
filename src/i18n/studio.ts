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
  workLabel: string;
  labArtLabel: string;
  labArtText: string;
  /** that the pieces are original and can be had: for a space, on commission, in limited editions */
  labArtOffer: string;
  labArtCta: string;
  labSoundLabel: string;
  labPlaying: string;
  workTitle: string;
  workAll: string;
  closing: string; closingNote: string;
  process: Item[];
  /** Under each discipline: the cases where it can be seen */
  seenIn: string;
  /** Under the video example: what the studio did on it, with no client named */
  videoNote: string;
  /** Under the disciplines' tabs: an invitation to keep scrolling */
  scrollHint: string;
  endTitle: string;
  endTalk: string;
  /** beside the invitation to talk: the way to the projects */
  endWork: string;
  voiceLabel: string;
  /** `{name}` is replaced with the project's name. */
  voice: string;
  contactLabel: string;
  /** Shortcut under the statement, down to the contact chapter */
  cta: string;
  contactLead: string;
  form: { name: string; email: string; phone: string; message: string; send: string; note: string; sending: string; sent: string; error: string; sentTitle: string; another: string; more: string; good: string; hooked: string; errName: string; errEmail: string; errMessage: string; privacy: string; privacyLink: string };
};

export const STUDIO: Record<Lang, Studio> = {
  en: {
    statement:
      "A fugue is one theme sung in several voices. That is how we work a brand: one clear idea, recognised in the place, on the screen and in every image.",
    disciplinesLabel: "disciplines",
    disciplines: [
      {
        title: "Film and narrative",
        text: "Places, products and people told in motion: campaigns, pieces for social media and film for spaces.",
        list: ["Direction and location shooting", "3D integrated into live footage", "Editing, motion and original sound"],
      },
      {
        title: "Spaces and events",
        text: "The brand carried to where it is lived: stands, shops, venues and events. We design the space and its digital layer together, and follow it through production.",
        list: ["Stands for fairs and congresses", "Shops, venues and window displays", "Signage, applied graphics and interactive installations"],
      },
      {
        title: "3D and web",
        text: "Spaces and products in 3D you can walk through, and bespoke websites that help sell: fast, clear and true to the real thing.",
        list: ["3D viewers and configurators", "UX/UI design and bespoke web development", "Upkeep, accessibility and ongoing evolution"],
      },
      {
        title: "Strategy and identity",
        text: "The thread that ties it all together: what makes a brand unique, and how it is recognised in every place and on every screen.",
        list: ["Strategy and value proposition", "Identity and brand system", "Guidelines for on-brand content, AI-made included"],
      },
    ],
    seenIn: "in projects",
    videoNote: "In-house production.",
    scrollHint: "scroll to see each discipline",
    endTitle: "Shall we make something together?",
    endTalk: "let's talk", endWork: "see the projects",
    processLabel: "process",
    processTitle: "How we work",
    labSoundLabel: "sound",
    labPlaying: "in the headphones",
    labArtLabel: "illustration and photography",
    labArtText: "Illustration, covers and photography. A space to explore a visual language of its own.",
    labArtOffer: "Original work. Also on commission, made for a particular space.",
    labArtCta: "Write to us.",
    workLabel: "projects",
    workTitle: "Recent work",
    workAll: "see all projects",
    closing: "It all starts with a conversation.", closingNote: "One point of contact from start to finish. We design and direct, and bring in trusted workshops and collaborators when a project calls for it: whole projects, single pieces or ongoing support.",
    process: [
      { title: "Listen", text: "Understand the project, its context and what it needs to convey." },
      { title: "Find the story", text: "What to tell, in what tone and with what material, before anything is designed." },
      { title: "Build", text: "Design and development, with clear reviews at every stage." },
      { title: "Refine and follow through", text: "The details that make everything feel finished, and support after launch." },
    ],
    voiceLabel: "own voice",
    voice:
      "The studio also produces music: original scores and sound design for brands, spaces and films. {name} is its own project, minimal, spatial, instrumental electronic music.",
    contactLabel: "contact",
    cta: "start a project",
    contactLead: "Have a project in mind? Let's talk.",
    form: {
      name: "name",
      phone: "phone (optional)",
      email: "email",
      message: "message",
      send: "send",
      note: "We usually reply within two working days.",
      more: "tell us more…",
      good: "this is looking good.",
      hooked: "all right, now we're curious.",
      errName: "your name is missing",
      errEmail: "check your email",
      errMessage: "write us a few words",
      privacy: "We use your details only to reply to you. More in ",
      privacyLink: "privacy",
      sending: "sending…",
      sent: "We've received it and will reply within two working days.",
      sentTitle: "Message sent",
      another: "write another message",
      error: "It couldn't be sent. Try again, or write to hola@fugahaus.com.",
    },
  },

  es: {
    statement:
      "Una fuga es un mismo tema que suena en varias voces. Así trabajamos una marca: una idea clara que se reconoce en el lugar, en la pantalla y en cada imagen.",
    disciplinesLabel: "disciplinas",
    disciplines: [
      {
        title: "Rodaje y narrativa",
        text: "Lugares, productos y personas contados en movimiento: campañas, piezas para redes y vídeo para espacios.",
        list: ["Dirección y rodaje en localización", "Integración 3D sobre imagen real", "Edición, motion y sonido original"],
      },
      {
        title: "Espacios y eventos",
        text: "Llevamos la marca al lugar donde se vive: stands, tiendas, locales y eventos. Diseñamos el espacio y su capa digital juntos, y acompañamos su producción.",
        list: ["Stands para ferias y congresos", "Tiendas, locales y escaparates", "Señalética, gráfica aplicada e instalaciones interactivas"],
      },
      {
        title: "3D y web",
        text: "Espacios y productos en 3D que se recorren, y webs a medida que ayudan a vender: rápidas, claras y fieles a lo real.",
        list: ["Visores y configuradores 3D", "Diseño UX/UI y desarrollo web a medida", "Mantenimiento, accesibilidad y evolución"],
      },
      {
        title: "Estrategia e identidad",
        text: "El hilo que lo une todo: qué hace única a una marca y cómo se reconoce en cada lugar y en cada pantalla.",
        list: ["Estrategia y propuesta de valor", "Identidad y sistema de marca", "Guías para crear contenido de marca, también con IA"],
      },
    ],
    seenIn: "en proyectos",
    videoNote: "Producción propia.",
    scrollHint: "desliza para ver cada disciplina",
    endTitle: "¿Hacemos algo juntos?",
    endTalk: "hablemos", endWork: "ver proyectos",
    processLabel: "proceso",
    processTitle: "Cómo trabajamos",
    labSoundLabel: "sonido",
    labPlaying: "en los cascos",
    labArtLabel: "ilustración y fotografía",
    labArtText: "Ilustración, portadas y fotografía. Un espacio para explorar un lenguaje visual propio.",
    labArtOffer: "Obra original. También por encargo, pensada para un espacio concreto.",
    labArtCta: "Escríbenos.",
    workLabel: "proyectos",
    workTitle: "Trabajo reciente",
    workAll: "ver todos los proyectos",
    closing: "Todo empieza con una conversación.", closingNote: "Un solo interlocutor de principio a fin. Diseñamos y dirigimos, y sumamos talleres y colaboradores de confianza cuando el proyecto lo pide: proyectos completos, encargos puntuales o colaboraciones continuadas.",
    process: [
      { title: "Escuchar", text: "Entender el proyecto, su contexto y lo que tiene que transmitir." },
      { title: "Encontrar la historia", text: "Qué contar, con qué tono y con qué material, antes de diseñar nada." },
      { title: "Construir", text: "Diseño y desarrollo, con revisiones claras en cada etapa." },
      { title: "Afinar y acompañar", text: "Los detalles que hacen que todo se sienta terminado, y el seguimiento después del lanzamiento." },
    ],
    voiceLabel: "voz propia",
    voice:
      "El estudio también produce música: bandas sonoras originales y diseño sonoro para marcas, espacios y piezas audiovisuales. {name} es su proyecto propio, electrónica minimal, espacial e instrumental.",
    contactLabel: "contacto",
    cta: "empezar un proyecto",
    contactLead: "¿Tienes un proyecto en mente? Hablemos.",
    form: {
      name: "nombre",
      phone: "teléfono (opcional)",
      email: "email",
      message: "mensaje",
      send: "enviar",
      note: "Solemos responder en dos días laborables.",
      more: "cuéntanos más…",
      good: "esto pinta bien.",
      hooked: "vale, ya nos tienes intrigados.",
      errName: "falta tu nombre",
      errEmail: "revisa tu email",
      errMessage: "escríbenos unas palabras",
      privacy: "Usamos tus datos solo para responderte. Más información en ",
      privacyLink: "privacidad",
      sending: "enviando…",
      sent: "Lo hemos recibido y te respondemos en dos días laborables.",
      sentTitle: "Mensaje enviado",
      another: "escribir otro mensaje",
      error: "No se pudo enviar. Inténtalo de nuevo o escribe a hola@fugahaus.com.",
    },
  },

  fr: {
    statement:
      "Une fugue, c'est un même thème qui résonne à plusieurs voix. C'est ainsi que nous travaillons une marque : une idée claire, reconnaissable dans le lieu, à l'écran et dans chaque image.",
    disciplinesLabel: "disciplines",
    disciplines: [
      {
        title: "Tournage et récit",
        text: "Des lieux, des produits et des personnes racontés en mouvement : campagnes, contenus pour les réseaux et vidéo pour les espaces.",
        list: ["Réalisation et tournage en décor réel", "Intégration 3D sur images réelles", "Montage, motion et son original"],
      },
      {
        title: "Espaces et événements",
        text: "La marque portée là où elle se vit : stands, boutiques, lieux et événements. Nous concevons l'espace et sa couche numérique ensemble, et accompagnons sa production.",
        list: ["Stands pour salons et congrès", "Boutiques, lieux et vitrines", "Signalétique, graphisme appliqué et installations interactives"],
      },
      {
        title: "3D et web",
        text: "Des espaces et des produits en 3D que l'on parcourt, et des sites sur mesure qui aident à vendre : rapides, clairs et fidèles au réel.",
        list: ["Visionneuses et configurateurs 3D", "Design UX/UI et développement web sur mesure", "Maintenance, accessibilité et évolution"],
      },
      {
        title: "Stratégie et identité",
        text: "Le fil qui relie tout : ce qui rend une marque unique, et comment on la reconnaît en chaque lieu et sur chaque écran.",
        list: ["Stratégie et proposition de valeur", "Identité et système de marque", "Guides pour créer du contenu de marque, IA comprise"],
      },
    ],
    seenIn: "dans les projets",
    videoNote: "Production maison.",
    scrollHint: "faites défiler pour voir chaque discipline",
    endTitle: "On fait quelque chose ensemble ?",
    endTalk: "parlons-en", endWork: "voir les projets",
    processLabel: "processus",
    processTitle: "Notre méthode",
    labSoundLabel: "son",
    labPlaying: "dans le casque",
    labArtLabel: "illustration et photographie",
    labArtText: "Illustration, pochettes et photographie. Un espace pour explorer un langage visuel propre.",
    labArtOffer: "Œuvres originales. Aussi sur commande, pensées pour un espace précis.",
    labArtCta: "Écrivez-nous.",
    workLabel: "projets",
    workTitle: "Travaux récents",
    workAll: "voir tous les projets",
    closing: "Tout commence par une conversation.", closingNote: "Un seul interlocuteur du début à la fin. Nous concevons et dirigeons, et faisons appel à des ateliers et des collaborateurs de confiance quand le projet le demande : projets complets, pièces ponctuelles ou accompagnement suivi.",
    process: [
      { title: "Écouter", text: "Comprendre le projet, son contexte et ce qu'il doit transmettre." },
      { title: "Trouver l'histoire", text: "Quoi raconter, sur quel ton et avec quelle matière, avant de dessiner quoi que ce soit." },
      { title: "Construire", text: "Design et développement, avec des validations claires à chaque étape." },
      { title: "Affiner et accompagner", text: "Les détails qui donnent le sentiment d'un travail abouti, et le suivi après le lancement." },
    ],
    voiceLabel: "voix propre",
    voice:
      "Le studio produit aussi de la musique : bandes originales et design sonore pour des marques, des espaces et des films. {name} est son projet propre, une électronique minimale, spatiale et instrumentale.",
    contactLabel: "contact",
    cta: "démarrer un projet",
    contactLead: "Un projet en tête ? Parlons-en.",
    form: {
      name: "nom",
      phone: "téléphone (facultatif)",
      email: "email",
      message: "message",
      send: "envoyer",
      note: "Nous répondons en général sous deux jours ouvrés.",
      more: "dites-nous-en plus…",
      good: "ça s'annonce bien.",
      hooked: "bon, là vous nous intriguez.",
      errName: "il manque votre nom",
      errEmail: "vérifiez votre e-mail",
      errMessage: "écrivez-nous quelques mots",
      privacy: "Nous utilisons vos données uniquement pour vous répondre. En savoir plus : ",
      privacyLink: "confidentialité",
      sending: "envoi…",
      sent: "Nous l'avons bien reçu et vous répondons sous deux jours ouvrés.",
      sentTitle: "Message envoyé",
      another: "écrire un autre message",
      error: "L'envoi a échoué. Réessayez ou écrivez à hola@fugahaus.com.",
    },
  },

  de: {
    statement:
      "Eine Fuge ist ein Thema, das in mehreren Stimmen erklingt. So arbeiten wir an einer Marke: eine klare Idee, erkennbar am Ort, auf dem Bildschirm und in jedem Bild.",
    disciplinesLabel: "disziplinen",
    disciplines: [
      {
        title: "Dreh und Erzählung",
        text: "Orte, Produkte und Menschen in Bewegung erzählt: Kampagnen, Inhalte für Social Media und Film für Räume.",
        list: ["Regie und Dreh vor Ort", "3D-Integration in reale Aufnahmen", "Schnitt, Motion und eigener Sound"],
      },
      {
        title: "Räume und Events",
        text: "Die Marke dorthin gebracht, wo sie erlebt wird: Messestände, Läden, Orte und Events. Wir gestalten den Raum und seine digitale Ebene zusammen und begleiten die Umsetzung.",
        list: ["Stände für Messen und Kongresse", "Läden, Orte und Schaufenster", "Leitsysteme, angewandte Grafik und interaktive Installationen"],
      },
      {
        title: "3D und Web",
        text: "Räume und Produkte in 3D zum Durchwandern, und maßgeschneiderte Websites, die beim Verkaufen helfen: schnell, klar und treu zum Original.",
        list: ["3D-Viewer und Konfiguratoren", "UX/UI-Design und individuelle Webentwicklung", "Pflege, Barrierefreiheit und Weiterentwicklung"],
      },
      {
        title: "Strategie und Identität",
        text: "Der Faden, der alles verbindet: was eine Marke einzigartig macht und wie man sie an jedem Ort und auf jedem Bildschirm erkennt.",
        list: ["Strategie und Wertversprechen", "Identität und Markensystem", "Leitfäden für Markeninhalte, auch mit KI erstellt"],
      },
    ],
    seenIn: "in projekten",
    videoNote: "Eigenproduktion.",
    scrollHint: "scrollen, um jede Disziplin zu sehen",
    endTitle: "Machen wir etwas zusammen?",
    endTalk: "sprechen wir", endWork: "Projekte ansehen",
    processLabel: "prozess",
    processTitle: "Wie wir arbeiten",
    labSoundLabel: "klang",
    labPlaying: "im kopfhörer",
    labArtLabel: "Illustration und Fotografie",
    labArtText: "Illustration, Cover und Fotografie. Ein Raum, um eine eigene Bildsprache zu erkunden.",
    labArtOffer: "Originale Arbeiten. Auch als Auftrag, gedacht für einen bestimmten Raum.",
    labArtCta: "Schreiben Sie uns.",
    workLabel: "projekte",
    workTitle: "Aktuelle Arbeiten",
    workAll: "alle projekte ansehen",
    closing: "Alles beginnt mit einem Gespräch.", closingNote: "Ein Ansprechpartner von Anfang bis Ende. Wir gestalten und leiten, und holen vertraute Werkstätten und Partner dazu, wenn das Projekt es verlangt: Gesamtprojekte, einzelne Stücke oder laufende Begleitung.",
    process: [
      { title: "Zuhören", text: "Das Projekt verstehen, seinen Kontext und was es vermitteln soll." },
      { title: "Die Geschichte finden", text: "Was erzählt wird, in welchem Ton und mit welchem Material, bevor etwas gestaltet wird." },
      { title: "Bauen", text: "Design und Entwicklung, mit klaren Abstimmungen in jeder Phase." },
      { title: "Verfeinern und begleiten", text: "Die Details, durch die alles vollendet wirkt, und die Betreuung nach dem Start." },
    ],
    voiceLabel: "eigene stimme",
    voice:
      "Das Studio produziert auch Musik: eigene Soundtracks und Sounddesign für Marken, Räume und Filme. {name} ist sein eigenes Projekt, minimale, räumliche, instrumentale Elektronik.",
    contactLabel: "kontakt",
    cta: "projekt starten",
    contactLead: "Ein Projekt im Kopf? Sprechen wir darüber.",
    form: {
      name: "name",
      phone: "telefon (optional)",
      email: "e-mail",
      message: "nachricht",
      send: "senden",
      note: "Wir antworten in der Regel innerhalb von zwei Werktagen.",
      more: "erzählen Sie mehr…",
      good: "das klingt gut.",
      hooked: "okay, jetzt sind wir neugierig.",
      errName: "Ihr Name fehlt",
      errEmail: "E-Mail prüfen",
      errMessage: "schreiben Sie uns ein paar Worte",
      privacy: "Wir verwenden Ihre Daten nur, um Ihnen zu antworten. Mehr dazu unter ",
      privacyLink: "Datenschutz",
      sending: "wird gesendet…",
      sent: "Wir haben sie erhalten und antworten innerhalb von zwei Werktagen.",
      sentTitle: "Nachricht gesendet",
      another: "eine weitere Nachricht schreiben",
      error: "Senden fehlgeschlagen. Versuchen Sie es erneut oder schreiben Sie an hola@fugahaus.com.",
    },
  },
};
