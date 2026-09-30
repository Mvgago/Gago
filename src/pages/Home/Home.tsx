import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { ContactMenu } from "../../components/Contact/ContactMenu";
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
    {/* The centre: intentionally empty. Only light. */}
    <div className="flex-1" aria-hidden />

    <section className="flex flex-col gap-10 px-4 pb-8 sm:px-6 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:pb-12">
      {/* Manifesto */}
      <div className="max-w-xl font-geo">
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={7}
          className="text-[1.9rem] font-light leading-[1.1] tracking-[0.01em] sm:text-4xl lg:text-[2.75rem]"
        >
          {t("hero.title")}
        </motion.h1>

        <motion.p
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={8}
          className="mt-3 text-base font-light tracking-[0.02em] text-silver/85 sm:text-lg"
        >
          {t("hero.sub")}
        </motion.p>

        <motion.div variants={rise} initial="hidden" animate="shown" custom={10} className="mt-12">
          <Link to="/projects" className="meta group inline-flex items-center gap-3">
            <span className="relative">
              {t("hero.cta")}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-silver transition-transform duration-700 ease-haus group-hover:scale-x-100" />
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
      </motion.p>
    </section>
  </main>
  );
};
