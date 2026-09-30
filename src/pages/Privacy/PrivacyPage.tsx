import React from "react";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { PRIVACY } from "../../i18n/privacy";
import { EMAIL } from "../../components/Contact/ContactMenu";

/** The email address inside a paragraph, as a mailto link. */
const withEmail = (text: string) =>
  text.split("{email}").flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <a key={i} href={`mailto:${EMAIL}`} className="underline decoration-ink/25 underline-offset-4 hover:decoration-ink">
            {EMAIL}
          </a>,
          part,
        ],
  );

export const PrivacyPage: React.FC = () => {
  const { lang } = useI18n();
  const p = PRIVACY[lang];

  return (
    <main className="px-4 pt-24 sm:px-6 md:px-8 md:pt-28">
      <div className="grid grid-cols-12 gap-x-6 gap-y-10">
        <div className="col-span-12 md:col-span-3">
          <motion.p variants={rise} initial="hidden" animate="shown" className="meta text-graphite">
            {p.updated}
          </motion.p>
        </div>

        <motion.div
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={1}
          className="col-span-12 max-w-2xl md:col-span-8 md:col-start-5"
        >
          <h1 className="font-geo text-4xl font-light leading-[1.1] tracking-[0.01em] text-ink sm:text-5xl">{p.title}</h1>
          <p className="mt-6 font-sans text-base font-light leading-relaxed text-ink/85 sm:text-lg">{p.intro}</p>

          <div className="mt-14 flex flex-col gap-10">
            {p.sections.map((s, i) => (
              <section key={s.title} className="border-t border-ink/15 pt-6">
                <h2 className="meta text-graphite">
                  {String(i + 1).padStart(2, "0")} — {s.title}
                </h2>
                {s.body.map((para, j) => (
                  <p key={j} className="mt-4 font-sans text-[15px] font-light leading-relaxed text-ink/85">
                    {withEmail(para)}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
};
