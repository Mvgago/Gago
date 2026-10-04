import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/I18n";
import { ContactMenu } from "../Contact/ContactMenu";
import { SMALL } from "../Light/LightWall";

/**
 * The inner pages' footer: one quiet line under a hairline — the rooms, the
 * studio's availability and address, and the small print. No large call to
 * action: each page already ends on its own.
 */
const Footer: React.FC = () => {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 mt-24 px-4 pb-10 sm:px-6 md:px-8">
      <div
        className={`${SMALL} grid gap-5 border-t border-ink/10 pt-6 text-graphite sm:grid-cols-3 sm:items-center`}
      >
        <nav className="flex gap-6">
          <Link to="/projects" className="transition-colors duration-500 hover:text-ink">{t("section.projects")}</Link>
          <Link to="/artwork" className="transition-colors duration-500 hover:text-ink">{t("section.artwork")}</Link>
          <Link to="/about" className="transition-colors duration-500 hover:text-ink">{t("section.studio")}</Link>
        </nav>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-center">
          {t("availability")}
          <span aria-hidden>·</span>
          <ContactMenu />
        </span>
        <span className="sm:text-right">
          fuga haus © {year} ·{" "}
          <Link to="/privacy" className="transition-colors duration-500 hover:text-ink">{t("privacy")}</Link>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
