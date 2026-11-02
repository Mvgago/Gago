import type { Lang } from "../i18n/strings";

import aleaStrip from "../assets/peojects/alea/alea-strip.jpg.webp";
import aleaDashboard from "../assets/peojects/alea/alea-dashboard-web.jpg.webp";
import aleaPoster from "../assets/peojects/alea/alea-poster-web.jpg.webp";
import aleaStand from "../assets/peojects/alea/alea-stand-web.jpg.webp";
import aleaScreen from "../assets/peojects/alea/alea-screen-web.jpg.webp";
import aleaLaptop from "../assets/peojects/alea/alea.png.webp";
import aleaDesk from "../assets/peojects/alea/alea7.jpeg.webp";import santaStrip from "../assets/peojects/santa/santa-strip.jpg.webp";
import santaFacade from "../assets/peojects/santa/santa (7).jpg.webp";
import tolvaStill from "../assets/peojects/tolva/tolva.webp";
import santaTerrace from "../assets/peojects/santa/santa (2).jpg.webp";
import santaDevices from "../assets/peojects/santa/santa (3).jpg.webp";
import santaSketch from "../assets/peojects/santa/santa (4).jpg.webp";
import santaMap from "../assets/peojects/santa/santa-map.jpg.webp";
import santaBedroom from "../assets/peojects/santa/santa-bedroom.jpg.webp";
import santaLiving from "../assets/peojects/santa/santa-living.jpg.webp";
import santaKitchen from "../assets/peojects/santa/santa-kitchen.jpg.webp";
import santaLamp from "../assets/peojects/santa/santa-lamp.jpg.webp";
import santaDetail from "../assets/peojects/santa/santa-detail.jpg.webp";
import santaMapOrder from "../assets/peojects/santa/santa-map-order.png";
import santaMarkOrder from "../assets/peojects/santa/santa-mark-order.png";
import santaScreensOrder from "../assets/peojects/santa/santa-screens-order.png";
import santaPaletteOrder from "../assets/peojects/santa/santa-palette-order.png";
import santaPalette from "../assets/peojects/santa/santa (5).jpg.webp";
import santaMark from "../assets/peojects/santa/santa (6).jpg.webp";
import buendiaStrip from "../assets/peojects/buendia/buendia-strip.jpg.webp";
import smStrip from "../assets/peojects/smart/smart-strip.jpg.webp";
import buendiaWeb from "../assets/peojects/buendia/buendia-web-web.jpg.webp";
import buendiaLaptop from "../assets/peojects/buendia/buendia-laptop-web.jpg.webp";
import buendiaBook from "../assets/peojects/buendia/buendia-book-web.jpg.webp";
import buendiaCatalogue from "../assets/peojects/buendia/buendia-catalogue-web.jpg.webp";
import buendiaSocial from "../assets/peojects/buendia/buendia-social-web.jpg.webp";
import buendiaPresence from "../assets/peojects/buendia/buendia-presence.png";
import buendiaMerch from "../assets/peojects/buendia/buendia-merch.webp";import sapWeb from "../assets/peojects/saphire/saphire.jpg.webp";
import sapKey from "../assets/peojects/saphire/saphire-key.jpg.webp";
import sapAxo from "../assets/peojects/saphire/saphire-axo.jpg.webp";
import sapPlan from "../assets/peojects/saphire/saphire-plan.jpg.webp";
import sapSea from "../assets/peojects/saphire/saphire-sea.jpg.webp";
import sapClub from "../assets/peojects/saphire/saphire-club.jpg.webp";
import sapTerrace from "../assets/peojects/saphire/saphire-terrace.jpg.webp";
import sapRender from "../assets/peojects/saphire/saphire (9).jpg.webp";
import sapAerial from "../assets/peojects/saphire/saphire (1).jpg.webp";
import sapMark from "../assets/peojects/saphire/saphire (4).jpg.webp";
import sapColours from "../assets/peojects/saphire/saphire (6).jpg.webp";
import sapType from "../assets/peojects/saphire/saphire (7).jpg.webp";
import sapBillboard from "../assets/peojects/saphire/saphire (8).jpg.webp";
import sapStationery from "../assets/peojects/saphire/saphire (10).jpg.webp";
import smMascot from "../assets/peojects/smart/smart.png.webp";
import smScreens from "../assets/peojects/smart/smart (1).png.webp";
import smPrint from "../assets/peojects/smart/smart (2).jpg.webp";
import smCardA from "../assets/peojects/smart/smart-card-a.webp";
import smCardB from "../assets/peojects/smart/smart-card-b.webp";
import smBrochure from "../assets/peojects/smart/smart-brochure.jpg.webp";
import smDetailLogo from "../assets/peojects/smart/smart-detail-logo.jpg.webp";
import smDetailGuides from "../assets/peojects/smart/smart-detail-guides.jpg.webp";
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
  /** For the devices viewer: the concept page to frame (defaults to SmartHC's) */
  frame?: string;
  /** For the social viewer: the posts shown in the phone */
  tiles?: string[];
  /** In place of the image: a silent looping film (public/video), at its own speed */
  video?: string;
  videoSpeed?: number;
  pair?: boolean;
  fit?: "contain" | "natural";
  /** Opens an interactive version (e.g. a 3D recreation) in a new tab, with a small caption */
  href?: string;
  /** A construction sheet whose guide lines draw themselves the first time it is seen */
  draw?: "sapphire-mark";
  /** A drawing that draws itself in the order of a map (see RevealImage) */
  reveal?: { order: string; w: number; h: number; paper: string; cover?: boolean; focus?: number; duration?: number };
  /** In place of the photograph: its cards (two designs) sliding on in slanted rows, without end */
  cards?: [string, string];
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
  /** Opens the case with a drawing that draws itself (see RevealImage) */
  headerReveal?: { src: string; order: string; w: number; h: number; paper: string };
  /** Opens the case with an interactive concept page (public/concepts/…) framed beside the words */
  headerFrame?: string;
  /** "editorial": the work full width first, then a statement and the story side by side in a tight grotesque */
  layout?: "editorial";
  /** The editorial layout's headline: the idea of the project, not its name */
  statement?: Text;
  /** "contain": show the whole cover on a pale mount (square or small covers) */
  coverFit?: "contain";
  /** A calm image for the index strip, with no text or interface in it (defaults to the cover) */
  thumb?: string;
  /** A bright picture for the row of next projects at the foot of a case (defaults to the strip image) */
  pick?: string;
  /** Where to centre the strip image when it is cropped (CSS object-position) */
  coverFocus?: string;
  images: CaseImage[];
  /** An outbound link, e.g. to listen */
  link?: { href: string; label: Text };
};

/** The labels of the case pages */
export const CASE_UI: Record<"client" | "sector" | "year" | "scope" | "next" | "nextShort" | "all" | "count" | "page" | "recreation" | "view3d" | "talk" | "talkCta" | "open", Text> = {
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
  talk: { en: "Got a project like this one?", es: "¿Tienes un proyecto parecido?", fr: "Un projet de ce genre ?", de: "Ein ähnliches Projekt?" },
  talkCta: { en: "let's talk", es: "hablemos", fr: "parlons-en", de: "sprechen wir" },
  open: { en: "see the project", es: "ver proyecto", fr: "voir le projet", de: "projekt ansehen" },
  all: { en: "all projects", es: "todos los proyectos", fr: "tous les projets", de: "alle projekte" },
  count: { en: "projects", es: "proyectos", fr: "projets", de: "projekte" },
  page: { en: "projects page", es: "página de proyectos", fr: "page des projets", de: "projektseite" },
};

export const DISCIPLINE: Record<Discipline, Text> = {
  identity: { en: "brand identity", es: "identidad de marca", fr: "identité de marque", de: "markenidentität" },
  web: { en: "web", es: "web", fr: "web", de: "web" },
  direction: { en: "art direction", es: "dirección de arte", fr: "direction artistique", de: "art direction" },
  video: { en: "video", es: "vídeo", fr: "vidéo", de: "video" },
  presentation: { en: "sales presentation", es: "presentación comercial", fr: "présentation commerciale", de: "verkaufspräsentation" },
  comms: { en: "communications", es: "comunicación", fr: "communication", de: "kommunikation" },
  events: { en: "events", es: "eventos", fr: "événements", de: "events" },
  social: { en: "strategy", es: "estrategia", fr: "stratégie", de: "strategie" },
  "3d": { en: "3d imagery", es: "visualización 3d", fr: "visualisation 3d", de: "3d-visualisierung" },
  cover: { en: "cover art", es: "portada", fr: "pochette", de: "cover" },
  campaign: { en: "campaigns", es: "campañas", fr: "campagnes", de: "kampagnen" },
};

export const cases: Case[] = [
  {
    slug: "gracia-prados",
    title: "Gracia Prados 14",
    client: { en: "Gracia Prados 14 — residential", es: "Gracia Prados 14 — residencial", fr: "Gracia Prados 14 — résidentiel", de: "Gracia Prados 14 — wohnbau" },
    disciplines: ["identity", "web", "direction"],
    sector: { en: "residential refurbishment", es: "rehabilitación residencial", fr: "réhabilitation résidentielle", de: "wohnsanierung" },
    lead: {
      en: "Residential refurbishment in Madrid.",
      es: "Rehabilitación residencial en Madrid.",
      fr: "Réhabilitation résidentielle à Madrid.",
      de: "Wohnsanierung in Madrid.",
    },
    body: {
      es: "Gracia Prados 14 es un edificio con historia, rehabilitado en viviendas y áticos dúplex. Para contarlo no hacía falta inventar nada: su cúpula ya era lo que todo el mundo reconocía desde la calle. La convertimos en la marca, un único trazo que nace del edificio y recorre el logotipo, la web y la papelería. Así, cada pieza habla de la casa antes que de los metros. La web y los renders se convirtieron en la herramienta principal de venta del equipo comercial.",
      en: "Gracia Prados 14 is a building with a past, refurbished into flats and duplex penthouses. Telling its story needed nothing invented: its dome was already what everyone recognised from the street. We made it the brand, a single line drawn from the building that runs through the logo, the website and the stationery. So every piece speaks of the home before the square metres. The website and the renders became the sales team's main tool.",
      fr: "Gracia Prados 14 est un immeuble chargé d'histoire, réhabilité en appartements et attiques en duplex. Pour le raconter, il n'y avait rien à inventer : sa coupole était déjà ce que tout le monde reconnaissait depuis la rue. Nous en avons fait la marque, un trait unique né de l'immeuble qui parcourt le logo, le site et la papeterie. Ainsi, chaque pièce parle du lieu avant de parler de mètres carrés. Le site et les rendus sont devenus le principal outil de vente de l'équipe commerciale.",
      de: "Gracia Prados 14 ist ein Gebäude mit Geschichte, saniert zu Wohnungen und Duplex-Penthäusern. Um es zu erzählen, musste nichts erfunden werden: Seine Kuppel war schon das, was jeder von der Straße aus erkannte. Wir machten sie zur Marke, eine einzige Linie, die aus dem Gebäude entsteht und sich durch Logo, Website und Geschäftsausstattung zieht. So spricht jedes Stück vom Zuhause, bevor es um Quadratmeter geht. Website und Renderings wurden zum wichtigsten Verkaufswerkzeug des Vertriebsteams.",
    },
    services: [
      {
        d: "identity",
        detail: {
          en: "logo drawn from the dome, palette and stationery",
          es: "logotipo a partir de la cúpula, paleta y papelería",
          fr: "logo tiré de la coupole, palette et papeterie",
          de: "logo aus der kuppel, farbpalette und geschäftsausstattung",
        },
      },
      {
        d: "web",
        detail: {
          en: "sales site: homes, plans and specifications",
          es: "web de venta: viviendas, planos y calidades",
          fr: "site de vente : logements, plans et prestations",
          de: "verkaufswebsite: wohnungen, grundrisse und ausstattung",
        },
      },
      {
        d: "direction",
        detail: {
          en: "renders: lighting and furnishing",
          es: "renders: iluminación y mobiliario",
          fr: "rendus : lumière et mobilier",
          de: "renderings: licht und einrichtung",
        },
      },
    ],
    cta: {
      en: "A building with a story to tell? Let's talk",
      es: "¿Un edificio con historia? Hablemos",
      fr: "Un immeuble avec une histoire ? Parlons-en",
      de: "Ein Gebäude mit Geschichte? Sprechen wir darüber",
    },
    cover: santaFacade,
    thumb: santaStrip,
    pick: santaFacade,
    // the case opens on the site's map drawing itself, out from the building along its lines
    headerReveal: { src: santaMap, order: santaMapOrder, w: 1026, h: 680, paper: "#f9f6f5" },
    // From the building to the brand: the building by day then by night, the dome drawn into the mark beside
    // its palette (same proportion), the site on its illustrated map, then the brand on screens beside a home
    // (the cards still carry the building's old name: left out)
    images: [
      // first the brand on screens beside a home: the line and the name draw themselves out of the dome, as on
      // the site's opening
      { src: santaDevices, pair: true, reveal: { order: santaScreensOrder, w: 1700, h: 1275, paper: "#f7f7f7", cover: true, focus: 0.41, duration: 3 } },
      // beside them the building: the dome the brand is drawn from
      { src: santaFacade },
      // both whole, at their own (shared) proportion; the mark draws itself from the spire down
      { src: santaMark, pair: true, fit: "natural", reveal: { order: santaMarkOrder, w: 2047, h: 989, paper: "#ffffff" } },
      // the colours spread out from the first one, then the versions of the mark fill in
      { src: santaPalette, fit: "natural", reveal: { order: santaPaletteOrder, w: 2047, h: 989, paper: "#ffffff" } },
      { src: santaSketch },
      // Then the homes, in frames of the development's film: the living room, wide, the kitchen beside its
      // lamp, the kitchen and its detail (already a diptych), the bedroom
      { src: santaLiving },
      { src: santaKitchen, pair: true },
      { src: santaLamp },
      { src: santaDetail },
      { src: santaBedroom },
      // the terrace at dusk, wide, to close
      { src: santaTerrace },
    ],
  },
  {
    slug: "tolva",
    title: "Tolva",
    client: { en: "Tolva — coffee roastery", es: "Tolva — tostadero de café", fr: "Tolva — torréfaction", de: "Tolva — kaffeerösterei" },
    disciplines: ["identity"],
    sector: { en: "specialty coffee", es: "café de especialidad", fr: "café de spécialité", de: "spezialitätenkaffee" },
    lead: {
      en: "Specialty coffee roastery.",
      es: "Tostadero de café de especialidad.",
      fr: "Torréfacteur de café de spécialité.",
      de: "Rösterei für Spezialitätenkaffee.",
    },
    layout: "editorial",
    statement: {
      es: "Del grano a la marca. Un tostadero contado desde su oficio.",
      en: "From the bean to the brand. A roastery told through its craft.",
      fr: "Du grain à la marque. Une torréfaction racontée par son métier.",
      de: "Von der Bohne zur Marke. Eine Rösterei, erzählt aus ihrem Handwerk.",
    },
    // what the brand is and how it works: no client, no results
    body: {
      es: "Una marca para un tostadero instalado en una antigua nave de molienda. La identidad sale de su oficio: la curva de tueste, la gráfica que todo tostador vigila, es el sistema visual, y cada origen tiene la suya. Un sello que gira como el tambor de la tostadora y una tipografía ancha y rotunda la hacen industrial, pero cálida.",
      en: "A brand for a roastery set in an old flour mill. The identity comes from the craft: the roast curve, the graph every roaster watches, is the visual system, and each origin has its own. A seal that turns like the roaster's drum and a broad, solid typeface make it industrial, but warm.",
      fr: "Une marque pour une torréfaction installée dans une ancienne minoterie. L'identité naît du métier : la courbe de torréfaction, le graphique que tout torréfacteur surveille, devient le système visuel, et chaque origine a la sienne. Un sceau qui tourne comme le tambour du torréfacteur et une typographie large et affirmée la rendent industrielle, mais chaleureuse.",
      de: "Eine Marke für eine Rösterei in einer alten Mühle. Die Identität kommt aus dem Handwerk: Die Röstkurve, die Grafik, die jeder Röster im Blick hat, ist das visuelle System, und jede Herkunft hat ihre eigene. Ein Siegel, das sich wie die Trommel des Rösters dreht, und eine breite, kräftige Schrift machen sie industriell, aber warm.",
    },
    services: [
      {
        d: "identity",
        detail: {
          en: "name, seal, typography and a system drawn from the roast curve",
          es: "nombre, sello, tipografía y un sistema a partir de la curva de tueste",
          fr: "nom, sceau, typographie et un système tiré de la courbe de torréfaction",
          de: "name, siegel, typografie und ein system aus der röstkurve",
        },
      },
    ],
    cta: {
      en: "A business that needs an image with character? Let's talk",
      es: "¿Un negocio que necesita una imagen con carácter? Hablemos",
      fr: "Une entreprise qui a besoin d'une image de caractère ? Parlons-en",
      de: "Ein Unternehmen, das ein Bild mit Charakter braucht? Sprechen wir darüber",
    },
    cover: tolvaStill,
    // the mark building itself, live: the beans turning in the seal
    headerFrame: "/concepts/tolva/index.html?v=5",
    images: [],
  },
  {
    slug: "buendia",
    title: "Buendía Travel",
    client: { en: "Buendía Travel — tourism", es: "Buendía Travel — turismo", fr: "Buendía Travel — tourisme", de: "Buendía Travel — tourismus" },
    disciplines: ["identity", "social", "web", "video"],
    sector: { en: "tourism and travel", es: "turismo y viajes", fr: "tourisme et voyages", de: "tourismus und reisen" },
    lead: {
      en: "Travel agency.",
      es: "Agencia de viajes.",
      fr: "Agence de voyages.",
      de: "Reiseunternehmen.",
    },
    body: {
      es: "Buendía Travel necesitaba que su marca transmitiera lo que vende: experiencias, no paquetes. Unificamos una imagen dispersa y le dimos una voz propia, cercana e ingeniosa, de la web de reservas a los catálogos y campañas que cuentan cada destino desde quien lo vive. Una sola marca, reconocible en cada canal.",
      en: "Buendía Travel needed its brand to convey what it sells: experiences, not packages. We brought a scattered image together and gave it a voice of its own, warm and witty, from the booking site to the catalogues and campaigns that tell each destination through those who live it. One brand, recognisable on every channel.",
      fr: "Buendía Travel avait besoin que sa marque transmette ce qu'elle vend : des expériences, pas des forfaits. Nous avons unifié une image dispersée et lui avons donné une voix propre, proche et pleine d'esprit, du site de réservation aux catalogues et campagnes qui racontent chaque destination à travers ceux qui la vivent. Une seule marque, reconnaissable sur chaque canal.",
      de: "Buendía Travel brauchte eine Marke, die vermittelt, was sie verkauft: Erlebnisse, keine Pauschalreisen. Wir haben ein zerstreutes Erscheinungsbild vereint und ihm eine eigene Stimme gegeben, nahbar und geistreich, von der Buchungswebsite bis zu den Katalogen und Kampagnen, die jedes Reiseziel aus der Sicht derer erzählen, die es erleben. Eine Marke, wiedererkennbar auf jedem Kanal.",
    },
    // (the main ones only: a long list goes unread)
    services: [
      { d: "identity", detail: { en: "logo and visual system", es: "logotipo y sistema visual", fr: "logo et système visuel", de: "logo und visuelles system" } },
      { d: "social", detail: { en: "social media, SEO and SEM", es: "redes, SEO y SEM", fr: "réseaux, SEO et SEA", de: "social media, SEO und SEA" } },
      { d: "web", detail: { en: "online bookings", es: "reservas online", fr: "réservations en ligne", de: "online-buchungen" } },
      { d: "video", detail: { en: "destination spots", es: "spots de destino", fr: "spots de destination", de: "reiseziel-spots" } },
    ],
    cover: buendiaWeb,
    thumb: buendiaStrip,
    pick: buendiaMerch,
    // Beside the words, first: the 3D scene, the site booking a trip and the campaign on the phone,
    // Amsterdam behind (the Asturias spot (2019) was tried there, but its shots are too short and
    // mostly under titles to make a clean loop)
    headerFrame: "/concepts/buendia-devices/index.html",
    // Then pairs of the same height: the site beside the site on the laptop, the catalogue in hand
    // beside a spread, the campaign on social media wide; last, its digital presence (search, posts, bookings)
    // beside the brand out in the street, on an umbrella and a sweatshirt
    images: [
      { src: buendiaWeb, pair: true },
      { src: buendiaLaptop },
      { src: buendiaCatalogue, pair: true },
      { src: buendiaBook },
      // the campaign on social media beside its destination spot (Asturias), silent and looping
      { src: buendiaSocial, pair: true },
      { src: "", video: "/video/buendia-asturias.mp4", videoSpeed: 1 },
      // (the brand in the street first, so on phones it follows straight on from the spot)
      { src: buendiaMerch, pair: true },
      { src: buendiaPresence },
    ],
  },
  {
    slug: "sapphire",
    title: "The Sapphire",
    client: { en: "Darya Homes — residential", es: "Darya Homes — residencial", fr: "Darya Homes — résidentiel", de: "Darya Homes — wohnbau" },
    disciplines: ["identity", "web", "direction", "video", "presentation"],
    sector: { en: "real estate", es: "inmobiliario", fr: "immobilier", de: "immobilien" },
    layout: "editorial",
    statement: {
      es: "Habitar un lugar antes de construirlo.",
      en: "Living in a place before it is built.",
      fr: "Habiter un lieu avant de le construire.",
      de: "Einen Ort bewohnen, bevor er gebaut ist.",
    },
    // The problem first, so anyone selling something not yet built sees themselves in it
    lead: {
      en: "Residential complex on the Costa del Sol.",
      es: "Complejo residencial en la Costa del Sol.",
      fr: "Complexe résidentiel sur la Costa del Sol.",
      de: "Wohnanlage an der Costa del Sol.",
    },
    body: {
      es: "Para vender The Sapphire sobre plano era necesario construir una visión antes de la primera piedra. Desarrollamos la identidad, el relato y el ecosistema digital de la promoción —sitio web, campaña audiovisual y planos interactivos—. Sin piso piloto ni obra que visitar, fueron la sala de ventas. La promoción se vendió sobre plano.",
      en: "Selling The Sapphire off-plan meant building a vision before the first stone was laid. We developed the development's identity, narrative and digital ecosystem — website, audiovisual campaign and interactive floor plans. With no show flat and no site to visit, they became the sales room. The development sold off-plan.",
      fr: "Vendre The Sapphire sur plan exigeait de construire une vision avant la première pierre. Nous avons développé l'identité, le récit et l'écosystème numérique du programme — site web, campagne audiovisuelle et plans interactifs. Sans appartement témoin ni chantier à visiter, ils sont devenus la salle de vente. Le programme s'est vendu sur plan.",
      de: "Um The Sapphire vom Plan zu verkaufen, musste vor dem ersten Stein eine Vision entstehen. Wir haben Identität, Erzählung und das digitale Ökosystem des Projekts entwickelt — Website, audiovisuelle Kampagne und interaktive Grundrisse. Ohne Musterwohnung und ohne Baustelle zum Besichtigen wurden sie zum Verkaufsraum. Das Projekt wurde vom Plan verkauft.",
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
    pick: sapAerial,
    // the whole film, opening on the facade (the projects page has its own cut, starting on the terrace)
    video: "/video/the-sapphire-full.mp4",
    coverFocus: "50% 62%",
    // A rhythm, not a scroll of full screens: only two pieces wide, the rest in pairs of
    // matching proportions (the web mockup is soft at full width, sharp at half)
    images: [
      // `pair` goes on the first of the two that share a row
      // The system beside the brand on the building: from the drawing to the place
      { src: sapMark, pair: true, fit: "contain", draw: "sapphire-mark" },
      { src: sapKey },
      // Early on, the sales presentation: the site in axonometry, a plan set in the brand, and then that
      // same flat to walk round in 3D (a concept of the studio's), the piece most worth seeing
      { src: sapAxo, pair: true, fit: "contain" },
      { src: sapPlan, fit: "contain" },
      { src: "", viewer: "devices", frame: "/concepts/sapphire-home/index.html" },
      { src: sapWeb, pair: true },
      { src: sapStationery },
      { src: sapType, pair: true, fit: "contain" },
      { src: sapColours, fit: "contain" },
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
    disciplines: ["identity", "comms", "events", "social"],
    sector: { en: "tech consultancy", es: "consultoría tecnológica", fr: "conseil technologique", de: "technologieberatung" },
    lead: {
      en: "Cybersecurity consultancy.",
      es: "Consultora de ciberseguridad.",
      fr: "Cabinet de cybersécurité.",
      de: "Cybersicherheitsberatung.",
    },
    body: {
      es: "SmartHC tenía una imagen sin personalidad y unos servicios dispersos. Los unificamos bajo una marca moderna, limpia y seria, con una comunicación didáctica que hace comprensible un sector complejo. Del catálogo al stand de congreso, acercó la ciberseguridad al usuario final y trajo nuevos clientes y partners.",
      en: "SmartHC had an image with no personality and scattered services. We brought them together under a modern, clean and serious brand, with educational communication that makes a complex sector easy to grasp. From the catalogue to the congress stand, it brought cybersecurity closer to end users and won new clients and partners.",
      fr: "SmartHC avait une image sans personnalité et des services dispersés. Nous les avons réunis sous une marque moderne, épurée et sérieuse, avec une communication pédagogique qui rend accessible un secteur complexe. Du catalogue au stand de congrès, elle a rapproché la cybersécurité de l'utilisateur final et apporté de nouveaux clients et partenaires.",
      de: "SmartHC hatte ein Erscheinungsbild ohne Persönlichkeit und verstreute Leistungen. Wir haben sie unter einer modernen, klaren und seriösen Marke vereint, mit einer verständlichen Kommunikation, die eine komplexe Branche greifbar macht. Vom Katalog bis zum Kongressstand brachte sie Cybersicherheit näher an die Endnutzer und gewann neue Kunden und Partner.",
    },
    services: [
      {
        d: "identity",
        detail: {
          en: "visual system and 3D character",
          es: "sistema visual y personaje 3D",
          fr: "système visuel et personnage 3D",
          de: "visuelles system und 3D-figur",
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
          en: "digital content and positioning",
          es: "contenidos digitales y posicionamiento",
          fr: "contenus numériques et positionnement",
          de: "digitale inhalte und positionierung",
        },
      },
    ],
    cover: smMascot,
    // The first screen is the stand, to turn round right away
    headerViewer: "stand",
    thumb: smStrip,
    pick: smDetailLogo,
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
      { src: smPrint, pair: true, cards: [smCardA, smCardB] },
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
