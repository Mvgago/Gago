import React, { Suspense, lazy, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_HAUS, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { STUDIO } from "../../i18n/studio";
import { scrollToTarget, useLenis } from "../../components/SmoothScroll/SmoothScroll";
import { LightWall } from "../../components/Light/LightWall";
import { ACTION, LEAD, SMALL, TITLE } from "../../lib/type";
import { cases } from "../../outils/cases";
import buendiaCatalogue from "../../assets/peojects/buendia/buendia-catalogue-web.jpg";
import buendiaSocial from "../../assets/peojects/buendia/buendia-social-web.jpg";
import sapWeb from "../../assets/peojects/saphire/saphire.jpg";
import smCards from "../../assets/peojects/smart/smart-cards-web.jpg";

// The picture each case shows here, where its own cover would not read at this size
const PICK: Record<string, string> = { buendia: buendiaCatalogue };
// A second picture of each, that the tile turns to and back from, each in its own time
const NEXT: Record<string, string> = { buendia: buendiaSocial, sapphire: sapWeb, smarthc: smCards };
// Drawn in close where the picture has a wide margin: the complex fills the tile, cut at its ends
const ZOOM: Record<string, [number, string]> = {};
import { EMAIL, INSTAGRAM } from "../../components/Contact/ContactMenu";
import Footer from "../../components/Footer/Footer";
import { GlassPane } from "../../components/Contact/GlassPane";import { ProcessSteps, ServicesShowcase } from "./ServicesShowcase";

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
  /** every field must be filled in, except one marked optional */
  optional?: boolean;
  /** what is missing, said in the site's own voice under the field (the browser's bubble is never shown) */
  error?: string;
}> = ({ label, name, type = "text", multiline, value, onChange, dark, optional = false, error }) => {
  const shared = `w-full border-0 border-b bg-transparent pb-3 pt-2 font-geo text-base font-normal tracking-[0.02em] outline-none transition-colors duration-500 ${
    error
      ? "border-[#e3a99a] text-platinum caret-platinum"
      : dark
        ? "border-platinum/25 text-platinum caret-platinum focus:border-platinum"
        : "border-ink/20 text-ink focus:border-ink"
  }`;
  const common = {
    name,
    required: !optional,
    value,
    "aria-invalid": !!error || undefined,
    "aria-describedby": error ? `${name}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };
  return (
    <label className="relative block">
      <span className={`${SMALL} ${dark ? "text-platinum/60" : "text-graphite"}`}>{label}</span>
      {multiline ? (
        <textarea rows={4} {...common} className={`${shared} resize-none`} />
      ) : (
        <input type={type} autoComplete={name === "email" ? "email" : name === "name" ? "name" : name === "phone" ? "tel" : undefined} {...common} className={shared} />
      )}
      {/* the note, small, in a soft red, rising in under the line and gone as soon as it is put right */}
      <AnimatePresence>
        {error && (
          <motion.span
            id={`${name}-error`}
            className={`${SMALL} absolute left-0 top-full mt-2 text-[#e3a99a]`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.35, ease: EASE_HAUS }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
};

export const AboutPage: React.FC = () => {
  const { t, lang } = useI18n();
  const s = STUDIO[lang];
  const lenis = useLenis();
  const { hash, key } = useLocation();
  // Arriving from a "let's talk" link: glide down to the contact once the page has come in
  useEffect(() => {
    if (hash !== "#contact") return;
    const id = window.setTimeout(() => {
      const target = document.getElementById("contact");
      if (target) scrollToTarget(lenis, target, { offset: -96 });
    }, 700);
    return () => window.clearTimeout(id);
  }, [hash, key, lenis]); // the key: a second click on the same link glides down again
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  // what is missing, field by field; each clears itself as soon as that field is written in
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const set = (key: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [key]: v }));
    setErrors((er) => (er[key] ? { ...er, [key]: undefined } : er));
  };

  // Sent from the page itself, through Web3Forms (its public access key, tied to the studio's inbox,
  // is set as VITE_WEB3FORMS_KEY): the visitor never leaves the page. Without a key, the mail app
  // composes it instead
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  // What the note says back as the message grows: a few words that keep up with how much has been written
  const written = form.message.trim().length;
  const hint = written >= 160 ? s.form.hooked : written >= 50 ? s.form.good : written > 0 ? s.form.more : s.form.note;
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // checked here, not by the browser: what is missing is said under each field, and the first
    // one left is where the cursor goes
    const missing: Partial<Record<keyof typeof form, string>> = {
      name: form.name.trim() ? undefined : s.form.errName,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? undefined : s.form.errEmail,
      message: form.message.trim() ? undefined : s.form.errMessage,
    };
    const first = (["name", "email", "message"] as const).find((k) => missing[k]);
    if (first) {
      setErrors(missing);
      document.querySelector<HTMLElement>(`#contact [name="${first}"]`)?.focus();
      return;
    }
    const key = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;
    const subject = `${t("contact.subject")} — ${form.name}`;
    if (!key) {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${form.message}\n\n${form.name}\n${form.email}${form.phone ? `\n${form.phone}` : ""}`)}`;
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: key, subject, from_name: "fugahaus.com", name: form.name, email: form.email, phone: form.phone || "—", message: form.message, botcheck: "" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error("send");
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };


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
        {/* On the right, one line: open to new projects, and it is the way down to the contact form */}
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById("contact");
            if (target) scrollToTarget(lenis, target, { offset: -96 });
          }}
          className="group relative inline-flex items-center gap-2 self-start text-ink sm:self-auto"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
          {t("availability")}
          <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
        </a>
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

      {/* The work, quietly: three small cases on the left; on the right, the invitation to talk */}
      <Section>
        <div className="col-span-12 lg:col-span-7 xl:col-span-8">
          <div className="mb-6 flex justify-end">
            <Link to="/projects" className={`${SMALL} text-graphite transition-colors duration-500 hover:text-ink`}>
              {s.workAll}
            </Link>
          </div>
          {/* edge to edge, the three touching, out to the screen's left edge */}
          <ul className="-mx-4 grid grid-cols-3 sm:-mx-6 md:-ml-8 md:mr-0">
            {cases
              .filter((c) => !c.hidden)
              .slice(0, 3)
              .map((c, k) => (
                <li key={c.slug}>
                  <Link to={`/projects/${c.slug}`} aria-label={c.title} className="group block">
                    <span className="relative block aspect-[4/3] overflow-hidden bg-ink/5">
                      <img
                        src={PICK[c.slug] ?? c.thumb ?? c.cover}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover opacity-90 transition-[transform,opacity] duration-[1400ms] ease-haus group-hover:scale-[1.04] group-hover:opacity-100"
                        style={{ objectPosition: c.coverFocus }}
                      />
                      {/* the second picture dissolves in over the first, settling from a touch closer,
                          and away again: the three take turns, so one is always changing */}
                      {NEXT[c.slug] && (
                        <span className="absolute inset-0 opacity-0 motion-safe:animate-[fh-turn_12s_ease-in-out_infinite]" style={{ animationDelay: `${2 + k * 4}s` }}>
                          <img
                            src={NEXT[c.slug]}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                            style={ZOOM[c.slug] && { transform: `scale(${ZOOM[c.slug][0]})`, transformOrigin: ZOOM[c.slug][1] }}
                          />
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
        <div className="col-span-12 mt-16 flex flex-col justify-end lg:col-span-5 lg:mt-0 xl:col-span-4">
          <p className={`${TITLE} text-ink`}>{s.closing}</p>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const target = document.getElementById("contact");
              if (target) scrollToTarget(lenis, target, { offset: -96 });
            }}
            className={`${ACTION} group relative mt-8 self-start text-ink`}
          >
            {s.cta}
            <span className="absolute -bottom-1.5 left-0 h-px w-full bg-ink/30" />
            <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-haus group-hover:scale-x-100" />
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
        {/* sent: the room lights up from behind the pane, warm, and stays a little brighter */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(45% 60% at 74% 42%, rgba(255, 238, 222, 0.32) 0%, rgba(214, 180, 196, 0.12) 45%, transparent 75%)" }}
          initial={false}
          animate={status === "sent" ? { opacity: [0, 1, 0.45], transition: { duration: 2.2, times: [0, 0.3, 1], ease: "easeOut" } } : { opacity: 0, transition: { duration: 0.8 } }}
        />

        <div className="relative grid grid-cols-12 gap-x-8 gap-y-16">
          <div className="col-span-12 lg:col-span-6">
            <h2 className={`${SMALL} text-platinum/55`}>
              {s.contactLabel}
            </h2>
            <p className={`${LEAD} mt-8 max-w-[18ch] text-platinum`}>
              {s.contactLead}
            </p>
            {/* The direct ways in */}
            <div className={`${ACTION} mt-12 flex flex-col items-start gap-4`}>
              <PlainLink href={`mailto:${EMAIL}`} dark>
                {EMAIL}
              </PlainLink>
              <PlainLink href={INSTAGRAM} external dark>
                instagram
              </PlainLink>
            </div>


          </div>

          {/* The form, on a pane of smoked glass */}
          <GlassPane className="col-span-12 self-start lg:col-span-6">
          <AnimatePresence mode="wait" initial={false}>
          {status === "sent" ? (
            // Sent: the pane turns over, like a card, and on its back is the confirmation, with a way to write again
            <motion.div
              key="sent"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0, transition: { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] } }}
              exit={{ opacity: 0, rotateY: -90, transition: { duration: 0.35, ease: [0.6, 0, 0.8, 0.3] } }}
              className="flex min-h-[22rem] flex-col items-start justify-center rounded-sm border border-platinum/20 bg-platinum/[0.07] p-8 backdrop-blur-sm md:p-10"
            >
              {/* the check draws itself, and two rings of light spread out from it and fade */}
              <span className="relative block h-14 w-14">
                {[0, 1].map((k) => (
                  <motion.span
                    key={k}
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-platinum/50"
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 2.6], opacity: [0.7, 0] }}
                    transition={{ duration: 1.4, delay: 1.05 + k * 0.3, ease: "easeOut" }}
                  />
                ))}
                <svg viewBox="0 0 48 48" className="relative h-14 w-14 text-platinum" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <motion.circle cx="24" cy="24" r="22" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE_HAUS }} />
                  <motion.path d="M15 24.5l6 6 12-13" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.95, ease: EASE_HAUS }} />
                </svg>
              </span>
              {/* the title rises word by word, as the site's titles do */}
              <p className={`${LEAD} mt-8 text-platinum`} aria-label={s.form.sentTitle}>
                {s.form.sentTitle.split(" ").map((w, k) => (
                  <React.Fragment key={k}>
                    {k > 0 && " "}
                    <span aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                      <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, delay: 1.1 + k * 0.09, ease: EASE_HAUS }}>
                        {w}
                      </motion.span>
                    </span>
                  </React.Fragment>
                ))}
              </p>
              <motion.p
                className="mt-3 max-w-[36ch] font-geo text-[15px] leading-relaxed tracking-[0.02em] text-platinum/75"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5, ease: EASE_HAUS }}
              >
                {s.form.sent}
              </motion.p>
              <motion.button
                type="button"
                onClick={() => setStatus("idle")}
                className={`${ACTION} group relative mt-10 text-platinum`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.9 }}
              >
                {s.form.another}
                <span className="absolute -bottom-1.5 left-0 h-px w-full bg-platinum/30" />
                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-platinum transition-transform duration-700 ease-haus group-hover:scale-x-100" />
              </motion.button>
            </motion.div>
          ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0, transition: { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] } }}
            exit={{ opacity: 0, rotateY: -90, transition: { duration: 0.35, ease: [0.6, 0, 0.8, 0.3] } }}
            onSubmit={onSubmit}
            noValidate
            className="grid gap-9 rounded-sm border border-platinum/10 bg-platinum/[0.04] p-8 backdrop-blur-sm sm:grid-cols-2 md:p-10 xl:grid-cols-3"
          >
            <Field label={s.form.name} name="name" value={form.name} onChange={set("name")} dark error={errors.name} />
            <Field label={s.form.email} name="email" type="email" value={form.email} onChange={set("email")} dark error={errors.email} />
            {/* optional, for those who would rather talk: on wide screens the three share one row */}
            <div className="sm:col-span-2 xl:col-span-1">
              <Field label={s.form.phone} name="phone" type="tel" value={form.phone} onChange={set("phone")} dark optional />
            </div>
            <div className="sm:col-span-2 xl:col-span-3">
              <Field label={s.form.message} name="message" multiline value={form.message} onChange={set("message")} dark error={errors.message} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 sm:col-span-2 xl:col-span-3">
              {/* the note, or how the sending went, in the same place */}
              <span role="status" aria-live="polite" className={`${SMALL} transition-colors duration-500 ${status === "error" ? "text-[#e3a99a]" : "text-platinum/50"}`}>
                {status === "error" ? (
                  s.form.error
                ) : (
                  // the note answers back as the message is written
                  <motion.span key={hint} className="inline-block" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE_HAUS }}>
                    {hint}
                  </motion.span>
                )}
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
          </motion.form>
          )}
          </AnimatePresence>
          </GlassPane>
        </div>

        {/* The footer, inside the room */}
        <div className="relative mt-28">
          <Footer dark />
        </div>
      </motion.section>    </main>
  );
};