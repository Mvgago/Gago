import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { ContactMenu } from "../../components/Contact/ContactMenu";
import { SocialLinks } from "../../components/Contact/SocialLinks";
import { useI18n } from "../../i18n/I18n";

/**
 * Hero as an empty, lit room. The brand lives in the header corner,
 * the centre belongs to the studio light, and a short profile sits
 * low on the left, like a caption on a gallery wall.
 */
export const Home: React.FC = () => {
  const { t } = useI18n();
  return (
  <main className="relative flex h-[100svh] min-h-[600px] w-full select-none flex-col overflow-hidden text-silver">
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
      <div className="max-w-xl font-geo lg:max-w-3xl">
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={7}
          className="text-[2.05rem] font-light leading-[1.1] tracking-[0.01em] sm:text-[2.5rem] lg:text-[4.4rem] lg:leading-[1.02]"
        >
          {t("hero.title")}
        </motion.h1>

        <motion.p
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={8}
          className="mt-3 text-[1.25rem] font-light tracking-[0.02em] text-silver/85 [text-wrap:balance] sm:text-[1.5rem] lg:mt-5 lg:text-[2.1rem]"
        >
          {t("hero.sub")}
        </motion.p>

        <motion.div variants={rise} initial="hidden" animate="shown" custom={10} className="mt-12 lg:mt-16">
          <Link
            to="/projects"
            // The one way into the work: a step firmer than the other small type,
            // with a hairline always under it that lights up on hover.
            className="meta group inline-flex items-center gap-3 !text-[14px] !font-normal !tracking-[0.22em] text-silver sm:!text-[15px] lg:!text-[18px]"
          >
            <span className="relative">
              {t("hero.cta")}
              <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-silver transition-transform duration-700 ease-haus group-hover:scale-x-100 group-focus-visible:scale-x-100" />
            </span>
            {/* A long hairline arrow, drawn: it stretches towards the work on hover */}
            <svg
              aria-hidden
              viewBox="0 0 48 12"
              className="ml-1 h-3 w-10 overflow-visible transition-transform duration-700 ease-haus group-hover:translate-x-2 lg:w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.1}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M0 6h47M41 1l6 5-6 5" />
            </svg>
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
