import React, { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { EASE_HAUS, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { STUDIO } from "../../i18n/studio";
import { scrollToTarget, useLenis } from "../../components/SmoothScroll/SmoothScroll";
import { LightWall } from "../../components/Light/LightWall";
import { ACTION, BODY, LEAD, SMALL, TITLE } from "../../lib/type";
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
/** A part of the page after the showcase, on its 12-column grid */
const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.section
    className="grid grid-cols-12 gap-x-8 border-t border-ink/10 py-20 md:py-28"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10% 0px" }}
    transition={{ duration: 1.2, ease: EASE_HAUS }}
  >
    {children}
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
        <input name={name} type={type} required autoComplete={name === "email" ? "email" : name === "name" ? "name" : undefined} value={value} onChange={(e) => onChange(e.target.value)} className={shared} />
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

  // Sent from the page itself, through Web3Forms (its public access key, tied to the studio's inbox,
  // is set as VITE_WEB3FORMS_KEY): the visitor never leaves the page. Without a key, the mail app
  // composes it instead
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
    const subject = `${t("contact.subject")} — ${form.name}`;
    if (!key) {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${form.message}\n\n${form.name}\n${form.email}`)}`;
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: key, subject, from_name: "fugahaus.com", name: form.name, email: form.email, message: form.message, botcheck: "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error("send");
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
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
        {/* On the right: open to new projects, and under it the way in: down to the contact chapter, or straight to the address */}
        <div className="flex flex-col gap-5 sm:items-end">
          <p className="flex items-center gap-2">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
            {t("availability")}
          </p>
          <motion.div
            variants={rise}
            initial="hidden"
            animate="shown"
            custom={4}
            // One line, one voice: the shortcut and the address in the same small type
            className={`${ACTION} flex flex-wrap items-center gap-x-4 gap-y-3 text-ink`}
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
            </a>
            {/* Phones: the address wraps under the link, so the separator would dangle */}
            <span aria-hidden className="hidden text-graphite sm:inline">
              ·
            </span>
            <PlainLink href={`mailto:${EMAIL}`}>{EMAIL}</PlainLink>
          </motion.div>
        </div>
      </motion.header>

      {/* Statement and way in */}
      <div className="mb-8 mt-8 grid items-center gap-14 md:mb-10 md:mt-3 lg:grid-cols-12 lg:gap-8">
      <div className="lg:col-span-9">
      {/* The statement: the one thing to read first */}
      <motion.p
        variants={rise}
        initial="hidden"
        animate="shown"
        custom={3}
        // Smaller than a subtitle here, so the film below fits whole on the first screen
        className="font-geo text-[1.05rem] font-light leading-snug tracking-[0.01em] text-ink lg:text-[1.2rem]"
      >
        {/* Two lines, each whole: what the studio is, then its principle, set back in grey */}
        {(() => {
          const cut = s.statement.lastIndexOf(". ");
          if (cut < 0) return s.statement;
          return (
            <>
              {/* held to a width that sets it in two lines, the principle making the third */}
              <span className="block max-w-[66ch]">{s.statement.slice(0, cut + 1)}</span>
              <span className="block text-graphite">{s.statement.slice(cut + 2)}</span>
            </>
          );
        })()}
      </motion.p>

      </div>

      </div>

      {/* What the studio does, shown: an example for each discipline, held while it is read */}
      <ServicesShowcase s={s} />

      {/* The process, in the showcase's grid: the steps under the frame's column, the title in
          the column the disciplines are read in */}
      <Section>
        <div className="col-span-12 lg:order-2 lg:col-span-5 xl:col-span-4">
          <p className={`${SMALL} text-graphite`}>{s.processLabel}</p>
          <h2 className={`${TITLE} mt-4 text-ink`}>{s.processTitle}</h2>
        </div>
        <div className="col-span-12 mt-12 lg:order-1 lg:col-span-7 lg:mt-0 xl:col-span-8">
          <ProcessSteps steps={s.process} />
        </div>
      </Section>

      {/* The studio's own voice, set the same way: the record large on the left, its words on the right */}
      <Section>
        <div className="col-span-12 lg:order-2 lg:col-span-5 xl:col-span-4">
          <p className={`${SMALL} text-graphite`}>{s.voiceLabel}</p>
          <h2 className={`${TITLE} mt-4 text-ink`}>Fuga Sei</h2>
          <p className={`${BODY} mt-6 max-w-[42ch] text-graphite`}>
            {beforeName}Fuga Sei{beforeEp}
            <em className="not-italic text-ink">Grimaldi Lines</em>
            {afterEp}
          </p>
          <a
            href={FUGA_SEI_EP}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ACTION} group relative mt-8 inline-block text-ink`}
          >
            {t("artwork.listen")}
            <span className="absolute -bottom-1.5 left-0 h-px w-full bg-ink/30" />
            <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
          </a>
        </div>
        <div className="col-span-12 mt-12 lg:order-1 lg:col-span-7 lg:mt-0 xl:col-span-8">
          <a
            href={FUGA_SEI_EP}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fuga Sei — Grimaldi Lines"
            className="group -mx-4 block overflow-hidden sm:-mx-6 md:mx-0 md:w-full md:max-w-[22rem]"
          >
            <img
              src={grimaldi}
              alt=""
              draggable={false}
              className="block aspect-square w-full object-cover transition-transform duration-[1400ms] ease-haus group-hover:scale-[1.03]"
            />
          </a>
        </div>
      </Section>

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
                instagram
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
              {/* the note, or how the sending went, in the same place */}
              <span role="status" aria-live="polite" className={`${SMALL} transition-colors duration-500 ${status === "sent" ? "text-platinum" : status === "error" ? "text-[#e3a99a]" : "text-platinum/50"}`}>
                {status === "sent" ? s.form.sent : status === "error" ? s.form.error : s.form.note}
              </span>
              <button
                type="submit"
                disabled={status === "sending"}
                // The way out of the page: solid light, the one filled form in this room
                className={`${ACTION} group inline-flex items-center gap-2.5 rounded-full bg-platinum px-7 py-3 text-ink transition-colors duration-500 hover:bg-white disabled:cursor-wait disabled:opacity-70`}
              >
                {status === "sending" ? s.form.sending : s.form.send}
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
