export type Role = "OWNER" | "TECH";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  phone: string | null;
  color: string | null;
  created_at: string;
}

export type LeadStatus = "NEW" | "CONTACTED" | "SCHEDULED" | "WON" | "LOST";
export type LeadSource = "phone" | "text" | "referral" | "web" | "walk-in" | "other";

export interface LeadRow {
  id: number;
  customer_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  issue_description: string | null;
  source: LeadSource;
  status: LeadStatus;
  assigned_to: number | null;
  assigned_to_name?: string | null;
  created_by: number | null;
  created_by_name?: string | null;
  customer_id: number | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallLogRow {
  id: number;
  lead_id: number | null;
  customer_id: number | null;
  caller_number: string | null;
  caller_name: string | null;
  direction: "inbound" | "outbound" | "missed";
  duration_seconds: number;
  notes: string | null;
  recording_url: string | null;
  transcript: string | null;
  taken_by: number | null;
  taken_by_name?: string | null;
  source: string;
  created_at: string;
}

export interface CustomerRow {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  on_maintenance_plan: number;
  qbo_customer_id: string | null;
  created_at: string;
}

export type JobStatus =
  | "UNSCHEDULED"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "INVOICED"
  | "CANCELLED";

export interface JobRow {
  id: number;
  customer_id: number;
  customer_name?: string;
  property_id: number | null;
  lead_id: number | null;
  title: string;
  description: string | null;
  job_type: "service" | "install" | "maintenance" | "estimate" | "other";
  status: JobStatus;
  priority: "normal" | "urgent" | "emergency";
  address: string | null;
  scheduled_at: string | null;
  assigned_to: number | null;
  assigned_to_name?: string | null;
  created_by: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobNoteRow {
  id: number;
  job_id: number;
  user_id: number | null;
  user_name?: string | null;
  note: string;
  photo_url: string | null;
  created_at: string;
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "VOID";
export type QboSyncStatus = "NOT_SYNCED" | "SYNCING" | "SYNCED" | "FAILED";

export interface InvoiceRow {
  id: number;
  invoice_number: string;
  job_id: number | null;
  customer_id: number;
  customer_name?: string;
  status: InvoiceStatus;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  qbo_invoice_id: string | null;
  qbo_sync_status: QboSyncStatus;
  qbo_sync_error: string | null;
  qbo_synced_at: string | null;
  qbo_sync_attempts: number;
  created_at: string;
}

export interface InvoiceLineItemRow {
  id: number;
  invoice_id: number;
  service: string | null;
  description: string;
  quantity: number;
  unit_price_cents: number;
  amount_cents: number;
  sort_order: number;
}

export interface MaintenancePlanRow {
  id: number;
  customer_id: number;
  customer_name?: string;
  customer_phone?: string | null;
  plan_name: string;
  monthly_price_cents: number;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  visits_per_year: number;
  last_visit_at: string | null;
  next_visit_due: string | null;
  started_at: string;
  created_at: string;
}

export interface ActivityRow {
  id: number;
  user_id: number | null;
  user_name?: string | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  created_at: string;
}
