import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { EASE_HAUS, rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { STUDIO } from "../../i18n/studio";
import { scrollToTarget, useLenis } from "../../components/SmoothScroll/SmoothScroll";
import { DARK_WALL, LightWall } from "../../components/Light/LightWall";
import { Reveal, RevealFlow, RevealWords } from "../../components/Reveal/Reveal";
import { ACTION, BODY, LEAD, SMALL, TITLE } from "../../lib/type";
import { cases } from "../../outils/cases";

const WORK_ORDER = ["sapphire", "buendia", "smarthc", "gracia-prados", "tolva"];
import buendiaCatalogue from "../../assets/peojects/buendia/buendia-catalogue-web.jpg.webp";
import buendiaSocial from "../../assets/peojects/buendia/buendia-social-web.jpg.webp";
import sapWeb from "../../assets/peojects/saphire/saphire.jpg.webp";
import smCards from "../../assets/peojects/smart/smart-cards-web.jpg.webp";
import santaFacade from "../../assets/peojects/santa/santa (7).jpg.webp";
import santaBedroom from "../../assets/peojects/santa/santa-bedroom.jpg.webp";
import tolvaWindow from "../../assets/peojects/tolva/tolva-window.webp";
import tolvaServe from "../../assets/peojects/tolva/tolva-serve.webp";

// The picture each case shows here, where its own cover would not read at this size
const PICK: Record<string, string> = { buendia: buendiaCatalogue, "gracia-prados": santaFacade, tolva: tolvaWindow };
// A second picture of each, that the tile turns to and back from, each in its own time
const NEXT: Record<string, string> = { buendia: buendiaSocial, sapphire: sapWeb, smarthc: smCards, "gracia-prados": santaBedroom, tolva: tolvaServe };
// Drawn in close where the picture has a wide margin: the complex fills the tile, cut at its ends
const ZOOM: Record<string, [number, string]> = {};
import { EMAIL, INSTAGRAM } from "../../components/Contact/ContactMenu";
import Footer from "../../components/Footer/Footer";
import { ProcessSteps, ServicesShowcase } from "./ServicesShowcase";

// Beside the form, how it works, said plainly
const TRUST: Record<string, string[]> = {
  es: ["Una primera conversación, sin compromiso.", "Trabajas directamente con quien diseña."],
  en: ["A first conversation, with no commitment.", "You work directly with whoever designs."],
  fr: ["Un premier échange, sans engagement.", "Vous travaillez directement avec qui conçoit."],
  de: ["Ein erstes Gespräch, unverbindlich.", "Sie arbeiten direkt mit der Person, die gestaltet."],
};




/**
 * A chapter of the page: a hairline across, the label in the left column,
 * the content in the right, like the index of a well-set book.
 */
/** A part of the page after the showcase, on its 12-column grid */
const Section: React.FC<{ children: React.ReactNode; lit?: boolean }> = ({ children, lit = false }) => (
  <motion.section
    className={`relative isolate grid grid-cols-12 gap-x-8 py-12 md:py-16 ${lit ? "md:mt-20" : ""}`}
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-10% 0px" }}
    transition={{ duration: 1.2, ease: EASE_HAUS }}
  >
    {/* lit: the room brightens behind this part of the page, a warmer, paler graphite under a soft light from
        above, out to both edges of the screen, coming and going in long fades with no edge anywhere */}
    {lit && (
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -inset-y-28 -z-10 sm:-inset-x-6 md:-inset-x-8 md:-inset-y-40"
        style={{
          background: [
            // (the light falls over the steps, not behind the title, so the heading stays crisp)
            "radial-gradient(50% 42% at 34% 18%, rgba(244, 236, 228, 0.09) 0%, transparent 70%)",
            "linear-gradient(to bottom, rgba(92, 84, 80, 0) 0%, rgba(92, 84, 80, 0.36) 28%, rgba(92, 84, 80, 0.36) 72%, rgba(92, 84, 80, 0) 100%)",
          ].join(", "),
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 26%, #000 74%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 26%, #000 74%, transparent 100%)",
        }}
      />
    )}
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
  const shared = `w-full border-0 border-b bg-transparent pb-1.5 pt-0 sm:pb-3 sm:pt-2 font-geo text-base font-normal tracking-[0.02em] outline-none transition-colors duration-500 ${
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
      {/* one line always, so fields side by side keep their lines level even when a label is long */}
      <span className={`${SMALL} block overflow-hidden text-ellipsis whitespace-nowrap ${dark ? "text-platinum/60" : "text-graphite"}`}>{label}</span>
      {multiline ? (
        <textarea rows={4} {...common} className={`${shared} h-14 resize-none sm:h-auto`} />
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
  const stillPage = !!useReducedMotion();
  // the availability line at the foot of the opening fades out over the first stretch of scrolling
  const { scrollY } = useScroll();
  const availFade = useTransform(scrollY, [0, 240], [1, 0]);
  const availEvents = useTransform(availFade, (v) => (v < 0.05 ? "none" : "auto"));
  const lenis = useLenis();
  const { hash, key } = useLocation();
  // Arriving from a "let's talk" link on another page: the page comes in already at the contact,
  // never passing by the top on the way (set at once, then set again as the pictures above settle).
  // Already on the page, a second click on such a link glides down instead
  const arrived = useRef(false);
  useEffect(() => {
    // the contact, or one of the disciplines (the landing's line of services links to each)
    const anchor = hash === "#contact" ? "contact" : hash.startsWith("#disciplina-") ? hash.slice(1) : null;
    if (!anchor) return;
    const toContact = (immediate: boolean) => {
      const target = document.getElementById(anchor);
      // the section already keeps the header's height above it (scroll-margin); on phones that is
      // all it needs, so the whole form fits in one screen. A discipline lands level with the held
      // frame, under the header
      const offset = anchor === "contact" ? (window.innerWidth < 640 ? 0 : -96) : window.innerWidth < 1024 ? -64 : -112;
      if (target) scrollToTarget(lenis, target, { offset, immediate });
    };
    if (!arrived.current) {
      const raf = requestAnimationFrame(() => toContact(true));
      const ids = [250, 700, 1400].map((ms) => window.setTimeout(() => toContact(true), ms));
      const done = window.setTimeout(() => (arrived.current = true), 1500);
      // the visitor scrolls on their own: stop setting the page back
      const stop = () => {
        ids.forEach(window.clearTimeout);
        arrived.current = true;
      };
      window.addEventListener("wheel", stop, { once: true, passive: true });
      window.addEventListener("touchmove", stop, { once: true, passive: true });
      return () => {
        cancelAnimationFrame(raf);
        ids.forEach(window.clearTimeout);
        window.clearTimeout(done);
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchmove", stop);
      };
    }
    const id = window.setTimeout(() => toContact(false), 100);
    return () => window.clearTimeout(id);
  }, [hash, key, lenis]); // the key: a second click on the same link glides down again
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  // a field no person sees, a trap for robots
  const trap = useRef<HTMLInputElement>(null);
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
    // a robot fills in every field it finds, the hidden one too: it is shown the confirmation, and
    // nothing is sent
    if (trap.current?.value) {
      setStatus("sent");
      return;
    }
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
    <main className="fh-dark relative overflow-x-clip px-4 pt-[5.25rem] sm:px-6 sm:pt-28 md:px-8 md:pt-32 lg:pt-[5.25rem]">
      {/* (the ground only: a solid layer here covered the studio's light, which lies behind the pages) */}
      <LightWall color={DARK_WALL} layer={false} />
      {/* (the room's light lives behind every page, in App, so it never moves with the page's entrance) */}

      {/* (the page sits on the plain wall: no room behind the opening) */}

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
          {/* phones: the name of the room alone */}
          <span className="text-ink">{t("section.studio")}</span>
          <span className="hidden sm:inline"> — {t("section.studio.caption")}</span>
        </h1>
      </motion.header>

      {/* Statement and way in */}
      <div className="relative mb-6 mt-5 grid items-center gap-14 sm:mb-8 sm:mt-8 md:mb-10 md:mt-3 lg:mb-8 lg:mt-5 lg:grid-cols-12 lg:gap-8">
      {/* open to new projects, held in the screen's lower right corner on arrival (wide screens), under the first
          discipline's words: it comes in once the headline has settled, and fades away as the page is scrolled.
          On <body>, so the page's entrance never carries it; in the dark room's tones */}
      {createPortal(
      <motion.div className={`fh-dark ${SMALL} pointer-events-auto fixed bottom-10 right-8 z-20 hidden lg:block`} style={{ opacity: availFade, pointerEvents: availEvents }}>
      <motion.div initial={stillPage ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: EASE_HAUS, delay: 1.3 }}>
        {/* the whole block is the way down to the contact form: the line, and under it (wide screens) a
            small status readout in the spirit of early-2000s interfaces, a row of fine cells a light keeps
            sweeping along after a crosshair, each growing a little as it lights, and the studio's initials.
            Pointed at, it all brightens a shade, no underline */}
        <style>{`@keyframes fh-scan{0%,100%{opacity:.24;transform:scaleY(1)}6%{opacity:.6;transform:scaleY(1.5)}22%{opacity:.24;transform:scaleY(1)}}@keyframes fh-fg{0%,40%,64%,100%{transform:scale(1);opacity:.8;filter:none}47%{transform:scale(1.06);opacity:1;filter:drop-shadow(0 0 3px rgba(244,241,237,0.4))}}`}</style>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            const target = document.getElementById("contact");
            if (target) scrollToTarget(lenis, target, { offset: -96 });
          }}
          className="group hidden flex-col items-stretch sm:flex"
        >
          <span className="text-ink/85 transition-colors duration-500 group-hover:text-ink">{t("availability")}</span>
          <span aria-hidden className="mt-3 hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.25em] text-ink/60 transition-colors duration-500 group-hover:text-ink/85 lg:flex">
            {/* the line's dot, moved down to lead the readout */}
            <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
            {/* the cells share whatever the line leaves, so the readout runs exactly as wide as the line
                above it, crosshair under the dot and initials ending with the last word */}
            <span className="flex flex-1 gap-[3px]">
              {Array.from({ length: 14 }, (_, k) => (
                <span
                  key={k}
                  className="block h-[3px] flex-1 rounded-[1.5px] bg-ink"
                  style={{ opacity: 0.24, animation: stillPage ? undefined : `fh-scan 3.2s linear ${k * 0.09}s infinite` }}
                />
              ))}
            </span>
            {/* the studio's initials, F and g, drawn from the logo's own strokes, small; as the sweep reaches them
                they swell a little and light up, then settle */}
            <svg
              viewBox="249 677 679 401"
              className="ml-1.5 h-[13px] w-auto origin-center text-ink transition-colors duration-500"
              style={{ opacity: 0.8, animation: stillPage ? undefined : "fh-fg 3.2s linear infinite" }}
              fill="none"
              stroke="currentColor"
              strokeWidth="35"
            >
              <path d="M570 695L300 695Q267 695 267 728L267 976M267 826L570 826" />
              <path transform="translate(-345 0)" d="M1255 960L1015 960Q980 960 980 925L980 807Q980 772 1015 772L1255 772L1255 1025Q1255 1060 1220 1060L965 1060" />
            </svg>
          </span>
        </a>
      </motion.div>
      </motion.div>,
      document.body,
      )}
      <div className="min-w-0 lg:col-span-12">
      {/* The statement in two voices: the image of the fugue as the page's headline, large, its words rising
          into place one after another as the lema does on the landing; then what it means, smaller and set
          back in grey, read as the line under a title */}
      {(() => {
        const cut = s.statement.lastIndexOf(". ");
        const head = cut < 0 ? s.statement : s.statement.slice(0, cut + 1);
        const sub = cut < 0 ? "" : s.statement.slice(cut + 2);
        return (
          <>
            <RevealWords
              as="h2"
              text={head}
              className="block max-w-[22ch] font-geo text-[1.65rem] font-normal leading-[1.14] tracking-[0.005em] text-ink sm:text-[2rem] lg:max-w-[30ch] lg:text-[2.5rem]"
              delay={0.3}
              stagger={0.035}
            />
            {/* a single thread of light drawn under the headline as it settles, the site's motif ("hilando fino"),
                fading out to the right */}
            <motion.span
              aria-hidden
              // (phones and tablets only: on wide screens the headline stands without it)
              className="mt-5 block h-px w-full max-w-[26rem] origin-left sm:mt-6 lg:hidden"
              style={{
                background: "linear-gradient(90deg, rgba(244, 241, 237, 0.85) 0%, rgba(244, 241, 237, 0.4) 55%, rgba(244, 241, 237, 0) 100%)",
                boxShadow: "0 0 10px rgba(244, 241, 237, 0.25)",
              }}
              initial={stillPage ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.8, ease: EASE_HAUS, delay: 0.4 + head.split(" ").length * 0.035 }}
            />
            {sub && (
              <RevealFlow text={sub} className={`${BODY} mt-4 max-w-[46ch] text-graphite sm:mt-6 lg:mt-6 lg:max-w-[76ch] lg:text-[1.15rem]`} delay={0.65 + head.split(" ").length * 0.035} />
            )}
          </>
        );
      })()}

      {/* (no index of the disciplines here: each follows straight on with its own large example) */}

      </div>


      </div>

      {/* What the studio does, shown: an example for each discipline, held while it is read */}
      <ServicesShowcase s={s} />

      {/* The process, in the showcase's grid: the steps under the frame's column, the title in
          the column the disciplines are read in; lit, so it reads as its own part of the page */}
      <Section lit>
        <div className="col-span-12 lg:order-2 lg:col-span-5 xl:col-span-4">
          <Reveal as="p" className={`${SMALL} text-ink/75`}>{s.processLabel}</Reveal>
          {/* (a weight up from the other titles and the full ink: it reads crisp over the lit band) */}
          <RevealWords as="h2" text={s.processTitle} className={`${TITLE} mt-4 block !font-normal text-ink`} delay={0.1} />
          {/* what sets the process apart, said once and quietly under its title */}
          <RevealFlow text={s.processNote} className={`${BODY} mt-2 text-ink/85`} delay={0.35} stagger={0.03} />
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
          {/* phones: a strip to slide through with the finger, each case nearly the screen's width */}
          {/* the cases' names stay out of search results (data-nosnippet), as their pages do */}
          <ul data-nosnippet className="-mx-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] sm:-mx-6 sm:grid sm:grid-cols-5 sm:overflow-visible md:-ml-8 md:mr-0 [&::-webkit-scrollbar]:hidden">
            {/* in the same order as the projects page */}
            {cases
              .filter((c) => !c.hidden)
              .sort((a, b) => WORK_ORDER.indexOf(a.slug) - WORK_ORDER.indexOf(b.slug))
              .map((c, k) => (
                <li key={c.slug} className="w-[84%] shrink-0 snap-start sm:w-auto">
                  <Link to={`/projects/${c.slug}`} aria-label={c.title} className="group block">
                    <span className="relative block aspect-[4/3] overflow-hidden bg-ink/5 sm:aspect-[3/4]">
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
                        <span className="absolute inset-0 opacity-0 motion-safe:animate-[fh-turn_12s_ease-in-out_infinite]" style={{ animationDelay: `${2 + k * 2.4}s` }}>
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
          <RevealWords as="p" text={s.closing} className={`${TITLE} text-ink`} />
          {/* who you would be talking to: no face, just how it works */}
          <RevealFlow text={s.closingNote} className={`${BODY} mt-5 max-w-[36ch] text-graphite`} delay={0.35} />
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
        className="relative -mx-4 scroll-mt-24 overflow-hidden px-4 pb-10 pt-6 text-platinum sm:-mx-6 sm:px-6 sm:pt-8 md:-mx-8 md:px-8 md:pt-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1.4, ease: EASE_HAUS }}
      >
        {/* The landing's light, at dusk: it gathers as the page reaches the contact, out of the room's own
            light, with no edge where the block begins (it fades in from the top) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 35%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 35%)",
            background: `
              radial-gradient(55% 60% at 0% 100%, rgba(150, 146, 110, 0.36) 0%, transparent 75%),
              radial-gradient(50% 55% at 8% 0%, rgba(120, 98, 116, 0.42) 0%, transparent 80%),
              radial-gradient(48% 62% at 78% 45%, rgba(236, 226, 222, 0.2) 0%, transparent 72%)
            `,
          }}
        />
        {/* a deeper shade under the form, faded in from above like the light, so the pane stands out */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, rgba(20, 17, 16, 0.32) 45%, rgba(20, 17, 16, 0.4) 100%)",
          }}
        />
        {/* sent: the room lights up from behind the pane, warm, and stays a little brighter */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(45% 60% at 74% 42%, rgba(255, 238, 222, 0.32) 0%, rgba(214, 180, 196, 0.12) 45%, transparent 75%)" }}
          initial={false}
          animate={status === "sent" ? { opacity: [0, 1, 0.45], transition: { duration: 2.2, times: [0, 0.3, 1], ease: "easeOut" } } : { opacity: 0, transition: { duration: 0.8 } }}
        />

        <div className="relative grid grid-cols-12 gap-x-8 gap-y-8 sm:gap-y-12">
          {/* the close of the page, as a case opens: the label, then the line large and across */}
          <div className="col-span-12">
            <h2 className={`${SMALL} text-platinum/55`}>
              {s.contactLabel}
            </h2>
            <RevealWords as="p" text={s.contactLead} className="mt-4 block max-w-[24ch] font-geo text-[2.1rem] font-medium leading-[1.06] tracking-[0.005em] text-platinum sm:mt-6 md:text-[3.2rem]" delay={0.2} />
          </div>
          {/* how it works, in three plain lines, and the ways in (on phones these come after the form) */}
          <div className="col-span-12 lg:col-span-4">
            <ul className="flex flex-col gap-3 border-t border-platinum/15 pt-5">
              {(TRUST[lang] ?? TRUST.es).map((line) => (
                <li key={line} className="font-geo text-[1.02rem] leading-snug text-platinum/85">{line}</li>
              ))}
            </ul>
            <div className={`${ACTION} mt-10 hidden flex-col items-start gap-3 sm:flex`}>
              <PlainLink href={`mailto:${EMAIL}`} dark>
                {EMAIL}
              </PlainLink>
              <PlainLink href={INSTAGRAM} external dark>
                instagram
              </PlainLink>
            </div>
          </div>

          {/* The form, straight on the room: no pane, only its hairlines */}
          <div className="col-span-12 self-start lg:col-span-8">
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
            // phones: tighter, so the whole form fits in about one screen
            className="relative grid grid-cols-2 items-end gap-x-4 gap-y-4 border-t border-platinum/15 pt-5 sm:gap-x-9 sm:gap-y-8 xl:grid-cols-3"
          >
            {/* the trap: out of sight, out of the tab order, and left empty by anyone real */}
            <input ref={trap} type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px opacity-0" />
            {/* phones: the name across, then email and phone side by side, so the form fits in one screen */}
            <div className="col-span-2 sm:col-span-1">
              <Field label={s.form.name} name="name" value={form.name} onChange={set("name")} dark error={errors.name} />
            </div>
            <div className="col-span-1">
              <Field label={s.form.email} name="email" type="email" value={form.email} onChange={set("email")} dark error={errors.email} />
            </div>
            {/* optional, for those who would rather talk: on wide screens the three share one row */}
            <div className="col-span-1 sm:col-span-2 xl:col-span-1">
              <Field label={s.form.phone} name="phone" type="tel" value={form.phone} onChange={set("phone")} dark optional />
            </div>
            <div className="col-span-2 xl:col-span-3">
              <Field label={s.form.message} name="message" multiline value={form.message} onChange={set("message")} dark error={errors.message} />
            </div>
            {/* the two notes together, then the button: on phones the button closes the form at full
                width; on wider screens it sits to the right of the notes */}
            <div className="col-span-2 mt-1 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-end sm:justify-between sm:gap-8 xl:col-span-3">
              <div className="flex flex-col gap-2">
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
              {/* what is done with the details, said where they are given, as the law asks */}
              <p className={`${SMALL} text-[8px] normal-case leading-snug tracking-[0.02em] text-platinum/40 sm:text-[9px]`}>
                {s.form.privacy}
                <Link to="/privacy" className="text-platinum/65 underline decoration-platinum/30 underline-offset-4 transition-colors duration-300 hover:text-platinum">
                  {s.form.privacyLink}
                </Link>
                .
              </p>
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                // The way out of the page: solid light, the one filled form in this room
                className={`${ACTION} group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-platinum px-9 py-3.5 text-[#3b3734] transition-colors duration-500 hover:bg-white disabled:cursor-wait disabled:opacity-70`}
              >
                {status === "sending" ? s.form.sending : s.form.send}
              </button>
            </div>
          </motion.form>
          )}
          </AnimatePresence>
          </div>
          {/* phones: the direct ways in, under the form */}
          <div className={`${ACTION} col-span-12 flex flex-wrap items-center gap-x-6 gap-y-2 sm:hidden`}>
            <PlainLink href={`mailto:${EMAIL}`} dark>
              {EMAIL}
            </PlainLink>
            <PlainLink href={INSTAGRAM} external dark>
              instagram
            </PlainLink>
          </div>
        </div>

        {/* The footer, inside the room */}
        <div className="relative mt-28">
          <Footer dark />
        </div>
      </motion.section>    </main>
  );
};
