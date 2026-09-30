import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { ContactMenu } from "../../components/Contact/ContactMenu";

/**
 * Hero as an empty, lit room. The brand lives in the header corner,
 * the centre belongs to the studio light, and a short profile sits
 * low on the left, like a caption on a gallery wall.
 */
export const Home: React.FC = () => (
  <main className="relative flex h-[100svh] min-h-[600px] w-full select-none flex-col overflow-hidden text-silver [text-shadow:0_1px_14px_rgba(45,35,30,0.18)]">
    {/* The centre: intentionally empty. Only light. */}
    <div className="flex-1" aria-hidden />

    <section className="flex flex-col gap-10 px-4 pb-8 sm:px-6 sm:pb-10 md:flex-row md:items-end md:justify-between md:px-8 md:pb-12">
      {/* Profile */}
      <div className="max-w-xl font-geo">
        <motion.p variants={rise} initial="hidden" animate="shown" custom={6} className="meta text-clay-soft">
          00 — profile
        </motion.p>

        <motion.h1
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={7}
          className="mt-5 text-[1.9rem] font-light leading-[1.1] tracking-[0.01em] sm:text-4xl lg:text-[2.75rem]"
        >
          Designer of atmospheres.
        </motion.h1>

        <motion.p
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={8}
          className="mt-3 text-base font-light tracking-[0.02em] text-clay-soft sm:text-lg"
        >
          Brand identity, web &amp; 3D imagery.
        </motion.p>

        <motion.div variants={rise} initial="hidden" animate="shown" custom={10} className="mt-9">
          <Link to="/projects" className="meta group inline-flex items-center gap-3">
            <span className="relative">
              enter the archive
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-silver transition-transform duration-700 ease-haus group-hover:scale-x-100" />
            </span>
            <span className="transition-transform duration-700 ease-haus group-hover:translate-x-1.5">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Availability and contact: one quiet line, bottom right */}
      <motion.p
        className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-light lowercase tracking-[0.12em] text-graphite [text-shadow:none]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.4, delay: 1.8 }}
      >
        <span>available for projects — {new Date().getFullYear()}</span>
        <span aria-hidden>·</span>
        <ContactMenu />
      </motion.p>
    </section>
  </main>
);
