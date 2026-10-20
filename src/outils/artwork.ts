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
};

// Fuga Sei leads: it is the studio's own work and stays first, whatever else hangs here.
// The two rose pieces close the series, as a pair.
export const artwork: Plate[] = [
  { id: "a10", url: grimaldi, title: "Grimaldi Lines", detail: "fuga sei · ep · 2026", href: FUGA_SEI_EP },
  { id: "a11", url: amorsacro, title: "Amorsacro" },
  { id: "a03", url: otono },
  { id: "a08", url: summer },
  { id: "a05", url: untitled },
  { id: "a01", url: single3 },
  { id: "a09", url: acne },
  { id: "a06", url: single4 },
  { id: "a04", url: portada, grade: "contrast(1.22) brightness(0.8) saturate(0.82)" },
];
