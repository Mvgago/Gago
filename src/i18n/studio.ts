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
      "Independent design studio. Strategy, identity and visual language for brands that want to be told beyond words. Less noise, more intent.",
    disciplinesLabel: "disciplines",
    disciplines: [
      {
        title: "Film and motion",
        text: "Brands and spaces told in motion for campaigns and social media, with footage, 3D or generative AI.",
        list: ["Art direction and production", "Editing, motion and generative video", "Original music and sound design"],
      },
      {
        title: "Interactive 3D and web design",
        text: "Spaces and products in 3D you can walk through, and bespoke websites, fast and intuitive.",
        list: ["3D viewers for spaces and products", "Renders for campaigns and developments", "UX/UI design, bespoke websites and upkeep"],
      },
      {
        title: "Spaces and events",
        text: "The brand carried into physical space, where it is seen, touched and walked through.",
        list: ["Stands for fairs and congresses", "Shops, venues and window displays", "Signage and point of sale"],
      },
      {
        title: "Strategy and identity",
        text: "What a brand is, who it speaks to and how it looks: one clear idea behind everything it does.",
        list: ["Story and value proposition", "Visual identity and brand guidelines", "SEO, SEM and digital content"],
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
    closing: "It all starts with a conversation.", closingNote: "A small studio, no go-betweens. Whole projects, single pieces or month-by-month support, always in the same hands.",
    process: [
      { title: "Listen", text: "Understand the project, its context and what it needs to convey." },
      { title: "Find the story", text: "What to tell, in what tone and with what material, before anything is designed." },
      { title: "Build", text: "Design and development, with clear reviews at every stage." },
      { title: "Refine", text: "The details that make everything feel finished." },
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
      "Estudio de diseño independiente. Estrategia, identidad y lenguaje visual para marcas que quieren contarse más allá de las palabras. Menos ruido, más intención.",
    disciplinesLabel: "disciplinas",
    disciplines: [
      {
        title: "Vídeo y motion",
        text: "Marcas y espacios contados en movimiento para campañas y redes, con rodaje, 3D o IA generativa.",
        list: ["Dirección de arte y producción", "Montaje, motion y vídeo generativo", "Música original y diseño sonoro"],
      },
      {
        title: "3D interactivo y diseño web",
        text: "Espacios y productos en 3D que se pueden recorrer, y webs a medida, rápidas e intuitivas.",
        list: ["Visores 3D de espacios y productos", "Renders para campañas y promociones", "Diseño UX/UI, webs a medida y mantenimiento"],
      },
      {
        title: "Espacios y eventos",
        text: "La marca llevada al espacio físico, donde se ve, se toca y se recorre.",
        list: ["Stands para ferias y congresos", "Tiendas, locales y escaparates", "Señalética y punto de venta"],
      },
      {
        title: "Estrategia e identidad",
        text: "Qué es una marca, a quién habla y cómo se ve: una idea clara detrás de todo lo que hace.",
        list: ["Relato y propuesta de valor", "Identidad visual y guía de marca", "SEO, SEM y contenido digital"],
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
    closing: "Todo empieza con una conversación.", closingNote: "Un estudio pequeño, sin intermediarios. Proyectos completos, piezas concretas o acompañamiento mes a mes, siempre en las mismas manos.",
    process: [
      { title: "Escuchar", text: "Entender el proyecto, su contexto y lo que tiene que transmitir." },
      { title: "Encontrar la historia", text: "Qué contar, con qué tono y con qué material, antes de diseñar nada." },
      { title: "Construir", text: "Diseño y desarrollo, con revisiones claras en cada etapa." },
      { title: "Afinar", text: "Los detalles que hacen que todo se sienta terminado." },
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
      "Studio de design indépendant. Stratégie, identité et langage visuel pour les marques qui veulent se raconter au-delà des mots. Moins de bruit, plus d'intention.",
    disciplinesLabel: "disciplines",
    disciplines: [
      {
        title: "Vidéo et motion design",
        text: "Des marques et des lieux racontés en mouvement pour campagnes et réseaux, par le tournage, la 3D ou l’IA générative.",
        list: ["Direction artistique et production", "Montage, motion et vidéo générative", "Musique originale et design sonore"],
      },
      {
        title: "3D interactive et design web",
        text: "Des espaces et des produits en 3D à parcourir, et des sites sur mesure, rapides et intuitifs.",
        list: ["Visites 3D d'espaces et de produits", "Rendus pour campagnes et programmes", "Design UX/UI, sites sur mesure et maintenance"],
      },
      {
        title: "Espaces et événements",
        text: "La marque portée dans l'espace physique, là où on la voit, la touche et la parcourt.",
        list: ["Stands pour salons et congrès", "Boutiques, lieux et vitrines", "Signalétique et PLV"],
      },
      {
        title: "Stratégie et identité",
        text: "Ce qu'est une marque, à qui elle parle et à quoi elle ressemble : une idée claire derrière tout ce qu'elle fait.",
        list: ["Récit et proposition de valeur", "Identité visuelle et charte de marque", "SEO, SEA et contenus numériques"],
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
    closing: "Tout commence par une conversation.", closingNote: "Un petit studio, sans intermédiaires. Projets complets, pièces ponctuelles ou accompagnement au mois, toujours entre les mêmes mains.",
    process: [
      { title: "Écouter", text: "Comprendre le projet, son contexte et ce qu'il doit transmettre." },
      { title: "Trouver l'histoire", text: "Quoi raconter, sur quel ton et avec quelle matière, avant de dessiner quoi que ce soit." },
      { title: "Construire", text: "Design et développement, avec des validations claires à chaque étape." },
      { title: "Affiner", text: "Les détails qui donnent le sentiment d'un travail abouti." },
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
      "Unabhängiges Designstudio. Strategie, Identität und Bildsprache für Marken, die sich jenseits der Worte erzählen wollen. Weniger Rauschen, mehr Absicht.",
    disciplinesLabel: "disziplinen",
    disciplines: [
      {
        title: "Film und Motion",
        text: "Marken und Räume in Bewegung erzählt, für Kampagnen und Social Media, mit Dreh, 3D oder generativer KI.",
        list: ["Art Direction und Produktion", "Schnitt, Motion und generatives Video", "Eigene Musik und Sounddesign"],
      },
      {
        title: "Interaktives 3D und Webdesign",
        text: "Räume und Produkte in 3D zum Durchwandern und maßgeschneiderte Websites, schnell und intuitiv.",
        list: ["3D-Viewer für Räume und Produkte", "Renderings für Kampagnen und Projekte", "UX/UI-Design, Websites nach Maß und Wartung"],
      },
      {
        title: "Räume und Events",
        text: "Die Marke im physischen Raum, wo man sie sieht, berührt und durchschreitet.",
        list: ["Messe- und Kongressstände", "Läden, Lokale und Schaufenster", "Beschilderung und Point of Sale"],
      },
      {
        title: "Strategie und Identität",
        text: "Was eine Marke ist, wen sie anspricht und wie sie aussieht: eine klare Idee hinter allem, was sie tut.",
        list: ["Geschichte und Wertversprechen", "Visuelle Identität und Markenrichtlinien", "SEO, SEA und digitale Inhalte"],
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
    closing: "Alles beginnt mit einem Gespräch.", closingNote: "Ein kleines Studio, ohne Umwege. Gesamtprojekte, einzelne Stücke oder monatliche Begleitung, immer in denselben Händen.",
    process: [
      { title: "Zuhören", text: "Das Projekt verstehen, seinen Kontext und was es vermitteln soll." },
      { title: "Die Geschichte finden", text: "Was erzählt wird, in welchem Ton und mit welchem Material, bevor etwas gestaltet wird." },
      { title: "Bauen", text: "Design und Entwicklung, mit klaren Abstimmungen in jeder Phase." },
      { title: "Verfeinern", text: "Die Details, durch die alles vollendet wirkt." },
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
