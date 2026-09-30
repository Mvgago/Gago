import type { Lang } from "./strings";

/**
 * The privacy notice in the four site languages. `{email}` is replaced with
 * the contact address. When the studio is registered, add the owner's name,
 * tax ID and city to the first section.
 */

export type PrivacySection = { title: string; body: string[] };
export type Privacy = { title: string; updated: string; intro: string; sections: PrivacySection[] };

const UPDATED = "2026-09";

export const PRIVACY: Record<Lang, Privacy> = {
  en: {
    title: "Privacy",
    updated: `Last updated ${UPDATED}`,
    intro: "This website is a portfolio. It does not use cookies, analytics or advertising, and it does not track you.",
    sections: [
      {
        title: "Who is responsible",
        body: ["Fuga Haus. For anything related to your data, write to {email}."],
      },
      {
        title: "What data is processed",
        body: [
          "If you write to the studio by email: your address, your name if you include it, and whatever your message contains.",
          "When you visit the site, the hosting provider keeps standard technical logs (such as IP address and browser type) to serve pages and keep them secure. The studio does not use these logs to identify you.",
          "Your language choice is remembered in your own browser (local storage). It never leaves your device.",
        ],
      },
      {
        title: "Why",
        body: [
          "Only to answer your message and, if you ask for it, to prepare a proposal or carry out a project. The basis is your own request and the steps prior to a possible contract.",
        ],
      },
      {
        title: "How long",
        body: [
          "Messages are kept while the conversation or project is ongoing, and afterwards only as long as required by law. You can ask for them to be deleted at any time.",
        ],
      },
      {
        title: "Who else sees it",
        body: [
          "Nobody. Your data is not sold or shared. Email is handled by the studio's mail provider; if it stores data outside the EU, it does so under the European Commission's standard contractual clauses.",
          "The fonts are served from this site itself, so no request is made to third-party font services.",
        ],
      },
      {
        title: "Your rights",
        body: [
          "You can ask to access, correct or delete your data, to restrict or object to its use, or to receive a copy, by writing to {email}.",
          "If you believe your data has not been handled properly, you can complain to a data protection authority; in Spain, the Agencia Española de Protección de Datos (aepd.es).",
        ],
      },
    ],
  },

  es: {
    title: "Privacidad",
    updated: `Última actualización ${UPDATED}`,
    intro: "Esta web es un portfolio. No usa cookies, analítica ni publicidad, y no te rastrea.",
    sections: [
      {
        title: "Responsable",
        body: ["Fuga Haus. Para cualquier cuestión sobre tus datos, escribe a {email}."],
      },
      {
        title: "Qué datos se tratan",
        body: [
          "Si escribes al estudio por email: tu dirección, tu nombre si lo incluyes y lo que contenga tu mensaje.",
          "Al visitar la web, el proveedor de alojamiento guarda registros técnicos habituales (como la IP y el tipo de navegador) para servir las páginas y mantenerlas seguras. El estudio no usa esos registros para identificarte.",
          "El idioma que eliges se recuerda en tu propio navegador (almacenamiento local). Nunca sale de tu dispositivo.",
        ],
      },
      {
        title: "Para qué",
        body: [
          "Solo para responder a tu mensaje y, si lo pides, preparar un presupuesto o realizar un proyecto. La base es tu propia solicitud y la aplicación de medidas precontractuales.",
        ],
      },
      {
        title: "Durante cuánto tiempo",
        body: [
          "Los mensajes se conservan mientras dure la conversación o el proyecto, y después solo el tiempo que exija la ley. Puedes pedir que se borren en cualquier momento.",
        ],
      },
      {
        title: "Quién más los ve",
        body: [
          "Nadie. Tus datos no se venden ni se ceden. El correo se gestiona con el proveedor de email del estudio; si almacena datos fuera de la UE, lo hace bajo las cláusulas contractuales tipo de la Comisión Europea.",
          "Las fuentes tipográficas se sirven desde esta misma web, sin peticiones a servicios de terceros.",
        ],
      },
      {
        title: "Tus derechos",
        body: [
          "Puedes pedir acceder a tus datos, rectificarlos o suprimirlos, limitar u oponerte a su uso, o recibir una copia, escribiendo a {email}.",
          "Si crees que tus datos no se han tratado correctamente, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).",
        ],
      },
    ],
  },

  fr: {
    title: "Confidentialité",
    updated: `Dernière mise à jour ${UPDATED}`,
    intro: "Ce site est un portfolio. Il n'utilise ni cookies, ni outils de mesure d'audience, ni publicité, et ne vous suit pas.",
    sections: [
      {
        title: "Responsable",
        body: ["Fuga Haus. Pour toute question concernant vos données, écrivez à {email}."],
      },
      {
        title: "Données traitées",
        body: [
          "Si vous écrivez au studio par e-mail : votre adresse, votre nom si vous l'indiquez, et le contenu de votre message.",
          "Lors de votre visite, l'hébergeur conserve des journaux techniques courants (adresse IP, type de navigateur) pour afficher les pages et assurer leur sécurité. Le studio ne les utilise pas pour vous identifier.",
          "La langue choisie est mémorisée dans votre propre navigateur (stockage local). Elle ne quitte jamais votre appareil.",
        ],
      },
      {
        title: "Finalité",
        body: [
          "Uniquement répondre à votre message et, à votre demande, établir un devis ou réaliser un projet. La base est votre propre demande et les mesures précontractuelles.",
        ],
      },
      {
        title: "Durée de conservation",
        body: [
          "Les messages sont conservés pendant l'échange ou le projet, puis seulement le temps exigé par la loi. Vous pouvez demander leur suppression à tout moment.",
        ],
      },
      {
        title: "Destinataires",
        body: [
          "Personne. Vos données ne sont ni vendues ni cédées. La messagerie est gérée par le fournisseur e-mail du studio ; s'il stocke des données hors de l'UE, c'est dans le cadre des clauses contractuelles types de la Commission européenne.",
          "Les polices sont servies depuis ce site, sans requête vers des services tiers.",
        ],
      },
      {
        title: "Vos droits",
        body: [
          "Vous pouvez demander l'accès, la rectification ou l'effacement de vos données, la limitation ou l'opposition à leur traitement, ou en recevoir une copie, en écrivant à {email}.",
          "Si vous estimez que vos données n'ont pas été traitées correctement, vous pouvez saisir une autorité de protection des données (en France, la CNIL ; en Espagne, l'AEPD).",
        ],
      },
    ],
  },

  de: {
    title: "Datenschutz",
    updated: `Zuletzt aktualisiert ${UPDATED}`,
    intro: "Diese Website ist ein Portfolio. Sie verwendet keine Cookies, keine Analyse- oder Werbedienste und verfolgt Sie nicht.",
    sections: [
      {
        title: "Verantwortlich",
        body: ["Fuga Haus. Bei Fragen zu Ihren Daten schreiben Sie an {email}."],
      },
      {
        title: "Welche Daten verarbeitet werden",
        body: [
          "Wenn Sie dem Studio eine E-Mail schreiben: Ihre Adresse, Ihr Name, falls angegeben, und der Inhalt Ihrer Nachricht.",
          "Beim Besuch der Website speichert der Hosting-Anbieter übliche technische Protokolle (etwa IP-Adresse und Browsertyp), um die Seiten auszuliefern und abzusichern. Das Studio nutzt diese Protokolle nicht, um Sie zu identifizieren.",
          "Ihre Sprachwahl wird in Ihrem eigenen Browser gespeichert (Local Storage). Sie verlässt Ihr Gerät nie.",
        ],
      },
      {
        title: "Zweck",
        body: [
          "Ausschliesslich, um Ihre Nachricht zu beantworten und auf Ihren Wunsch ein Angebot zu erstellen oder ein Projekt umzusetzen. Rechtsgrundlage ist Ihre Anfrage bzw. vorvertragliche Massnahmen.",
        ],
      },
      {
        title: "Speicherdauer",
        body: [
          "Nachrichten werden für die Dauer des Austauschs oder Projekts aufbewahrt und danach nur so lange, wie gesetzlich vorgeschrieben. Sie können jederzeit die Löschung verlangen.",
        ],
      },
      {
        title: "Empfänger",
        body: [
          "Niemand. Ihre Daten werden weder verkauft noch weitergegeben. E-Mails werden über den E-Mail-Anbieter des Studios verwaltet; speichert er Daten ausserhalb der EU, geschieht dies auf Grundlage der Standardvertragsklauseln der EU-Kommission.",
          "Die Schriften werden von dieser Website selbst geladen, ohne Anfragen an Drittanbieter.",
        ],
      },
      {
        title: "Ihre Rechte",
        body: [
          "Sie können Auskunft, Berichtigung oder Löschung Ihrer Daten, die Einschränkung der Verarbeitung, Widerspruch oder eine Kopie verlangen, per E-Mail an {email}.",
          "Wenn Sie meinen, dass Ihre Daten nicht korrekt behandelt wurden, können Sie sich bei einer Datenschutzaufsichtsbehörde beschweren (in Spanien: AEPD, aepd.es).",
        ],
      },
    ],
  },
};
