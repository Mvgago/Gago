import React, { useState } from "react";
import { Link } from "react-router-dom";
import { SECTIONS } from "../../components/SpatialIndex/sections";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { ContactMenu } from "../../components/Contact/ContactMenu";
import { SocialLinks } from "../../components/Contact/SocialLinks";
import { useI18n } from "../../i18n/I18n";

const PROJECTS_TINT = SECTIONS[0].tint;

/**
 * Hero as an empty, lit room. The brand lives in the header corner,
 * the centre belongs to the studio light, and a short profile sits
 * low on the left, like a caption on a gallery wall.
 */
export const Home: React.FC = () => {
  const { t } = useI18n();
  const [hint, setHint] = useState(false);
  return (
  <main className="relative flex h-[100svh] min-h-[600px] w-full select-none flex-col overflow-hidden text-silver">
    {/* A hint of the work: while the way into the archive is hovered, the room
        takes on the light of the projects, rising from where the link sits. */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 transition-opacity duration-[1400ms] ease-haus"
      style={{
        opacity: hint ? 1 : 0,
        background: `radial-gradient(90% 75% at 12% 100%, ${PROJECTS_TINT}59 0%, ${PROJECTS_TINT}1f 45%, transparent 80%)`,
        mixBlendMode: "soft-light",
      }}
    />

    {/* Portrait screens: the light bloom falls right behind the manifesto, so a soft
        shade gathers under the type to keep the silver legible. */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 lg:hidden"
      style={{
        background:
          "radial-gradient(130% 55% at 0% 72%, rgba(78, 66, 76, 0.55) 0%, rgba(92, 82, 90, 0.3) 45%, transparent 80%)",
      }}
    />

    {/* The centre: intentionally empty. Only light. */}
    <div className="flex-1" aria-hidden />

    <section className="relative flex flex-col gap-10 px-4 pb-8 sm:px-6 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:pb-12">
      {/* Manifesto */}
      <div className="max-w-xl font-geo">
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={7}
          className="text-[2.05rem] font-light leading-[1.1] tracking-[0.01em] sm:text-[2.5rem] lg:text-[3.1rem]"
        >
          {t("hero.title")}
        </motion.h1>

        <motion.p
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={8}
          className="mt-3 text-[1.0625rem] font-light tracking-[0.02em] text-silver/85 [text-wrap:balance] sm:text-[1.2rem] lg:text-[1.3rem]"
        >
          {t("hero.sub")}
        </motion.p>

        <motion.div variants={rise} initial="hidden" animate="shown" custom={10} className="mt-12">
          <Link
            to="/projects"
            // The one way into the work: a step firmer than the other small type,
            // with a hairline always under it that lights up on hover.
            className="meta group inline-flex items-center gap-3 !text-[12px] !font-normal text-silver lg:!text-[13px]"
            onPointerEnter={(e) => e.pointerType === "mouse" && setHint(true)}
            onPointerLeave={() => setHint(false)}
            onFocus={() => setHint(true)}
            onBlur={() => setHint(false)}
          >
            <span className="relative">
              {t("hero.cta")}
              <span className="absolute -bottom-1.5 left-0 h-px w-full bg-silver/40" />
              <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-silver transition-transform duration-700 ease-haus group-hover:scale-x-100 group-focus-visible:scale-x-100" />
            </span>
            <span className="transition-transform duration-700 ease-haus group-hover:translate-x-1.5">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Availability and contact: one quiet line, bottom right */}
      <motion.p
        className="flex flex-col items-start gap-1 font-mono text-[11px] font-light lowercase tracking-[0.12em] text-graphite [text-shadow:none] sm:flex-row sm:items-center sm:gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, delay: 1.8 }}
      >
        <span>{t("availability")} — {new Date().getFullYear()}</span>
        <span aria-hidden className="hidden sm:inline">·</span>
        <ContactMenu />
        <span aria-hidden className="hidden sm:inline">·</span>
        <SocialLinks className="hover:text-ink" />
      </motion.p>
    </section>
  </main>
  );
};
