/**
 * Every visible string of the landing, the index, the header, the footer and
 * the contact menu, in the four site languages.
 *
 * "Designing atmospheres." is the brand line and stays in English everywhere.
 * French and German should be read by a native speaker before launch.
 */

export const LANGS = ["en", "es", "fr", "de"] as const;
export type Lang = (typeof LANGS)[number];

const en = {
  "hero.title": "Designing atmospheres.",
  "hero.sub": "Identity, web and video.",
  "hero.cta": "see projects",

  "status": "studio open",
  "index.open": "index",
  "index.close": "close",
  "index.aria.open": "Open index",
  "index.aria.close": "Close index",
  "index.footer": "fuga haus — index",
  "index.here": "you are here",
  "index.home": "home",
  "top": "back to top",
  "artwork.listen": "listen on spotify",
  "artwork.pieces": "pieces",
  "artwork.prev": "previous",
  "artwork.next": "next",

  "section.projects": "projects",
  "section.artwork": "artwork",
  "section.studio": "info",
  "section.projects.caption": "selected works — identity, web, video",
  "section.artwork.caption": "experiments, covers & rendered matter",
  "section.studio.caption": "studio, process & contact",

  "availability": "open to new projects",

  "contact.via": "write via",
  "contact.mailApp": "mail app",
  "contact.copy": "copy address",
  "contact.copied": "copied",
  "contact.subject": "Project enquiry — Fuga Haus",

  "footer.together": "let's work together",
  "lang.label": "Language",
  "privacy": "privacy",
  "meta.description": "Fuga Haus is a design studio for brand identity, web and video.",
};

export type Key = keyof typeof en;

const es: Record<Key, string> = {
  "hero.title": "Designing atmospheres.",
  "hero.sub": "Identidad, web y vídeo.",
  "hero.cta": "ver proyectos",

  "status": "estudio abierto",
  "index.open": "índice",
  "index.close": "cerrar",
  "index.aria.open": "Abrir índice",
  "index.aria.close": "Cerrar índice",
  "index.footer": "fuga haus — índice",
  "index.here": "estás aquí",
  "index.home": "inicio",
  "top": "volver arriba",
  "artwork.listen": "escuchar en spotify",
  "artwork.pieces": "piezas",
  "artwork.prev": "anterior",
  "artwork.next": "siguiente",

  "section.projects": "proyectos",
  "section.artwork": "obra",
  "section.studio": "info",
  "section.projects.caption": "trabajos seleccionados — identidad, web, vídeo",
  "section.artwork.caption": "experimentos, portadas y materia renderizada",
  "section.studio.caption": "estudio, proceso y contacto",

  "availability": "abierto a nuevos proyectos",

  "contact.via": "escribir por",
  "contact.mailApp": "app de correo",
  "contact.copy": "copiar dirección",
  "contact.copied": "copiada",
  "contact.subject": "Consulta de proyecto — Fuga Haus",

  "footer.together": "trabajemos juntos",
  "lang.label": "Idioma",
  "privacy": "privacidad",
  "meta.description": "Fuga Haus es un estudio de diseño de identidad de marca, web y vídeo.",
};

const fr: Record<Key, string> = {
  "hero.title": "Designing atmospheres.",
  "hero.sub": "Identité, web et vidéo.",
  "hero.cta": "voir les projets",

  "status": "studio ouvert",
  "index.open": "index",
  "index.close": "fermer",
  "index.aria.open": "Ouvrir l'index",
  "index.aria.close": "Fermer l'index",
  "index.footer": "fuga haus — index",
  "index.here": "vous êtes ici",
  "index.home": "accueil",
  "top": "retour en haut",
  "artwork.listen": "écouter sur spotify",
  "artwork.pieces": "pièces",
  "artwork.prev": "précédente",
  "artwork.next": "suivante",

  "section.projects": "projets",
  "section.artwork": "œuvres",
  "section.studio": "info",
  "section.projects.caption": "travaux choisis — identité, web, vidéo",
  "section.artwork.caption": "expériences, pochettes & matière rendue",
  "section.studio.caption": "studio, processus & contact",

  "availability": "ouvert aux nouveaux projets",

  "contact.via": "écrire via",
  "contact.mailApp": "app mail",
  "contact.copy": "copier l'adresse",
  "contact.copied": "copiée",
  "contact.subject": "Demande de projet — Fuga Haus",

  "footer.together": "travaillons ensemble",
  "lang.label": "Langue",
  "privacy": "confidentialité",
  "meta.description": "Fuga Haus est un studio de design : identité de marque, web et vidéo.",
};

const de: Record<Key, string> = {
  "hero.title": "Designing atmospheres.",
  "hero.sub": "Identität, Web und Video.",
  "hero.cta": "projekte ansehen",

  "status": "studio geöffnet",
  "index.open": "index",
  "index.close": "schliessen",
  "index.aria.open": "Index öffnen",
  "index.aria.close": "Index schliessen",
  "index.footer": "fuga haus — index",
  "index.here": "sie sind hier",
  "index.home": "startseite",
  "top": "nach oben",
  "artwork.listen": "auf spotify hören",
  "artwork.pieces": "werke",
  "artwork.prev": "zurück",
  "artwork.next": "weiter",

  "section.projects": "projekte",
  "section.artwork": "arbeiten",
  "section.studio": "info",
  "section.projects.caption": "ausgewählte arbeiten — identität, web, video",
  "section.artwork.caption": "experimente, cover & gerenderte materie",
  "section.studio.caption": "studio, prozess & kontakt",

  "availability": "offen für neue projekte",

  "contact.via": "schreiben über",
  "contact.mailApp": "mail-app",
  "contact.copy": "adresse kopieren",
  "contact.copied": "kopiert",
  "contact.subject": "Projektanfrage — Fuga Haus",

  "footer.together": "lass uns zusammenarbeiten",
  "lang.label": "Sprache",
  "privacy": "datenschutz",
  "meta.description": "Fuga Haus ist ein Designstudio für Markenidentität, Web und Video.",
};

export const STRINGS: Record<Lang, Record<Key, string>> = { en, es, fr, de };
