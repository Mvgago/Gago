import React, { useState } from "react";
import { motion } from "framer-motion";
import { EASE_HAUS, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { STUDIO } from "../../i18n/studio";
import { LightWall, SMALL } from "../../components/Light/LightWall";
import { EMAIL, INSTAGRAM } from "../../components/Contact/ContactMenu";
import { FUGA_SEI_EP } from "../../outils/artwork";
import grimaldi from "../../assets/gallery/grimaldi-lines.jpg";

const pad = (n: number) => String(n).padStart(2, "0");

/** One grid for every chapter with entries: equal columns, equal gaps */
const GRID = "grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8";

/** Body copy of the inner rooms */
// Regular weight: light strokes at this size fade on the pale wall
const BODY = "font-geo text-[15px] font-normal leading-relaxed tracking-[0.02em] text-graphite";

/**
 * A chapter of the page: a hairline across, the label in the left column,
 * the content in the right, like the index of a well-set book.
 */
const Chapter: React.FC<{ index: number; label: string; id?: string; children: React.ReactNode }> = ({
  index,
  label,
  id,
  children,
}) => (
  <motion.section
    id={id}
    // scroll-mt: clears the fixed header when reached through a link
    className="grid scroll-mt-24 grid-cols-12 gap-x-8 border-t border-ink/10 py-16 md:py-20"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10% 0px" }}
    transition={{ duration: 1.2, ease: EASE_HAUS }}
  >
    <h2 className={`${SMALL} col-span-12 mb-10 text-graphite md:col-span-3 md:mb-0`}>
      {pad(index)} — {label}
    </h2>
    <div className="col-span-12 md:col-span-9">{children}</div>
  </motion.section>
);

/** Title and text, used for the disciplines and the steps of the process */
const Entry: React.FC<{ index: number; title: string; text: string; large?: boolean }> = ({
  index,
  title,
  text,
  large,
}) => (
  <div>
    <span className={`${SMALL} tabular-nums text-graphite`}>{pad(index)}</span>
    <h3
      className={`mt-3 font-geo font-light tracking-[0.02em] text-ink ${
        large ? "text-[1.35rem] leading-snug" : "text-[1.05rem] leading-snug"
      }`}
    >
      {title}
    </h3>
    <p className={`mt-3 ${BODY}`}>{text}</p>
  </div>
);

/** A text link that darkens and draws its hairline on hover */
const PlainLink: React.FC<{ href: string; external?: boolean; children: React.ReactNode }> = ({
  href,
  external,
  children,
}) => (
  <a
    href={href}
    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    className="group relative text-graphite transition-colors duration-500 hover:text-ink"
  >
    {children}
    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
  </a>
);

/** A form field: a hairline to write on, its label above */
const Field: React.FC<{
  label: string;
  name: string;
  type?: string;
  multiline?: boolean;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, name, type = "text", multiline, value, onChange }) => {
  const shared =
    "w-full border-0 border-b border-ink/20 bg-transparent pb-3 pt-2 font-geo text-base font-normal tracking-[0.02em] text-ink outline-none transition-colors duration-500 focus:border-ink";
  return (
    <label className="block">
      <span className={`${SMALL} text-graphite`}>{label}</span>
      {multiline ? (
        <textarea name={name} rows={4} required value={value} onChange={(e) => onChange(e.target.value)} className={`${shared} resize-none`} />
      ) : (
        <input name={name} type={type} required value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
      )}
    </label>
  );
};

export const AboutPage: React.FC = () => {
  const { t, lang } = useI18n();
  const s = STUDIO[lang];
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  // No backend: the message is composed in the visitor's mail app.
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`${t("contact.subject")} — ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n${form.name}\n${form.email}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  // "{name}" becomes the link to the project, "{ep}" the EP's title
  const [beforeName, afterName] = s.voice.split("{name}");
  const [beforeEp, afterEp] = afterName.split("{ep}");

  return (
    <main className="px-4 pb-16 pt-28 sm:px-6 md:px-8 md:pt-32">
      <LightWall />

      {/* Header, as in the other rooms */}
      <header className="grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-6">
          <motion.p variants={rise} initial="hidden" animate="shown" className={`${SMALL} text-graphite`}>
            03
          </motion.p>
          <motion.h1
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={1}
            className="mt-3 font-geo text-[2.4rem] font-light lowercase leading-none tracking-[0.04em] text-ink sm:text-5xl"
          >
            {t("section.studio")}
          </motion.h1>
        </div>
        <motion.div
          variants={rise}
          initial="hidden"
          animate="shown"
          custom={2}
          className="flex flex-col gap-2 md:col-span-5 md:col-start-8 md:items-end md:text-right"
        >
          <p className="font-geo text-base font-normal tracking-[0.04em] text-graphite">{t("section.studio.caption")}</p>
          <p className={`${SMALL} flex items-center gap-2 text-graphite`}>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
            {t("availability")}
          </p>
        </motion.div>
      </header>

      {/* The statement: the one thing to read first */}
      <motion.p
        variants={rise}
        initial="hidden"
        animate="shown"
        custom={3}
        className="mt-20 max-w-[34ch] font-geo text-[1.9rem] font-light leading-[1.25] tracking-[0.01em] text-ink md:mt-28 md:text-[2.5rem]"
      >
        {s.statement}
      </motion.p>

      {/* The way in, right under it: down to the contact chapter, or straight to the address */}
      <motion.div
        variants={rise}
        initial="hidden"
        animate="shown"
        custom={4}
        // One line, one voice: the shortcut and the address in the same small type
        className="mb-24 mt-12 flex flex-wrap items-center gap-x-4 gap-y-3 font-mono text-[13px] font-normal lowercase tracking-[0.04em] text-ink md:mb-32"
      >
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          // A link, not a button: the index control stays the page's one solid form
          className="group inline-flex items-center gap-2.5"
        >
          <span className="relative">
            {s.cta}
            <span className="absolute -bottom-1.5 left-0 h-px w-full bg-ink/30" />
            <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
          </span>
          <span aria-hidden className="transition-transform duration-700 ease-haus group-hover:translate-y-0.5">
            ↓
          </span>
        </a>
        <span aria-hidden className="text-graphite">
          ·
        </span>
        <PlainLink href={`mailto:${EMAIL}`}>{EMAIL}</PlainLink>
      </motion.div>

      <Chapter index={1} label={s.disciplinesLabel}>
        {/* Same four-column grid as the process below, so the columns line up chapter to chapter */}
        <div className={GRID}>
          {s.disciplines.map((d, i) => (
            <Entry key={d.title} index={i + 1} title={d.title} text={d.text} large />
          ))}
        </div>
      </Chapter>

      <Chapter index={2} label={s.processLabel}>
        <div className={GRID}>
          {s.process.map((p, i) => (
            <Entry key={p.title} index={i + 1} title={p.title} text={p.text} />
          ))}
        </div>
      </Chapter>

      <Chapter index={3} label={s.voiceLabel}>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-10">
          <a
            href={FUGA_SEI_EP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fuga Sei — Grimaldi Lines"
            className="group block w-32 shrink-0 overflow-hidden"
          >
            <img
              src={grimaldi}
              alt=""
              draggable={false}
              className="block aspect-square w-full object-cover transition-transform duration-[1400ms] ease-haus group-hover:scale-[1.04]"
            />
          </a>
          <div className="max-w-xl">
            <p className="font-geo text-[1.15rem] font-normal leading-relaxed tracking-[0.02em] text-ink">
              {beforeName}
              <a
                href={FUGA_SEI_EP}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-ink/25 underline-offset-[5px] transition-colors duration-500 hover:decoration-ink"
              >
                Fuga Sei
              </a>
              {beforeEp}
              <em className="not-italic text-graphite">Grimaldi Lines</em>
              {afterEp}
            </p>
            <a
              href={FUGA_SEI_EP}
              target="_blank"
              rel="noopener noreferrer"
              className={`${SMALL} group mt-5 inline-flex items-center gap-1.5 text-graphite transition-colors duration-500 hover:text-ink`}
            >
              <span className="relative">
                {t("artwork.listen")}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
              </span>
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </Chapter>

      <Chapter index={4} label={s.contactLabel} id="contact">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="max-w-[22ch] font-geo text-[1.6rem] font-light leading-snug tracking-[0.01em] text-ink">
              {s.contactLead}
            </p>
            {/* Plain links here: the form beside already does the composing */}
            <div className="mt-10 flex flex-col items-start gap-3 font-mono text-[13px] font-normal lowercase tracking-[0.04em]">
              <PlainLink href={`mailto:${EMAIL}`}>{EMAIL}</PlainLink>
              <PlainLink href={INSTAGRAM} external>
                instagram ↗
              </PlainLink>
            </div>
          </div>

          <form onSubmit={onSubmit} className="grid gap-9 sm:grid-cols-2">
            <Field label={s.form.name} name="name" value={form.name} onChange={set("name")} />
            <Field label={s.form.email} name="email" type="email" value={form.email} onChange={set("email")} />
            <div className="sm:col-span-2">
              <Field label={s.form.message} name="message" multiline value={form.message} onChange={set("message")} />
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-span-2">
              <button
                type="submit"
                // Outlined, so the solid index control stays unique on the page
                className={`${SMALL} rounded-full border border-ink/30 px-7 py-3 text-ink transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-platinum`}
              >
                {s.form.send} →
              </button>
              <span className={`${SMALL} text-graphite`}>{s.form.note}</span>
            </div>
          </form>
        </div>
      </Chapter>
    </main>
  );
};
