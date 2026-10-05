import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cases, CASE_UI, DISCIPLINE } from "../../outils/cases";
import { EASE_HAUS, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { LightWall, SMALL } from "../../components/Light/LightWall";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The selected projects, as an index: one row each — number, name, scope,
 * year — read in seconds. On wide screens each row shows its cover as a strip at
 * the row's height, quiet until pointed at; on phones each row carries its cover above it.
 */
export const ProjectsPage: React.FC = () => {
  const { t, lang } = useI18n();
  // The project pointed at or focused, if any
  const [pointed, setActive] = useState<number | null>(null);
  // At rest the index is not still: it walks through the projects on its own, one
  // every few seconds, like a slow exhibition. The cursor takes over at once.
  const [walk, setWalk] = useState(0);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (pointed !== null || touched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setWalk((w) => (w + 1) % cases.length), 3200);
    return () => window.clearInterval(id);
  }, [pointed, touched]);
  const active = pointed ?? (touched ? null : walk);

  return (
    <main className="px-4 pb-24 pt-28 sm:px-6 md:px-8 md:pt-32">
      <LightWall />

      {/* Header, as in the other rooms */}
      <header className="mb-16 grid gap-6 md:mb-24 md:grid-cols-12 md:items-end">
        <div className="md:col-span-6">
          <motion.p variants={rise} initial="hidden" animate="shown" className={`${SMALL} text-graphite`}>
            01
          </motion.p>
          <motion.h1
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={1}
            className="mt-3 font-geo text-[2.4rem] font-light lowercase leading-none tracking-[0.04em] text-ink sm:text-5xl"
          >
            {t("section.projects")}
          </motion.h1>
        </div>
        <motion.div
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={2}
          className="flex flex-col gap-2 md:col-span-5 md:col-start-8 md:items-end md:text-right"
        >
          <p className="font-geo text-base font-normal tracking-[0.04em] text-graphite">{t("section.projects.caption")}</p>
          <p className={`${SMALL} tabular-nums text-graphite`}>
            {pad(cases.length)} {CASE_UI.count[lang]}
          </p>
        </motion.div>
      </header>

      {/* The index. On wide screens each row holds its own cover, at the row's height,
          on its right: softened at rest, in full colour when its project is pointed at. */}
      <div>
        <ul className="border-t border-ink/10" onPointerLeave={() => setActive(null)}>
          {cases.map((c, i) => (
            <motion.li
              key={c.slug}
              className="border-b border-ink/10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_HAUS, delay: 0.15 + i * 0.06 }}
            >
              <Link
                to={`/projects/${c.slug}`}
                onPointerEnter={() => {
                  setActive(i);
                  setTouched(true);
                }}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={`group relative isolate grid grid-cols-12 items-baseline gap-x-6 gap-y-3 py-7 transition-[opacity,padding] duration-500 ease-haus md:py-9 lg:min-h-[200px] lg:content-center lg:pr-[64%] ${active === i ? "lg:pl-6" : "lg:pl-0"} ${
                  active !== null && active !== i ? "lg:opacity-45" : ""
                }`}
              >
                {/* Wide screens, the row in focus: a paler panel behind its text, and a hairline
                    drawn down its left edge — clear, but in the page's own quiet language */}
                <span
                  aria-hidden
                  className={`absolute inset-y-0 left-0 right-[62%] -z-10 hidden bg-[#f8f8f9] transition-opacity duration-500 lg:block ${
                    active === i ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span
                  aria-hidden
                  className={`absolute inset-y-0 left-0 hidden w-[2px] origin-top bg-ink transition-transform duration-700 ease-haus lg:block ${
                    active === i ? "scale-y-100" : "scale-y-0"
                  }`}
                />

                {/* Wide screens: the cover, as a strip at the row's own height: softened at rest, in full colour when pointed at */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 right-0 hidden w-[62%] overflow-hidden bg-[#f8f8f9] lg:block"
                  style={{ animation: `strip-in 1.1s cubic-bezier(0.22,1,0.36,1) ${0.2 + i * 0.12}s both` }}
                >
                  <img
                    src={c.thumb ?? c.cover}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className={`h-full w-full transition-[transform,filter,opacity] duration-700 ease-haus ${
                      "object-cover"
                    } ${active === i ? "scale-100 opacity-100 saturate-100" : "scale-[1.03] opacity-80 saturate-[.45]"}`}
                    style={{ objectPosition: c.coverFocus }}
                  />
                </span>

                {/* Phones and tablets: the cover above the row */}
                <span className="col-span-12 mb-2 block aspect-[16/10] overflow-hidden bg-[#f8f8f9] lg:hidden">
                  <img
                    src={c.cover}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className={`h-full w-full ${c.coverFit === "contain" ? "object-contain p-6" : "object-cover"}`}
                  />
                </span>

                <span className={`${SMALL} col-span-2 tabular-nums text-graphite md:col-span-1`}>{pad(i + 1)}</span>
                <span className="col-span-10 font-geo text-[1.6rem] font-light leading-tight tracking-[0.02em] text-ink transition-transform duration-700 ease-haus group-hover:translate-x-2 md:col-span-11 md:text-[2.1rem]">
                  {c.title}
                </span>
                <span className={`${SMALL} col-span-10 col-start-3 text-graphite md:col-span-11 md:col-start-2`}>
                  {c.disciplines.map((d) => DISCIPLINE[d][lang]).join(" · ")}
                  {c.year && <span className="tabular-nums"> — {c.year}</span>}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </main>
  );
};
