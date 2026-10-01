import single3 from "../assets/gallery/single3.png";
import single4 from "../assets/gallery/single4.png";
import lerele from "../assets/gallery/lerele1.jpg";
import otono from "../assets/gallery/Otoño.jpg";
import portada from "../assets/gallery/portada.png";
import untitled from "../assets/gallery/untitlezdfdsd.png";
import summer from "../assets/gallery/summer2003.png";
import acne from "../assets/gallery/acne2.png";
import grimaldi from "../assets/gallery/grimaldi-lines.jpg";

/** The studio's own music project. */
export const FUGA_SEI_EP = "https://open.spotify.com/album/7EdGwidKh2TS1HsV3j67tf";

type Plate = {
  id: string;
  url: string;
  /** For plates that are a titled work: its title, a line of detail, and where to find it. */
  title?: string;
  detail?: string;
  href?: string;
};

// Fuga Sei leads: it is the studio's own work and stays first, whatever else hangs here.
// The two rose pieces close the series, as a pair.
export const artwork: Plate[] = [
  { id: "a10", url: grimaldi, title: "Grimaldi Lines", detail: "fuga sei · ep · 2026", href: FUGA_SEI_EP },
  { id: "a02", url: lerele },
  { id: "a03", url: otono },
  { id: "a04", url: portada },
  { id: "a05", url: untitled },
  { id: "a08", url: summer },
  { id: "a09", url: acne },
  { id: "a06", url: single4 },
  { id: "a01", url: single3 },
];
