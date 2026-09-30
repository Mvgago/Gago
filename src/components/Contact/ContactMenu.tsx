import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_HAUS } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";

export const EMAIL = "mvgago26@gmail.com";

const enc = encodeURIComponent;
// The subject line follows the visitor's language.
const options = (subject: string, mailApp: string) => [
  {
    label: "gmail",
    href: `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${enc(subject)}`,
    external: true,
  },
  {
    label: "outlook",
    href: `https://outlook.live.com/mail/0/deeplink/compose?to=${EMAIL}&subject=${enc(subject)}`,
    external: true,
  },
  { label: mailApp, href: `mailto:${EMAIL}?subject=${enc(subject)}`, external: false },
];

/** Menu label: a hairline marker grows in on hover and the text catches the glint. */
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="flex items-center">
    <span className="mr-0 h-px w-0 bg-ink transition-all duration-500 ease-haus group-hover/item:mr-2 group-hover/item:w-3 group-focus-visible/item:mr-2 group-focus-visible/item:w-3" />
    <span className="glint">{children}</span>
  </span>
);

/**
 * The email address as a button: clicking opens a small menu to compose in
 * Gmail, Outlook or the default mail app, or to copy the address — so it
 * works even when no desktop mail client is set up.
 */
export const ContactMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>();
  const { t } = useI18n();

  // Hover intent: open after a short pause, close with enough grace to reach the menu.
  // Mouse only — touch and keyboard use the click toggle.
  const schedule = (next: boolean, delay: number) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); fall back to a selection copy.
      const input = document.createElement("input");
      input.value = EMAIL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1400);
  };

  // Rows: graphite at rest. On hover a hairline marker grows in, the label steps right
  // and catches the same travelling glint as the address, and an arrow slides in.
  const item =
    "group/item flex w-full items-center justify-between gap-8 px-4 py-2 text-left text-ink/85 outline-none";
  const on = "group-hover/item:opacity-100 group-focus-visible/item:opacity-100";
  const arrow = `-translate-x-1 opacity-0 transition-[opacity,transform] duration-500 ease-haus group-hover/item:translate-x-0 group-focus-visible/item:translate-x-0 ${on}`;

  return (
    <span
      ref={root}
      className="relative inline-flex"
      onPointerEnter={schedule(true, 150)}
      onPointerLeave={schedule(false, 300)}
    >
      <button
        type="button"
        onClick={(e) => {
          // A mouse click after hover-open shouldn't immediately close it.
          if ((e.nativeEvent as PointerEvent).pointerType === "mouse") return setOpen(true);
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className="group relative inline-flex items-center gap-1.5 lowercase text-graphite"
      >
        {/* A band of light keeps travelling through the letters while hovered or open */}
        <span className={`glint ${open ? "is-lit" : ""}`}>{EMAIL}</span>
        <span
          aria-hidden
          className={`transition-[opacity,transform] duration-700 ease-haus group-hover:translate-x-0 group-hover:opacity-100 ${
            open ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
          }`}
        >
          ↗
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.45, ease: EASE_HAUS }}
            // pb-4 is an invisible bridge so the cursor can travel up without leaving the hover area
            className="absolute bottom-full left-0 z-20 pb-3 sm:left-auto sm:right-0"
          >
            {/* Light, translucent sheet with a hairline edge — no heavy card */}
            <div className="w-max min-w-[12.5rem] rounded-lg border border-ink/15 bg-[#f8f6f4]/[0.97] py-2.5 text-[12px] shadow-[0_24px_60px_-18px_rgba(40,32,36,0.4)] backdrop-blur-md">
              <p className="px-4 pb-1.5 text-[10px] tracking-[0.18em] text-graphite/70">{t("contact.via")}</p>
              {options(t("contact.subject"), t("contact.mailApp")).map((o) => (
                <a
                  key={o.label}
                  role="menuitem"
                  href={o.href}
                  target={o.external ? "_blank" : undefined}
                  rel={o.external ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  className={item}
                >
                  <Label>{o.label}</Label>
                  <span aria-hidden className={arrow}>
                    →
                  </span>
                </a>
              ))}
              <div className="mx-4 my-1.5 h-px bg-ink/12" />
              <button type="button" role="menuitem" onClick={copy} className={item}>
                {copied ? <span className="text-ink">✓ {t("contact.copied")}</span> : <Label>{t("contact.copy")}</Label>}
                {!copied && (
                  <span aria-hidden className={arrow}>
                    →
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
