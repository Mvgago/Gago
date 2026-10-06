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
import sapRender from "../assets/peojects/saphire/saphire (9).jpg";
import sapAerial from "../assets/peojects/saphire/saphire (1).jpg";
import sapPalette from "../assets/peojects/saphire/saphire (2).jpg";
import sapMark from "../assets/peojects/saphire/saphire (4).jpg";
import sapColours from "../assets/peojects/saphire/saphire (6).jpg";
import sapType from "../assets/peojects/saphire/saphire (7).jpg";
import sapBillboard from "../assets/peojects/saphire/saphire (8).jpg";
import sapStationery from "../assets/peojects/saphire/saphire (10).jpg";
import smMascot from "../assets/peojects/smart/smart.png";
import smScreens from "../assets/peojects/smart/smart (1).png";
import smPad from "../assets/peojects/smart/smart.jpg";
import smPrint from "../assets/peojects/smart/smart (2).jpg";
import smBanner from "../assets/peojects/smart/smart (1).jpg";

/**
 * The selected projects: a few, chosen and told the same way — one image to
 * open, one sentence, what was done, then the work, large.
 *
 * To add a project: add an entry here (its slug becomes /projects/<slug>).
 * `pair: true` on an image sets it beside the next one, half width each.
 */

export type Discipline = "identity" | "web" | "3d" | "cover" | "campaign";

type Text = Record<Lang, string>;

export type CaseImage = { src: string; pair?: boolean };

export type Case = {
  slug: string;
  title: string;
  /** Who it was for, or what kind of project it is */
  client: Text;
  year?: string;
  disciplines: Discipline[];
  /** The one sentence that opens the case */
  lead: Text;
  /** A short paragraph on what was done */
  body: Text;
  cover: string;
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
export const CASE_UI: Record<"client" | "year" | "scope" | "next" | "all" | "count", Text> = {
  client: { en: "for", es: "para", fr: "pour", de: "für" },
  year: { en: "year", es: "año", fr: "année", de: "jahr" },
  scope: { en: "scope", es: "alcance", fr: "périmètre", de: "umfang" },
  next: { en: "next project", es: "siguiente proyecto", fr: "projet suivant", de: "nächstes projekt" },
  all: { en: "all projects", es: "todos los proyectos", fr: "tous les projets", de: "alle projekte" },
  count: { en: "projects", es: "proyectos", fr: "projets", de: "projekte" },
};

export const DISCIPLINE: Record<Discipline, Text> = {
  identity: { en: "brand identity", es: "identidad de marca", fr: "identité de marque", de: "markenidentität" },
  web: { en: "web", es: "web", fr: "web", de: "web" },
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
    disciplines: ["identity", "web", "3d"],
    lead: {
      en: "Luxury residential development.",
      es: "Promoción residencial de lujo.",
      fr: "Programme résidentiel de luxe.",
      de: "Luxus-Wohnprojekt.",
    },
    body: {
      en: "Brand identity, website and art direction of the 3D imagery for an exclusive development: light, clarity and a timeless, refined character.",
      es: "Identidad de marca, web y dirección de arte de la visualización 3D para una promoción exclusiva: luz, claridad y un carácter refinado y atemporal.",
      fr: "Identité de marque, site web et direction artistique des visuels 3D pour un programme exclusif : lumière, clarté et un caractère raffiné et intemporel.",
      de: "Markenidentität, Website und Art Direction der 3D-Visualisierung für ein exklusives Projekt: Licht, Klarheit und ein zeitlos feiner Charakter.",
    },
    cover: sapRender,
    coverFocus: "50% 62%",
    images: [
      { src: sapWeb },
      { src: sapMark },
      { src: sapPalette },
      { src: sapColours, pair: true },
      { src: sapType },
      { src: sapStationery },
      { src: sapBillboard, pair: true },
      { src: sapAerial },
    ],
  },
  {
    slug: "smarthc",
    title: "Smart Human Capital",
    client: { en: "SmartHC — security consultancy", es: "SmartHC — consultoría de seguridad", fr: "SmartHC — conseil en sécurité", de: "SmartHC — sicherheitsberatung" },
    disciplines: ["identity", "3d", "campaign"],
    lead: {
      en: "Cybersecurity consultancy.",
      es: "Consultora de ciberseguridad.",
      fr: "Cabinet de cybersécurité.",
      de: "Cybersicherheitsberatung.",
    },
    body: {
      en: "For a consultancy in security and new technology: the visual identity, a 3D guardian carried across devices, print and events, and the campaigns around it.",
      es: "Para una consultora de seguridad y nuevas tecnologías: la identidad visual, un guardián 3D presente en dispositivos, impresos y eventos, y las campañas a su alrededor.",
      fr: "Pour un cabinet de conseil en sécurité et nouvelles technologies : l'identité visuelle, un gardien 3D décliné sur écrans, imprimés et événements, et les campagnes autour.",
      de: "Für eine Beratung für Sicherheit und neue Technologien: die visuelle Identität, ein 3D-Wächter auf Geräten, Drucksachen und Events, und die Kampagnen dazu.",
    },
    cover: smMascot,
    thumb: smStrip,
    coverFocus: "50% 55%",
    images: [{ src: smScreens }, { src: smPad, pair: true }, { src: smPrint }, { src: smBanner }],
  },
  {
    slug: "alea",
    title: "Alea Software",
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
