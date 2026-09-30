import { projects } from "../../outils/projects";
import { artwork } from "../../outils/artwork";

export type Section = {
  num: string;
  label: string;
  path: string;
  caption: string;
  /** The section's image. */
  atmosphere: string;
  /** The section's light: the dominant colour of its work, carried through the petals. */
  tint: string;
};

// Hand-picked light files: some project covers are tens of MB.
const imageOf = (title: string) => projects.find((p) => p.title === title)?.image ?? "";

export const SECTIONS: Section[] = [
  {
    num: "01",
    label: "projects",
    path: "/projects",
    caption: "selected works — identity, web, 3d",
    atmosphere: imageOf("The Sapphire"),
    tint: "#5b82c4", // ocean blue
  },
  {
    num: "02",
    label: "artwork",
    path: "/artwork",
    caption: "experiments, covers & rendered matter",
    atmosphere: artwork.find((a) => a.id === "a03")?.url ?? "",
    tint: "#c8663a", // terracotta
  },
  {
    num: "03",
    label: "studio",
    path: "/about",
    caption: "identity, vision & contact",
    atmosphere: "/fugahaus-hero.jpg",
    tint: "#86b5b0", // sea-glass
  },
];
