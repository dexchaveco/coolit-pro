// The fixed list of services Coolit Pro lets you bill for. This exists to
// solve a specific problem: QuickBooks' Products/Services list ballooned to
// 130+ items because every invoice created a brand new product ("Supply and
// install a 4 ton Rheem 15.2 SEER", "Supply & install 3.5 ton Ruud", etc.)
// instead of reusing one. Tonnage, brand, and model belong in the invoice
// line's "scope of work" text, never in the product name.
//
// This list is a first draft based on the real patterns in the current QBO
// catalog — review it and edit freely. Once QuickBooks sync is wired up,
// each entry here should map to exactly one QuickBooks product/service, so
// keep this list and the cleaned-up QBO list in sync with each other.

export const SERVICES = [
  "Supply & Install — Split System",
  "Supply & Install — Package Unit",
  "Supply & Install — Mini Split",
  "Supply & Install — Heat Pump",
  "Diagnostic / Service Call",
  "Repair — Electrical",
  "Repair — Refrigerant / Coil",
  "Repair — General",
  "Preventative Maintenance",
  "Maintenance Plan Visit",
  "Coil Cleaning",
  "Duct Work — Install / Repair",
  "Duct Cleaning & Sanitation",
  "UV Light Install",
  "Filter / Capacitor / Parts Replacement",
  "Refrigerant Charge",
  "Drain Line Service",
  "Attic / Home Insulation",
  "Permit / Inspection Fee",
  "Other",
] as const;

export type ServiceName = (typeof SERVICES)[number];
