export const MODULE_DESCRIPTIONS: Record<string, string> = {
  INVENTORY: 'Manage inventory, stock allocation, and material movements across assigned projects.',
  SALES: 'Manage sales pipeline, bookings, and customer acquisition activities.',
  CRM: 'Manage customer relationships, interactions, and follow-ups.',
  REPORTS: 'View operational reports and analytics for assigned projects.',
  EOI: 'Manage expressions of interest, registrations, and enquiry follow-ups.',
  BATCH: 'Manage project batches, release schedules, and allotments.',
  ESIGNATURE: 'Manage e-signature workflows and document approvals.',
  INCENTIVE: 'Manage incentive structures, claims, and payouts.',
  BRANDS: 'Manage brand entities and associated project branding.',
};

export const SUBMODULE_DESCRIPTIONS: Record<string, string> = {
  'Inventory List': 'View inventory records across assigned projects.',
  'Stock Transfer': 'Transfer stock between project sites.',
  'Material Request': 'Raise and track material requests.',
  Reports: 'View operational reports and analytics.',
  'Booking Form': 'Process booking forms and registrations.',
  'Sales Pipeline': 'Track opportunities through the sales pipeline.',
  'Customer List': 'View customer records and contact details.',
  'Enquiry Follow-up': 'Track and close enquiry follow-ups.',
  'EOI Registration': 'Register and manage expressions of interest.',
  'Batch Master': 'Manage project batches and release schedules.',
  'Document Signing': 'Send documents for digital signature.',
  'Incentive Claim': 'Submit and track incentive claims.',
};

export function moduleDescription(name: string, code?: string | null): string {
  const key = (code ?? name).toUpperCase().replace(/\s+/g, '_');
  return MODULE_DESCRIPTIONS[key] ?? `${name} — manage operations and records for your assigned projects.`;
}

export function submoduleDescription(name: string): string {
  return SUBMODULE_DESCRIPTIONS[name] ?? `Manage ${name.toLowerCase()} records for your assigned projects.`;
}
