import React from "react";
import { INSTAGRAM } from "./ContactMenu";

/**
 * The studio's social profiles as hairline glyphs, drawn in the text colour
 * with the same thin stroke as the mono type, so they read as part of the line.
 *
 * A profile with an empty URL is not shown: fill in LINKEDIN once the
 * profile exists and its icon appears next to Instagram.
 */
export const LINKEDIN = "";

type Profile = { href: string; label: string; icon: React.ReactNode };

const PROFILES: Profile[] = [
  {
    href: INSTAGRAM,
    label: "Instagram — @fugahaus",
    icon: (
      <>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.4" />
        <circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    href: LINKEDIN,
    label: "LinkedIn — Fuga Haus",
    icon: (
      <>
        <rect x="2.5" y="2.5" width="19" height="19" rx="3" />
        <path d="M7.5 10.5v6M7.5 7.4v.2M11.5 16.5v-6M11.5 13.2c0-1.6 1-2.7 2.5-2.7s2.5 1 2.5 2.7v3.3" strokeLinecap="round" />
      </>
    ),
  },
].filter((p) => p.href);

export const SocialLinks: React.FC<{ className?: string }> = ({ className = "" }) => (
  <span className="inline-flex items-center gap-3">
    {PROFILES.map((p) => (
      <a
        key={p.label}
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={p.label}
        title={p.label}
        className={`inline-flex items-center transition-colors duration-500 ${className}`}
      >
        <svg aria-hidden width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          {p.icon}
        </svg>
      </a>
    ))}
  </span>
);
