import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { projects } from "../../outils/projects";
import { EASE_HAUS, rise } from "../../lib/motion";

// Rhythm of plate widths across the 12-column archive grid.
const SPANS = [
  "md:col-span-7",
  "md:col-span-5 md:mt-40",
  "md:col-span-5",
  "md:col-span-6 md:col-start-7 md:-mt-24",
  "md:col-span-4 md:col-start-2",
  "md:col-span-6 md:col-start-7 md:mt-24",
];

type Project = (typeof projects)[number];

const Plate: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const num = String(index + 1).padStart(2, "0");
  const available = project.link !== "#";

  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-pearl/60 shadow-[0_40px_80px_-40px_rgba(40,30,22,0.45)]">
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="h-full w-full object-cover grayscale-[0.35] transition-[transform,filter] duration-[1400ms] ease-haus group-hover:scale-[1.035] group-hover:grayscale-0"
        />
        {/* Satin glaze that lifts on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-ink/15 opacity-100 transition-opacity duration-1000 group-hover:opacity-0" />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/15 pt-3">
        <div className="flex items-baseline gap-4">
          <span className="meta text-graphite">{num}</span>
          <span className="font-display text-sm tracking-[0.02em] text-ink sm:text-base">{project.title}</span>
        </div>
        <span className="meta shrink-0 text-graphite">{available ? "view →" : "in archive"}</span>
      </div>
    </>
  );

  return (
    <motion.li
      className={`col-span-12 ${SPANS[index % SPANS.length]}`}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1.4, ease: EASE_HAUS }}
    >
      {available ? (
        <Link to={project.link} className="group block">
          {body}
        </Link>
      ) : (
        <div className="group">{body}</div>
      )}
    </motion.li>
  );
};

export const ProjectsPage: React.FC = () => (
  <main className="px-4 pt-24 sm:px-6 md:px-8 md:pt-28">
    <header className="mb-20 grid grid-cols-12 gap-6 md:mb-32">
      <motion.p variants={rise} initial="hidden" animate="shown" className="meta col-span-12 text-graphite md:col-span-3">
        01 — selected works
      </motion.p>
      <motion.h1
        variants={rise}
        initial="hidden"
        animate="shown"
        custom={1}
        className="text-satin col-span-12 font-display text-[13vw] leading-[0.95] tracking-[-0.03em] md:col-span-9 md:text-[8vw]"
      >
        projects
      </motion.h1>
      <motion.p
        variants={rise}
        initial="hidden"
        animate="shown"
        custom={2}
        className="col-span-12 max-w-md font-serif text-xl font-light italic text-graphite md:col-span-6 md:col-start-4"
      >
        Brand identities, digital spaces and rendered atmospheres — built slowly, lit carefully.
      </motion.p>
    </header>

    <ul className="grid grid-cols-12 gap-x-6 gap-y-20 md:gap-x-10 md:gap-y-28">
      {projects.map((p, i) => (
        <Plate key={p.title} project={p} index={i} />
      ))}
    </ul>
  </main>
);
