/**
 * The site's owner, as Spanish law (LSSI, art. 10) asks a site with an economic activity to state.
 * Fill these in once registered as self-employed (autónomo) or as a company. Until `taxId` is set,
 * the legal notice is kept off the footer, and its page says the details are on their way.
 */
export const HOLDER = {
  /** Full legal name, or the company's registered name */
  name: "",
  /** NIF / NIE, or the company's CIF */
  taxId: "",
  /** Postal address */
  address: "",
  /** Only for a company: register, volume, sheet… (leave empty if self-employed) */
  registry: "",
};

export const hasLegal = () => HOLDER.taxId.trim().length > 0;
