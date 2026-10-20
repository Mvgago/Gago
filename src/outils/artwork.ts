import single3 from "../assets/gallery/single3.png.webp";
import single4 from "../assets/gallery/single4.png.webp";
import amorsacro from "../assets/img/amorsacro.jpg.webp";
import otono from "../assets/gallery/Otoño.jpg.webp";
import portada from "../assets/gallery/portada.png.webp";
import untitled from "../assets/gallery/untitlezdfdsd.png.webp";
import summer from "../assets/gallery/summer2003.png.webp";
import acne from "../assets/gallery/acne2.png.webp";
import grimaldi from "../assets/gallery/grimaldi-lines.jpg.webp";

/** The studio's own music project. */
export const FUGA_SEI_EP = "https://open.spotify.com/album/7EdGwidKh2TS1HsV3j67tf";

type Plate = {
  id: string;
  url: string;
  /** For plates that are a titled work: its title, a line of detail, and where to find it. */
  title?: string;
  detail?: string;
  href?: string;
  /** A grade applied where it is shown, for a plate that reads flat on the dark */
  grade?: string;
  /** How it was made, named in the viewer's caption, as a gallery label would */
  tech?: Tech;
  /** Drawn in closer in the grid, for a piece with a margin of its own (the viewer shows it whole) */
  crop?: number;
  /** Where that closer view is anchored (a CSS transform origin) */
  cropAt?: string;
};

export type Tech = "digital" | "vector" | "3d";
export const TECH: Record<Tech, Record<string, string>> = {
  // painted by hand, on a graphics tablet
  digital: { es: "pintura digital", en: "digital painting", fr: "peinture numérique", de: "digitale malerei" },
  vector: { es: "ilustración vectorial", en: "vector illustration", fr: "illustration vectorielle", de: "vektorillustration" },
  "3d": { es: "modelado y render 3D", en: "3D modelling and render", fr: "modélisation et rendu 3D", de: "3D-modellierung und rendering" },
};

// Fuga Sei leads: it is the studio's own work and stays first, whatever else hangs here.
// The two rose pieces close the series, as a pair.
export const artwork: Plate[] = [
  { id: "a10", url: grimaldi, title: "Grimaldi Lines", detail: "fuga sei · ep · 2026", href: FUGA_SEI_EP },
  { id: "a11", url: amorsacro, title: "Amorsacro", tech: "digital" },
  { id: "a03", url: otono, title: "Otoño en la Luna", tech: "vector" },
  { id: "a08", url: summer, title: "Club Shy", tech: "3d" },
  { id: "a05", url: untitled, title: "Memoria", tech: "3d", crop: 1.05, cropAt: "50% 0%" }, // the lower letters down on the tile's bottom edge
  { id: "a01", url: single3 },
  { id: "a09", url: acne },
  { id: "a06", url: single4 },
  { id: "a04", url: portada, grade: "contrast(1.22) brightness(0.8) saturate(0.82)" },
];
