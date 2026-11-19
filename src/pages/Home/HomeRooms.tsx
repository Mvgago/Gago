import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { EASE_HAUS } from "../../lib/motion";
import { ACTION, DISPLAY, SMALL } from "../../lib/type";
import { useI18n } from "../../i18n/I18n";
import type { Key } from "../../i18n/strings";
import { Reveal, RevealWords } from "../../components/Reveal/Reveal";
import { ContactMenu } from "../../components/Contact/ContactMenu";
import { SocialLinks } from "../../components/Contact/SocialLinks";

/**
 * Under the landing's empty, lit room, the house opens one room at a time as the page goes down: each
 * one a single picture hung on the same wall, with its name low on the left, the way the manifesto sits
 * above. The studio light stays fixed behind, so going down never leaves the room, only walks along it.
 * It ends on the contact, as the page's own foot.
 */

type Room = {
  num: string;
  key: "projects" | "artwork" | "studio";
  path: string;
  /** the picture on wide screens, and an upright cut of it for phones */
  wide: string;
  tall: string;
  /** wide screens: a film played in a loop while the plate is in view (the picture stays its first frame) */
  film?: string;
  /** where the picture is held when cut */
  focus?: string;
  /** the plate's shape and place on the wall, wide screens (12 columns) */
  plate: string;
  aspect: string;
};

const ROOMS: Room[] = [
  {
    num: "01",
    key: "projects",
    path: "/projects",
    wide: "/video/the-sapphire-poster.webp",
    tall: "/video/the-sapphire-poster-vertical.webp?v=3",
    film: "/video/the-sapphire-720.mp4",
    focus: "50% 62%",
    plate: "lg:col-span-7 lg:col-start-6",
    aspect: "lg:aspect-[16/10]",
  },
  {
    num: "02",
    key: "artwork",
    path: "/artwork",
    // (the lab's own plates are already upright)
    wide: "/lab/claro.webp",
    tall: "/lab/claro.webp",
    plate: "lg:col-span-4 lg:col-start-8",
    aspect: "lg:aspect-[4/5]",
  },
  {
    num: "03",
    key: "studio",
    path: "/about",
    wide: "/posters/stationery-wide.webp",
    tall: "/posters/stationery-tall.webp",
    plate: "lg:col-span-6 lg:col-start-7",
    aspect: "lg:aspect-[16/10]",
  },
];

// The pictures meet the pale wall softly: a little less colour and a touch firmer, never the file's full punch
const GRADE = "saturate(0.86) contrast(1.04) brightness(0.97)";

/** The hero's own way in, the word and its hairline, opening a little on hover */
const Way: React.FC<{ label: string }> = ({ label }) => (
  <span className={`${ACTION} inline-flex items-center gap-4 text-silver`}>
    <span className="transition-[letter-spacing] duration-700 ease-haus group-hover:tracking-[0.12em] group-focus-visible:tracking-[0.12em]">
      {label}
    </span>
    <span aria-hidden className="relative block h-px w-12 lg:w-16">
      <span className="absolute inset-y-0 left-0 w-full origin-left bg-current opacity-60 transition-all duration-700 ease-haus group-hover:scale-x-[1.3] group-hover:opacity-100 group-focus-visible:scale-x-[1.3]" />
    </span>
  </span>
);

/**
 * A film over the plate's picture, wide screens only (phones keep the still, and their data): fetched only
 * once the plate is near, playing while it is in view, resting when it leaves. It shows only once it plays,
 * so the picture under it is all that is seen until then.
 */
const Film: React.FC<{ src: string; poster: string; focus?: string }> = ({ src, poster, focus }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [wanted, setWanted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const still = useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v || still || !window.matchMedia("(min-width: 640px)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setWanted(e.isIntersecting || v.currentSrc !== "");
        if (e.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [still]);
  // (once its source is set, the film starts as soon as it can: play() before that found nothing to play)
  useEffect(() => {
    if (wanted) void ref.current?.play().catch(() => {});
  }, [wanted]);
  return (
    <video
      ref={ref}
      src={wanted ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      onPlaying={() => setPlaying(true)}
      className={`absolute inset-0 hidden h-full w-full object-cover transition-[opacity,transform] duration-[1800ms] ease-haus group-hover:scale-[1.035] group-focus-visible:scale-[1.035] sm:block ${playing ? "opacity-100" : "opacity-0"}`}
      style={{ objectPosition: focus ?? "50% 50%", filter: GRADE }}
    />
  );
};

const RoomPlate: React.FC<{ room: Room }> = ({ room }) => {
  const { t } = useI18n();
  const still = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  // the picture drifts a touch slower than the wall as it passes, so it reads as hung a little apart from it
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], still ? ["0%", "0%"] : ["-5%", "5%"]);
  const label = t(`section.${room.key}` as Key);

  return (
    <Link
      ref={ref}
      to={room.path}
      aria-label={`${label} — ${t(`section.${room.key}.caption` as Key)}`}
      className="group relative grid grid-cols-1 gap-6 outline-none sm:gap-8 lg:grid-cols-12 lg:items-end lg:gap-5"
    >
      {/* The plate: drawn up out of its lower edge as it comes into view, the picture settling from a
          touch closer; on hover it comes slowly nearer, and the light on it lifts */}
      <motion.div
        className={`relative aspect-[4/5] overflow-hidden rounded-[2px] shadow-[0_40px_80px_-40px_rgba(40,32,38,0.55)] sm:aspect-[16/10] ${room.aspect} ${room.plate} lg:row-start-1`}
        initial={still ? false : { clipPath: "inset(100% 0% 0% 0%)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        transition={{ duration: 1.6, ease: EASE_HAUS }}
      >
        <motion.div className="absolute inset-x-0 -inset-y-[6%]" style={{ y: drift }}>
          <motion.div
            className="relative h-full w-full"
            initial={still ? false : { scale: 1.12 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -12% 0px" }}
            transition={{ duration: 2.4, ease: EASE_HAUS }}
          >
            <picture>
              <source media="(max-width: 639px)" srcSet={room.tall} />
              <img
                src={room.wide}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-[1800ms] ease-haus group-hover:scale-[1.035] group-focus-visible:scale-[1.035]"
                style={{ objectPosition: room.focus ?? "50% 50%", filter: GRADE }}
              />
            </picture>
            {room.film && <Film src={room.film} poster={room.wide} focus={room.focus} />}
          </motion.div>
        </motion.div>
        {/* the room's light over the picture: a faint veil from the upper left that thins on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-haus group-hover:opacity-40"
          style={{ background: "linear-gradient(160deg, rgba(97,83,96,0.22) 0%, rgba(97,83,96,0.06) 45%, transparent 70%)" }}
        />
        {/* a hairline of light round the edge, so the plate is held without a frame */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[2px] ring-1 ring-inset ring-white/10" />
      </motion.div>

      {/* The words: low on the left, as the manifesto sits on the landing */}
      <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:pb-2">
        <Reveal as="div" className={`${SMALL} mb-3 text-white/60 lg:mb-5`}>
          {room.num}
        </Reveal>
        <RevealWords as="h2" text={label} className="block font-geo text-[2.4rem] font-normal lowercase leading-[1.04] tracking-[0.01em] text-white sm:text-[2.8rem] lg:text-[3.2rem]" />
        <Reveal as="p" delay={0.15} className="mt-3 max-w-xs font-geo text-[15px] font-normal tracking-[0.02em] text-white/65 lg:mt-4 lg:text-[17px]">
          {t(`section.${room.key}.caption` as Key)}
        </Reveal>
        <Reveal delay={0.3} className="mt-7 lg:mt-10">
          <Way label={t("home.enter")} />
        </Reveal>
      </div>
    </Link>
  );
};

export const HomeRooms: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="relative text-silver">
      {/* Phones: the same soft shade the hero gathers under its type, kept down the left edge, so the
          silver stays legible wherever the light falls */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{ background: "linear-gradient(90deg, rgba(78,66,76,0.28) 0%, rgba(78,66,76,0.1) 55%, transparent 85%)" }}
      />

      <nav aria-label="Sections" className="relative flex flex-col gap-[22vh] px-4 pb-[18vh] pt-[16vh] sm:px-6 lg:gap-[28vh] lg:px-8 lg:pt-[22vh]">
        {ROOMS.map((room) => (
          <RoomPlate key={room.key} room={room} />
        ))}
      </nav>

      {/* The foot: the contact, closing the walk on one line to write to the studio */}
      <section className="relative flex min-h-[86svh] flex-col justify-end px-4 pb-5 sm:px-6 sm:pb-8 lg:px-8">
        <Reveal as="div" className={`${SMALL} mb-5 text-white/60`}>
          04 <span aria-hidden className="px-1 opacity-60">—</span> {t("section.contact")}
        </Reveal>
        <Link to="/about#contact" className="group block w-fit outline-none">
          <RevealWords as="h2" text={t("footer.together")} className={`${DISPLAY} block !font-normal lowercase text-white`} />
          <Reveal delay={0.35} className="mt-10 lg:mt-14">
            <Way label={t("section.contact.caption")} />
          </Reveal>
        </Link>

        {/* the landing's own foot line, under a hairline */}
        <Reveal
          delay={0.2}
          className={`${SMALL} mt-[16vh] flex flex-col gap-3 border-t border-white/15 pt-5 text-graphite sm:flex-row sm:items-center sm:justify-between`}
        >
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <ContactMenu />
            <span aria-hidden className="hidden sm:inline">·</span>
            <Link to="/about#contact" className="hidden transition-colors duration-300 hover:text-ink sm:inline">
              {t("availability")} — {new Date().getFullYear()}
            </Link>
          </span>
          <span className="flex items-center gap-3">
            <SocialLinks className="hover:text-ink" />
            <span aria-hidden>·</span>
            <Link to="/privacy" className="transition-colors duration-300 hover:text-ink">
              {t("privacy")}
            </Link>
          </span>
        </Reveal>
      </section>
    </div>
  );
};
