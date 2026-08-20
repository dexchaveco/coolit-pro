// Starter "scope of work" templates for line items where a full written scope matters —
// big install jobs, mainly — so the tech isn't retyping (or voice-dictating) the same
// warranty/permit/exclusions language from scratch on every invoice, and every customer
// gets the same clean, professional structure instead of an ad-hoc paragraph.
//
// These are drafts based on the best-structured invoices already in your QuickBooks
// (the ones that already had Scope / Includes / Permits / Warranty / Exclusions sections).
// Edit freely — swap in your own standard language, add/remove services, whatever matches
// how you actually want these to read.

const INSTALL_TEMPLATE = (label: string) => `Scope of Work
Supply and install ${label}, including removal and disposal of existing equipment where applicable.

Installation includes:
- Connection to existing electrical service, refrigerant lines, drain line, and ductwork where compatible
- Vacuum and dehydrate refrigerant lines prior to startup to remove air and moisture
- Refrigerant charge verification and adjustment per manufacturer specifications
- Complete system startup, testing, and verification of cooling operation, drainage, controls, and overall performance
- Removal and disposal of installation-related debris and old equipment

Permits: Included in this scope of work.

Warranty:
- Manufacturer parts warranty: per manufacturer registration and terms
- Labor warranty: 1 year, provided by Cool It With Rick LLC

Exclusions:
Any required structural modifications, electrical service upgrades, drywall/ceiling repair or painting, roofing work, or other work outside the HVAC scope above is not included unless specifically stated in the proposal.`;

const DUCTWORK_TEMPLATE = `Scope of Work
Supply and install new supply and return ductwork as specified.

Installation includes:
- Manual volume dampers for balancing
- Extend/insulate copper refrigerant piping with Armaflex where applicable
- Seal all joints with mastic (high-velocity duct sealant)
- Clean, reinstall, start up, and test affected equipment

Permits: Included in this scope of work.

Warranty: 1 year on parts & labor, provided by Cool It With Rick LLC.

Exclusions:
Control wiring, drains, concrete cutting, and test & balance (if required) are by others unless specifically stated in the proposal.`;

export const SCOPE_TEMPLATES: Record<string, string> = {
  "Supply & Install — Split System": INSTALL_TEMPLATE("[X-ton] [brand] split system"),
  "Supply & Install — Package Unit": INSTALL_TEMPLATE("[X-ton] [brand] package unit"),
  "Supply & Install — Mini Split": INSTALL_TEMPLATE("[X-ton] [brand] mini split system"),
  "Supply & Install — Heat Pump": INSTALL_TEMPLATE("[X-ton] [brand] heat pump system"),
  "Duct Work — Install / Repair": DUCTWORK_TEMPLATE,
};

export function hasScopeTemplate(service: string): boolean {
  return service in SCOPE_TEMPLATES;
}

export function getScopeTemplate(service: string): string {
  return SCOPE_TEMPLATES[service] ?? "";
}
