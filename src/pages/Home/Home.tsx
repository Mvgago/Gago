import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { ContactMenu } from "../../components/Contact/ContactMenu";
import { SocialLinks } from "../../components/Contact/SocialLinks";
import { useI18n } from "../../i18n/I18n";
import { ACTION, DISPLAY, SMALL, SUBTITLE } from "../../lib/type";

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
      <div className="max-w-xl lg:max-w-3xl">
        <motion.h1
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={7}
          className={DISPLAY}
        >
          {/* Always two lines, on every screen: the lema reads as one block with the subtitle */}
          {(() => {
            const [first, ...rest] = t("hero.title").split(" ");
            return (
              <>
                <span className="block">{first}</span>
                <span className="block">{rest.join(" ")}</span>
              </>
            );
          })()}
        </motion.h1>

        <motion.p
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={8}
          className={`${SUBTITLE} mt-3 text-silver/85 [text-wrap:balance] lg:mt-5`}
        >
          {t("hero.sub")}
        </motion.p>

        {/* Two ways in: the work first and strongest, what the studio does under it */}
        <motion.div variants={rise} initial="hidden" animate="shown" custom={10} className="mt-12 flex flex-col items-start gap-2.5 lg:mt-16">
          <Link
            to="/projects"
            className={`${ACTION} group inline-flex items-center gap-4 text-silver transition-colors duration-500 hover:text-silver focus-visible:text-silver`}
          >
            <span className="transition-[letter-spacing] duration-700 ease-haus group-hover:tracking-[0.12em] group-focus-visible:tracking-[0.12em]">
              {t("hero.cta")}
            </span>
            <span aria-hidden className="relative block h-px w-16 lg:w-20">
              <span className="absolute inset-y-0 left-0 w-full origin-left bg-current opacity-60 transition-all duration-700 ease-haus group-hover:opacity-100 group-hover:scale-x-[1.6] group-focus-visible:scale-x-[1.6]" />
            </span>
          </Link>
          {/* the second way in, a step below: the same gesture, a shorter, fainter line */}
          <Link
            to="/about"
            className={`${ACTION} group inline-flex items-center gap-4 text-silver/85 transition-colors duration-500 hover:text-silver focus-visible:text-silver`}
          >
            <span className="transition-[letter-spacing] duration-700 ease-haus group-hover:tracking-[0.12em] group-focus-visible:tracking-[0.12em]">
              {t("hero.services")}
            </span>
            <span aria-hidden className="relative block h-px w-8">
              <span className="absolute inset-y-0 left-0 w-full origin-left bg-current opacity-60 transition-all duration-700 ease-haus group-hover:opacity-100 group-hover:scale-x-[2.2] group-focus-visible:scale-x-[2.2]" />
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Availability and contact: one quiet line, bottom right */}
      <motion.p
        className={`${SMALL} flex flex-col items-start gap-1 text-graphite [text-shadow:none] sm:flex-row sm:items-center sm:gap-3`}
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
