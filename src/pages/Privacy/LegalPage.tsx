import React from "react";
import { motion } from "framer-motion";
import { rise } from "../../lib/motion";
import { useI18n } from "../../i18n/I18n";
import { EMAIL } from "../../components/Contact/ContactMenu";
import { BODY, SMALL, TITLE } from "../../lib/type";
import { HOLDER } from "../../outils/legal";

/** The legal notice: who is behind the site (LSSI), set as the privacy page is. */
const COPY = {
  es: {
    title: "Aviso legal",
    holder: "Titular",
    rows: ["Nombre", "NIF", "Dirección", "Registro", "Contacto"],
    use: "Uso de la web",
    useText:
      "Los contenidos de esta web (textos, imágenes, vídeos, escenas 3D y diseño) pertenecen a Fuga Haus o a sus clientes, y no pueden copiarse, reproducirse ni usarse sin permiso por escrito.",
  },
  en: {
    title: "Legal notice",
    holder: "Owner",
    rows: ["Name", "Tax ID", "Address", "Registry", "Contact"],
    use: "Use of the site",
    useText:
      "The contents of this site (texts, images, films, 3D scenes and design) belong to Fuga Haus or its clients, and may not be copied, reproduced or used without written permission.",
  },
  fr: {
    title: "Mentions légales",
    holder: "Titulaire",
    rows: ["Nom", "N° fiscal", "Adresse", "Registre", "Contact"],
    use: "Utilisation du site",
    useText:
      "Les contenus de ce site (textes, images, films, scènes 3D et design) appartiennent à Fuga Haus ou à ses clients, et ne peuvent être copiés, reproduits ni utilisés sans autorisation écrite.",
  },
  de: {
    title: "Impressum",
    holder: "Inhaber",
    rows: ["Name", "Steuernummer", "Adresse", "Register", "Kontakt"],
    use: "Nutzung der Website",
    useText:
      "Die Inhalte dieser Website (Texte, Bilder, Filme, 3D-Szenen und Design) gehören Fuga Haus oder seinen Kunden und dürfen ohne schriftliche Erlaubnis nicht kopiert, vervielfältigt oder verwendet werden.",
  },
} as const;

export const LegalPage: React.FC = () => {
  const { lang } = useI18n();
  const c = COPY[lang as keyof typeof COPY] ?? COPY.es;
  const values = [HOLDER.name, HOLDER.taxId, HOLDER.address, HOLDER.registry, EMAIL];

  return (
    <main className="px-4 pt-24 sm:px-6 md:px-8 md:pt-28">
      <motion.div variants={rise} initial="hidden" animate="shown" custom={1} className="grid grid-cols-12 gap-x-6">
        <div className="col-span-12 max-w-2xl md:col-span-8 md:col-start-5">
          <h1 className={`${TITLE} text-ink`}>{c.title}</h1>
          <section className="mt-14 border-t border-ink/15 pt-6">
            <h2 className={`${SMALL} text-graphite`}>{c.holder}</h2>
            <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-y-3">
              {c.rows.map((label, i) =>
                values[i] ? (
                  <React.Fragment key={label}>
                    <dt className={`${SMALL} text-graphite`}>{label}</dt>
                    <dd className={`${BODY} text-ink`}>{values[i]}</dd>
                  </React.Fragment>
                ) : null,
              )}
            </dl>
          </section>
          <section className="mt-10 border-t border-ink/15 pt-6">
            <h2 className={`${SMALL} text-graphite`}>{c.use}</h2>
            <p className={`${BODY} mt-4 text-graphite`}>{c.useText}</p>
          </section>
        </div>
      </motion.div>
    </main>
  );
};
