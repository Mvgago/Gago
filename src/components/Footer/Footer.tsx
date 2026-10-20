import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18n";
import { ContactMenu } from "../Contact/ContactMenu";
import { SMALL } from "../Light/LightWall";
import { hasLegal } from "../../outils/legal";

const LEGAL = { es: "aviso legal", en: "legal notice", fr: "mentions légales", de: "impressum" };

/**
 * The inner pages' footer: one quiet line under a hairline — the rooms, the
 * studio's availability and address, and the small print. No large call to
 * action: each page already ends on its own.
 *
 * `dark`: drawn inside a dark closing block (the info page), with no outer
 * margin; its middle carries the studio's signature instead of the contact,
 * which the block above already holds.
 */
const Footer: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();
  const link = `transition-colors duration-500 ${dark ? "hover:text-platinum" : "hover:text-ink"}`;
  return (
    <footer className={dark ? "relative" : "relative z-10 mt-24 px-4 pb-10 sm:px-6 md:px-8"}>
      <div
        // phones: two short lines on one left edge, the rooms above and the email with the small
        // print below; wider screens: three parts across one line
        className={`${SMALL} flex flex-col gap-3 border-t pt-6 sm:grid sm:grid-cols-3 sm:items-center sm:gap-5 ${
          dark ? "border-platinum/10 text-platinum/55" : "border-ink/10 text-graphite"
        }`}
      >
        <nav className="flex gap-6">
          <Link to="/projects" className={link}>{t("section.projects")}</Link>
          <Link to="/artwork" className={link}>{t("section.artwork")}</Link>
          <Link to="/about" className={link}>{t("section.studio")}</Link>
        </nav>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:contents">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-center">
          {dark ? (
            "designing atmospheres."
          ) : (
            <>
              <span className="hidden sm:inline">{t("availability")}</span>
              <span aria-hidden className="hidden sm:inline">·</span>
              <ContactMenu />
            </>
          )}
        </span>
        <span className="sm:text-right">
          <span aria-hidden className="sm:hidden">· </span>
          <span className="hidden sm:inline">fuga haus © {year} · </span>
          <Link to="/privacy" className={link}>{t("privacy")}</Link>
          {/* the legal notice, once the owner's details are in */}
          {hasLegal() && (
            <>
              {" · "}
              <Link to="/legal" className={link}>{LEGAL[lang as keyof typeof LEGAL] ?? LEGAL.es}</Link>
            </>
          )}
        </span>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
