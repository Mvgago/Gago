import { projects } from "../../outils/projects";
import { artwork } from "../../outils/artwork";

export type Section = {
  num: string;
  label: string;
  path: string;
  caption: string;
  previews: string[];
};

export const SECTIONS: Section[] = [
  {
    num: "01",
    label: "projects",
    path: "/projects",
    caption: "selected works — identity, web, 3d",
    // Hand-picked light files: some project covers are tens of MB.
    previews: ["The Sapphire", "AMORSACRO", "Santa Engracia"]
      .map((t) => projects.find((p) => p.title === t)?.image)
      .filter((src): src is string => Boolean(src)),
  },
  {
    num: "02",
    label: "artwork",
    path: "/artwork",
    caption: "experiments, covers & rendered matter",
    previews: ["a03", "a02", "a05"]
      .map((id) => artwork.find((a) => a.id === id)?.url)
      .filter((src): src is string => Boolean(src)),
  },
  {
    num: "03",
    label: "studio",
    path: "/about",
    caption: "identity, vision & contact",
    previews: ["/fugahaus-hero.jpg"],
  },
];
