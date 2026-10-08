import React, { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { EASE_HAUS, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { STUDIO } from "../../i18n/studio";
import { scrollToTarget, useLenis } from "../../components/SmoothScroll/SmoothScroll";
import { LightWall } from "../../components/Light/LightWall";
import { ACTION, HEADING, LEAD, SMALL } from "../../lib/type";
import { EMAIL, INSTAGRAM } from "../../components/Contact/ContactMenu";
import { FUGA_SEI_EP } from "../../outils/artwork";
import Footer from "../../components/Footer/Footer";
import grimaldi from "../../assets/gallery/grimaldi-lines.jpg";
import { ProcessSteps, ServicesShowcase } from "./ServicesShowcase";

// three.js loads only on this page, after the text
const WhiteRoom = lazy(() => import("../../components/Light/WhiteRoom"));

// The room fades into the page's wall at the top (under the header) and the bottom, so it has no edge,
// and away to the left, so the words there sit on the plain wall
const ROOM_FADE = [
  "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.9) 16%, rgba(0,0,0,0.9) 55%, transparent 100%)",
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.55) 55%, #000 85%)",
].join(", ");

// Fine film grain, as on the landing
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";


/**
 * A chapter of the page: a hairline across, the label in the left column,
 * the content in the right, like the index of a well-set book.
 */
const Chapter: React.FC<{
  label: string;
  id?: string;
  children: React.ReactNode;
}> = ({ label, id, children }) => (
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
      {label}
    </h2>
    <div className="col-span-12 md:col-span-9">{children}</div>
  </motion.section>
);

/** A text link that darkens and draws its hairline on hover */
const PlainLink: React.FC<{ href: string; external?: boolean; dark?: boolean; children: React.ReactNode }> = ({
  href,
  external,
  dark,
  children,
}) => (
  <a
    href={href}
    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    className={`group relative transition-colors duration-500 ${
      dark ? "text-platinum/75 hover:text-platinum" : "text-graphite hover:text-ink"
    }`}
  >
    {children}
    <span
      className={`absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 ease-haus group-hover:scale-x-100 ${
        dark ? "bg-platinum" : "bg-ink"
      }`}
    />
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
  dark?: boolean;
}> = ({ label, name, type = "text", multiline, value, onChange, dark }) => {
  const shared = `w-full border-0 border-b bg-transparent pb-3 pt-2 font-geo text-base font-normal tracking-[0.02em] outline-none transition-colors duration-500 ${
    dark
      ? "border-platinum/25 text-platinum caret-platinum focus:border-platinum"
      : "border-ink/20 text-ink focus:border-ink"
  }`;
  return (
    <label className="block">
      <span className={`${SMALL} ${dark ? "text-platinum/60" : "text-graphite"}`}>{label}</span>
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
  const lenis = useLenis();
  const { hash } = useLocation();
  // Arriving from a "let's talk" link: glide down to the contact once the page has come in
  useEffect(() => {
    if (hash !== "#contact") return;
    const id = window.setTimeout(() => {
      const target = document.getElementById("contact");
      if (target) scrollToTarget(lenis, target, { offset: -96 });
    }, 700);
    return () => window.clearTimeout(id);
  }, [hash, lenis]);
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
    // No bottom padding: the dark contact block closes the page, the footer follows it
    <main className="relative overflow-x-clip px-4 pt-28 sm:px-6 md:px-8 md:pt-32">
      <LightWall />

      {/* The opening: a white room, curved, with lines of light set into its wall */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-[1] h-[100svh] max-h-[960px] min-h-[640px]"
        // Both fades apply at once: each point keeps the lesser of the two
        style={{ maskImage: ROOM_FADE, WebkitMaskImage: ROOM_FADE, maskComposite: "intersect", WebkitMaskComposite: "source-in" }}
      >
        <Suspense fallback={null}>
          <WhiteRoom className="h-full w-full" />
        </Suspense>
      </div>

      {/* Header, as in the other rooms: one quiet line. The logo heads the page,
          and the statement below is the one large thing to read */}
      <motion.header
        variants={rise}
        initial="hidden"
        animate="shown"
        custom={1}
        className={`${SMALL} flex flex-col gap-2 text-graphite sm:flex-row sm:items-baseline sm:justify-between`}
      >
        <h1>
          <span className="text-ink">{t("section.studio")}</span> — {t("section.studio.caption")}
        </h1>
        <p className="flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {t("availability")}
        </p>
      </motion.header>

      {/* Statement and way in */}
      <div className="mb-16 mt-16 grid items-center gap-14 md:mb-20 md:mt-20 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-7">
      {/* The statement: the one thing to read first */}
      <motion.p
        variants={rise}
        initial="hidden"
        animate="shown"
        custom={3}
        className={`${LEAD} max-w-[34ch] text-ink`}
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
        className={`${ACTION} mt-12 flex flex-wrap items-center gap-x-4 gap-y-3 text-ink`}
      >
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById("contact");
            if (target) scrollToTarget(lenis, target, { offset: -96 });
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
        {/* Phones: the address wraps under the link, so the separator would dangle */}
        <span aria-hidden className="hidden text-graphite sm:inline">
          ·
        </span>
        <PlainLink href={`mailto:${EMAIL}`}>{EMAIL}</PlainLink>
      </motion.div>
      </div>

      </div>

      {/* What the studio does, shown: an example for each discipline, held while it is read */}
      <ServicesShowcase s={s} />

      <Chapter label={s.processLabel}>
        <ProcessSteps steps={s.process} />
      </Chapter>

      <Chapter label={s.voiceLabel}>
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
            <p className={`${HEADING} text-ink`}>
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
              className={`${ACTION} group mt-5 inline-flex items-center gap-1.5 text-graphite transition-colors duration-500 hover:text-ink`}
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

      {/* Contact: the page closes in a dark room lit like the landing — its mauve,
          olive and pale bloom turned low — and the footer lives inside it */}
      <motion.section
        id="contact"
        className="relative -mx-4 mt-8 scroll-mt-24 overflow-hidden bg-[#2f2b2a] px-4 pb-10 pt-24 text-platinum sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 md:pt-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.4, ease: EASE_HAUS }}
      >
        {/* The landing's light, at dusk */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(55% 60% at 0% 100%, rgba(150, 146, 110, 0.32) 0%, transparent 75%),
              radial-gradient(50% 55% at 8% 0%, rgba(120, 98, 116, 0.38) 0%, transparent 80%),
              radial-gradient(45% 60% at 92% 30%, rgba(236, 226, 222, 0.14) 0%, transparent 75%)
            `,
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen" style={{ backgroundImage: GRAIN }} />

        <div className="relative grid grid-cols-12 gap-x-8 gap-y-16">
          <div className="col-span-12 lg:col-span-6">
            <h2 className={`${SMALL} text-platinum/55`}>
              {s.contactLabel}
            </h2>
            <p className={`${LEAD} mt-8 max-w-[18ch] text-platinum`}>
              {s.contactLead}
            </p>
            {/* Availability, then the direct ways in */}
            <div className={`${ACTION} mt-12 flex flex-col items-start gap-4`}>
              <span className="flex items-center gap-2.5 text-platinum/70">
                <span aria-hidden className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-40 [animation-duration:2.8s]" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-current" />
                </span>
                {t("availability")}
              </span>
              <PlainLink href={`mailto:${EMAIL}`} dark>
                {EMAIL}
              </PlainLink>
              <PlainLink href={INSTAGRAM} external dark>
                instagram ↗
              </PlainLink>
            </div>
          </div>

          {/* The form, on a pane of smoked glass */}
          <form
            onSubmit={onSubmit}
            className="col-span-12 grid gap-9 self-start rounded-sm border border-platinum/10 bg-platinum/[0.04] p-8 backdrop-blur-sm sm:grid-cols-2 md:p-10 lg:col-span-6"
          >
            <Field label={s.form.name} name="name" value={form.name} onChange={set("name")} dark />
            <Field label={s.form.email} name="email" type="email" value={form.email} onChange={set("email")} dark />
            <div className="sm:col-span-2">
              <Field label={s.form.message} name="message" multiline value={form.message} onChange={set("message")} dark />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 sm:col-span-2">
              <span className={`${SMALL} text-platinum/50`}>{s.form.note}</span>
              <button
                type="submit"
                // The way out of the page: solid light, the one filled form in this room
                className={`${ACTION} group inline-flex items-center gap-2.5 rounded-full bg-platinum px-7 py-3 text-ink transition-colors duration-500 hover:bg-white`}
              >
                {s.form.send}
                <span aria-hidden className="transition-transform duration-500 ease-haus group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* The footer, inside the room */}
        <div className="relative mt-28">
          <Footer dark />
        </div>
      </motion.section>    </main>
  );
};
