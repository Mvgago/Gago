import type { Lang } from "../i18n/strings";

import aleaStrip from "../assets/peojects/alea/alea-strip.jpg";
import aleaDashboard from "../assets/peojects/alea/alea-dashboard-web.jpg";
import aleaPoster from "../assets/peojects/alea/alea-poster-web.jpg";
import aleaStand from "../assets/peojects/alea/alea-stand-web.jpg";
import aleaScreen from "../assets/peojects/alea/alea-screen-web.jpg";
import aleaLaptop from "../assets/peojects/alea/alea.png";
import aleaDesk from "../assets/peojects/alea/alea7.jpeg";import santaStrip from "../assets/peojects/santa/santa-strip.jpg";
import santaFacade from "../assets/peojects/santa/santa (7).jpg";
import santaTerrace from "../assets/peojects/santa/santa (2).jpg";
import santaInterior from "../assets/peojects/santa/santa (1).jpg";
import santaDevices from "../assets/peojects/santa/santa (3).jpg";
import santaSketch from "../assets/peojects/santa/santa (4).jpg";
import santaPalette from "../assets/peojects/santa/santa (5).jpg";
import santaMark from "../assets/peojects/santa/santa (6).jpg";
import santaStationery from "../assets/peojects/santa/santa (8).jpg";import buendiaStrip from "../assets/peojects/buendia/buendia-strip.jpg";
import smStrip from "../assets/peojects/smart/smart-strip.jpg";
import buendiaWeb from "../assets/peojects/buendia/buendia-web-web.jpg";
import buendiaLaptop from "../assets/peojects/buendia/buendia-laptop-web.jpg";
import buendiaBook from "../assets/peojects/buendia/buendia-book-web.jpg";
import buendiaCatalogue from "../assets/peojects/buendia/buendia-catalogue-web.jpg";
import buendiaSocial from "../assets/peojects/buendia/buendia-social-web.jpg";import sapWeb from "../assets/peojects/saphire/saphire.jpg";
import sapKey from "../assets/peojects/saphire/saphire-key.jpg";
import sapAxo from "../assets/peojects/saphire/saphire-axo.jpg";
import sapPlan from "../assets/peojects/saphire/saphire-plan.jpg";
import sapSea from "../assets/peojects/saphire/saphire-sea.jpg";
import sapClub from "../assets/peojects/saphire/saphire-club.jpg";
import sapTerrace from "../assets/peojects/saphire/saphire-terrace.jpg";
import sapRender from "../assets/peojects/saphire/saphire (9).jpg";
import sapAerial from "../assets/peojects/saphire/saphire (1).jpg";
import sapMark from "../assets/peojects/saphire/saphire (4).jpg";
import sapColours from "../assets/peojects/saphire/saphire (6).jpg";
import sapType from "../assets/peojects/saphire/saphire (7).jpg";
import sapBillboard from "../assets/peojects/saphire/saphire (8).jpg";
import sapStationery from "../assets/peojects/saphire/saphire (10).jpg";
import smMascot from "../assets/peojects/smart/smart.png";
import smScreens from "../assets/peojects/smart/smart (1).png";
import smPrint from "../assets/peojects/smart/smart (2).jpg";
import smBrochure from "../assets/peojects/smart/smart-brochure.jpg";
import smDetailLogo from "../assets/peojects/smart/smart-detail-logo.jpg";
import smDetailGuides from "../assets/peojects/smart/smart-detail-guides.jpg";

/**
 * The selected projects: a few, chosen and told the same way — one image to
 * open, one sentence, what was done, then the work, large.
 *
 * To add a project: add an entry here (its slug becomes /projects/<slug>).
 * `pair: true` on an image sets it beside the next one, half width each.
 */

export type Discipline = "identity" | "web" | "direction" | "video" | "presentation" | "comms" | "events" | "social" | "3d" | "cover" | "campaign";

type Text = Record<Lang, string>;

/**
 * pair: shares a row with the next image. fit "contain": shown whole on white instead
 * of cropped to the row's shape (for pieces on a white ground: type, colours, drawings)
 */
export type CaseImage = {
  src: string;
  /** In place of the image: the interactive 3D stand */
  viewer?: "stand" | "social" | "devices";
  /** For the social viewer: the posts shown in the phone */
  tiles?: string[];
  /** In place of the image: a silent looping film (public/video), at its own speed */
  video?: string;
  videoSpeed?: number;
  pair?: boolean;
  fit?: "contain";
  /** Opens an interactive version (e.g. a 3D recreation) in a new tab, with a small caption */
  href?: string;
};

export type Case = {
  slug: string;
  title: string;
  /** Who it was for, or what kind of project it is */
  client: Text;
  /** When set, the facts name the sector instead of the client: the case reads as an offer to others */
  sector?: Text;
  /** A closing line inviting a similar project, linked to the contact */
  cta?: Text;
  /** Kept but not shown: off the site and out of the case-to-case navigation */
  hidden?: boolean;
  /** The services in detail: each discipline with what was actually delivered */
  services?: { d: Discipline; detail: Text }[];
  year?: string;
  disciplines: Discipline[];
  /** The one sentence that opens the case */
  lead: Text;
  /** A short paragraph on what was done (left out when the lead already tells it) */
  body?: Text;
  cover: string;
  /** A film to open the case with instead of the cover (a file in public/video) */
  video?: string;
  /** The film's proportion, as CSS aspect-ratio (defaults to 16 / 9) */
  videoRatio?: string;
  /** Playback speed (defaults to 1.35, the projects page's pace) */
  videoSpeed?: number;
  /** Opens the case with the interactive 3D stand instead of a film or the cover */
  headerViewer?: "stand";
  /** "contain": show the whole cover on a pale mount (square or small covers) */
  coverFit?: "contain";
  /** A calm image for the index strip, with no text or interface in it (defaults to the cover) */
  thumb?: string;
  /** Where to centre the strip image when it is cropped (CSS object-position) */
  coverFocus?: string;
  images: CaseImage[];
  /** An outbound link, e.g. to listen */
  link?: { href: string; label: Text };
};

/** The labels of the case pages */
export const CASE_UI: Record<"client" | "sector" | "year" | "scope" | "next" | "nextShort" | "all" | "count" | "recreation" | "view3d", Text> = {
  nextShort: { en: "next", es: "siguiente", fr: "suivant", de: "weiter" },
  recreation: {
    en: "3D recreation · Congress stand",
    es: "Recreación 3D · Stand de congreso",
    fr: "Recréation 3D · Stand de congrès",
    de: "3D-Rekonstruktion · Kongressstand",
  },
  view3d: { en: "view in 3d", es: "ver en 3d", fr: "voir en 3d", de: "in 3d ansehen" },
  client: { en: "for", es: "para", fr: "pour", de: "für" },
  sector: { en: "sector", es: "sector", fr: "secteur", de: "branche" },
  year: { en: "year", es: "año", fr: "année", de: "jahr" },
  // Named as what can be hired, not what was done: each case reads as an offer
  scope: { en: "services", es: "servicios", fr: "services", de: "leistungen" },
  next: { en: "next project", es: "siguiente proyecto", fr: "projet suivant", de: "nächstes projekt" },
  all: { en: "all projects", es: "todos los proyectos", fr: "tous les projets", de: "alle projekte" },
  count: { en: "projects", es: "proyectos", fr: "projets", de: "projekte" },
};

export const DISCIPLINE: Record<Discipline, Text> = {
  identity: { en: "brand identity", es: "identidad de marca", fr: "identité de marque", de: "markenidentität" },
  web: { en: "web", es: "web", fr: "web", de: "web" },
  direction: { en: "art direction", es: "dirección de arte", fr: "direction artistique", de: "art direction" },
  video: { en: "video", es: "vídeo", fr: "vidéo", de: "video" },
  presentation: { en: "sales presentation", es: "presentación comercial", fr: "présentation commerciale", de: "verkaufspräsentation" },
  comms: { en: "communications", es: "comunicación", fr: "communication", de: "kommunikation" },
  events: { en: "events", es: "eventos", fr: "événements", de: "events" },
  social: { en: "content strategy", es: "estrategia de contenidos", fr: "stratégie de contenu", de: "content-strategie" },
  "3d": { en: "3d imagery", es: "visualización 3d", fr: "visualisation 3d", de: "3d-visualisierung" },
  cover: { en: "cover art", es: "portada", fr: "pochette", de: "cover" },
  campaign: { en: "campaigns", es: "campañas", fr: "campagnes", de: "kampagnen" },
};

export const cases: Case[] = [
  {
    slug: "santa-engracia",
    title: "Santa Engracia",
    client: { en: "Santa Engracia — residential", es: "Santa Engracia — residencial", fr: "Santa Engracia — résidentiel", de: "Santa Engracia — wohnbau" },
    disciplines: ["identity", "web"],
    lead: {
      en: "Heritage residential building.",
      es: "Edificio residencial histórico.",
      fr: "Immeuble résidentiel historique.",
      de: "Historisches Wohngebäude.",
    },
    body: {
      en: "The complete visual identity, logo and website, drawn from the building's own architecture: minimal and elegant, keeping its timeless character.",
      es: "La identidad visual completa, el logotipo y la web, a partir de la propia arquitectura del edificio: minimalista y elegante, conservando su carácter atemporal.",
      fr: "L'identité visuelle complète, le logotype et le site, tirés de l'architecture même de l'immeuble : minimale et élégante, fidèle à son caractère intemporel.",
      de: "Die komplette visuelle Identität, Logo und Website, aus der Architektur des Gebäudes selbst entwickelt: minimal und elegant, mit seinem zeitlosen Charakter.",
    },
    cover: santaFacade,
    thumb: santaStrip,
    images: [{ src: santaTerrace }, { src: santaSketch }, { src: santaMark, pair: true }, { src: santaPalette }, { src: santaDevices }, { src: santaInterior, pair: true }, { src: santaStationery }],
  },  {
    slug: "buendia",
    title: "Buendía Travels",
    client: { en: "Buendía Travels — tourism", es: "Buendía Travels — turismo", fr: "Buendía Travels — tourisme", de: "Buendía Travels — tourismus" },
    disciplines: ["identity", "web", "campaign"],
    lead: {
      en: "Travel agency.",
      es: "Agencia de viajes.",
      fr: "Agence de voyages.",
      de: "Reiseunternehmen.",
    },
    body: {
      en: "A modernised identity, a redesigned website for booking activities and excursions, and the catalogues and campaigns that carry the brand.",
      es: "Una identidad modernizada, una web rediseñada para reservar actividades y excursiones, y los catálogos y campañas que llevan la marca.",
      fr: "Une identité modernisée, un site repensé pour réserver activités et excursions, et les catalogues et campagnes qui portent la marque.",
      de: "Eine modernisierte Identität, eine neu gestaltete Website zum Buchen von Aktivitäten und Ausflügen, und die Kataloge und Kampagnen der Marke.",
    },
    cover: buendiaWeb,
    thumb: buendiaStrip,
    images: [{ src: buendiaLaptop }, { src: buendiaBook, pair: true }, { src: buendiaCatalogue }, { src: buendiaSocial }],
  },
  {
    slug: "sapphire",
    title: "The Sapphire",
    client: { en: "Darya Homes — residential", es: "Darya Homes — residencial", fr: "Darya Homes — résidentiel", de: "Darya Homes — wohnbau" },
    disciplines: ["identity", "web", "direction", "video", "presentation"],
    sector: { en: "residential development", es: "promoción residencial", fr: "programme résidentiel", de: "wohnbauprojekt" },
    // The problem first, so anyone selling something not yet built sees themselves in it
    lead: {
      en: "Residential complex on the Costa del Sol.",
      es: "Complejo residencial en la Costa del Sol.",
      fr: "Complexe résidentiel sur la Costa del Sol.",
      de: "Wohnanlage an der Costa del Sol.",
    },
    services: [
      {
        d: "identity",
        detail: {
          en: "logo, palette, typography and stationery",
          es: "logotipo, paleta, tipografía y papelería",
          fr: "logo, palette, typographie et papeterie",
          de: "logo, farbpalette, typografie und geschäftsausstattung",
        },
      },
      {
        d: "web",
        detail: { en: "design and development", es: "diseño y desarrollo", fr: "design et développement", de: "design und entwicklung" },
      },
      {
        d: "direction",
        detail: {
          en: "renders, billboards and campaign",
          es: "renders, vallas y campaña",
          fr: "rendus, affichage et campagne",
          de: "renderings, plakate und kampagne",
        },
      },
      {
        d: "video",
        detail: {
          en: "script, editing and motion",
          es: "guion, montaje y motion",
          fr: "scénario, montage et motion",
          de: "skript, schnitt und motion",
        },
      },
      {
        d: "presentation",
        detail: {
          en: "interactive, animated floor plans",
          es: "planos interactivos y animados",
          fr: "plans interactifs et animés",
          de: "interaktive, animierte grundrisse",
        },
      },
    ],
    cta: {
      en: "A project that doesn't exist yet? Let's talk",
      es: "¿Un proyecto que aún no existe? Hablemos",
      fr: "Un projet qui n'existe pas encore ? Parlons-en",
      de: "Ein Projekt, das es noch nicht gibt? Sprechen wir darüber",
    },
    cover: sapRender,
    video: "/video/the-sapphire.mp4",
    coverFocus: "50% 62%",
    // A rhythm, not a scroll of full screens: only two pieces wide, the rest in pairs of
    // matching proportions (the web mockup is soft at full width, sharp at half)
    images: [
      // `pair` goes on the first of the two that share a row
      // The system beside the brand on the building: from the drawing to the place
      { src: sapMark, pair: true, fit: "contain" },
      { src: sapKey },
      { src: sapWeb, pair: true },
      { src: sapStationery },
      { src: sapType, pair: true, fit: "contain" },
      { src: sapColours, fit: "contain" },
      // The sales presentation: the site in axonometry, then a plan set in the brand
      { src: sapAxo, pair: true, fit: "contain" },
      { src: sapPlan, fit: "contain" },
      { src: sapBillboard, pair: true },
      { src: sapAerial },
      // The terrace, the building from the garden, then the sea: wide, to close
      { src: sapTerrace },
      { src: sapClub },
      { src: sapSea },
    ],
  },
  {
    slug: "smarthc",
    title: "Smart Human Capital",
    client: { en: "SmartHC — security consultancy", es: "SmartHC — consultoría de seguridad", fr: "SmartHC — conseil en sécurité", de: "SmartHC — sicherheitsberatung" },
    disciplines: ["identity", "direction", "comms", "events", "social"],
    sector: { en: "tech consultancy", es: "consultoría tecnológica", fr: "conseil technologique", de: "technologieberatung" },
    lead: {
      en: "Cybersecurity consultancy.",
      es: "Consultora de ciberseguridad.",
      fr: "Cabinet de cybersécurité.",
      de: "Cybersicherheitsberatung.",
    },
    services: [
      {
        d: "identity",
        detail: {
          en: "logo, visual system and character",
          es: "logotipo, sistema visual y personaje",
          fr: "logo, système visuel et personnage",
          de: "logo, visuelles system und figur",
        },
      },
      {
        d: "direction",
        detail: {
          en: "the brand in digital, print and events",
          es: "la marca en digital, impresos y eventos",
          fr: "la marque en numérique, print et événements",
          de: "die marke digital, in print und auf events",
        },
      },
      {
        d: "comms",
        detail: {
          en: "catalogue, guides and product sheets",
          es: "catálogo, guías y fichas de producto",
          fr: "catalogue, guides et fiches produit",
          de: "katalog, leitfäden und produktblätter",
        },
      },
      {
        d: "events",
        detail: {
          en: "stands for congresses and fairs, 3D prototypes",
          es: "stands para congresos y ferias, prototipos 3D",
          fr: "stands pour congrès et salons, prototypes 3D",
          de: "stände für kongresse und messen, 3D-prototypen",
        },
      },
      {
        d: "social",
        detail: {
          en: "editorial planning for social media",
          es: "planificación editorial en redes",
          fr: "planification éditoriale sur les réseaux",
          de: "redaktionsplanung für social media",
        },
      },
    ],
    cover: smMascot,
    // The first screen is the stand, to turn round right away
    headerViewer: "stand",
    thumb: smStrip,
    coverFocus: "50% 55%",
    // Three pairs of the same height: the presentation beside the product sheet, then
    // each printed piece beside a close-up of it
    images: [
      // Right under the stand, wide: a concept piece, the product told in an interactive 3D scene
      { src: "", viewer: "devices" },
      // The character in motion (slowed to half with interpolated frames, looped forward
      // and back, at its own calm pace) beside the presentation
      { src: smScreens, pair: true },
      { src: "", video: "/video/smarthc.mp4", videoSpeed: 1 },
      { src: smBrochure, pair: true },
      { src: smDetailLogo },
      { src: smPrint, pair: true },
      { src: smDetailGuides },
    ],

  },
  {
    slug: "alea",
    title: "Alea Software",
    // Work done as an employee: off the public site while that job lasts
    hidden: true,
    client: { en: "AMV Soluciones — industrial software", es: "AMV Soluciones — software industrial", fr: "AMV Soluciones — logiciel industriel", de: "AMV Soluciones — industriesoftware" },
    disciplines: ["identity", "web", "campaign"],
    lead: {
      en: "Industrial software.",
      es: "Software industrial.",
      fr: "Logiciel industriel.",
      de: "Industriesoftware.",
    },
    body: {
      en: "Brand identity for the product, the design of its interface, and the launch materials around it: posters, campaigns and a trade-show stand.",
      es: "La identidad de marca del producto, el diseño de su interfaz y los materiales de lanzamiento: carteles, campañas y un stand de feria.",
      fr: "L'identité de marque du produit, le design de son interface et les supports de lancement : affiches, campagnes et un stand de salon.",
      de: "Die Markenidentität des Produkts, das Design seiner Oberfläche und die Launch-Materialien: Plakate, Kampagnen und ein Messestand.",
    },
    cover: aleaDashboard,
    thumb: aleaStrip,
    images: [{ src: aleaPoster }, { src: aleaLaptop, pair: true }, { src: aleaDesk }, { src: aleaScreen }, { src: aleaStand }],
  },];
