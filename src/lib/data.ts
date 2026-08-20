import { all, one } from "./db";
import type {
  ActivityRow,
  CallLogRow,
  CustomerRow,
  InvoiceLineItemRow,
  InvoiceRow,
  JobNoteRow,
  JobRow,
  LeadRow,
  MaintenancePlanRow,
  UserRow,
} from "./types";

// ---------- Users ----------

export function listUsers(): UserRow[] {
  return all<UserRow>("SELECT * FROM users ORDER BY role DESC, name ASC");
}

export function getUserByEmail(email: string): UserRow | undefined {
  return one<UserRow>("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
}

export function getUserById(id: number): UserRow | undefined {
  return one<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
}

// ---------- Leads / Intake ----------

export function listLeads(status?: string): LeadRow[] {
  const base = `
    SELECT l.*, u.name as assigned_to_name, c.name as created_by_name
    FROM leads l
    LEFT JOIN users u ON u.id = l.assigned_to
    LEFT JOIN users c ON c.id = l.created_by
  `;
  if (status) {
    return all<LeadRow>(`${base} WHERE l.status = ? ORDER BY l.created_at DESC`, [status]);
  }
  return all<LeadRow>(`${base} ORDER BY l.created_at DESC`);
}

export function getLead(id: number): LeadRow | undefined {
  return one<LeadRow>(
    `SELECT l.*, u.name as assigned_to_name, c.name as created_by_name
     FROM leads l
     LEFT JOIN users u ON u.id = l.assigned_to
     LEFT JOIN users c ON c.id = l.created_by
     WHERE l.id = ?`,
    [id]
  );
}

export function listCallsForLead(leadId: number): CallLogRow[] {
  return all<CallLogRow>(
    `SELECT cl.*, u.name as taken_by_name FROM call_logs cl
     LEFT JOIN users u ON u.id = cl.taken_by
     WHERE cl.lead_id = ? ORDER BY cl.created_at DESC`,
    [leadId]
  );
}

export function listRecentCalls(limit = 25): CallLogRow[] {
  return all<CallLogRow>(
    `SELECT cl.*, u.name as taken_by_name FROM call_logs cl
     LEFT JOIN users u ON u.id = cl.taken_by
     ORDER BY cl.created_at DESC LIMIT ?`,
    [limit]
  );
}

// ---------- Customers ----------

export function listCustomers(search?: string): CustomerRow[] {
  if (search) {
    const q = `%${search.toLowerCase()}%`;
    return all<CustomerRow>(
      `SELECT * FROM customers
       WHERE lower(name) LIKE ? OR lower(phone) LIKE ? OR lower(address) LIKE ? OR lower(email) LIKE ?
       ORDER BY name ASC`,
      [q, q, q, q]
    );
  }
  return all<CustomerRow>("SELECT * FROM customers ORDER BY name ASC");
}

export function getCustomer(id: number): CustomerRow | undefined {
  return one<CustomerRow>("SELECT * FROM customers WHERE id = ?", [id]);
}

export function getCustomerJobs(customerId: number): JobRow[] {
  return all<JobRow>(
    `SELECT j.*, u.name as assigned_to_name FROM jobs j
     LEFT JOIN users u ON u.id = j.assigned_to
     WHERE j.customer_id = ? ORDER BY j.created_at DESC`,
    [customerId]
  );
}

export function getCustomerInvoices(customerId: number): InvoiceRow[] {
  return all<InvoiceRow>(
    "SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC",
    [customerId]
  );
}

// ---------- Jobs ----------

export function listJobs(status?: string): JobRow[] {
  const base = `
    SELECT j.*, c.name as customer_name, u.name as assigned_to_name
    FROM jobs j
    JOIN customers c ON c.id = j.customer_id
    LEFT JOIN users u ON u.id = j.assigned_to
  `;
  if (status) {
    return all<JobRow>(`${base} WHERE j.status = ? ORDER BY j.scheduled_at ASC, j.created_at DESC`, [status]);
  }
  return all<JobRow>(`${base} ORDER BY j.scheduled_at ASC, j.created_at DESC`);
}

export function getJob(id: number): JobRow | undefined {
  return one<JobRow>(
    `SELECT j.*, c.name as customer_name, u.name as assigned_to_name
     FROM jobs j
     JOIN customers c ON c.id = j.customer_id
     LEFT JOIN users u ON u.id = j.assigned_to
     WHERE j.id = ?`,
    [id]
  );
}

export function listJobNotes(jobId: number): JobNoteRow[] {
  return all<JobNoteRow>(
    `SELECT jn.*, u.name as user_name FROM job_notes jn
     LEFT JOIN users u ON u.id = jn.user_id
     WHERE jn.job_id = ? ORDER BY jn.created_at ASC`,
    [jobId]
  );
}

export function listJobsForSchedule(startIso: string, endIso: string): JobRow[] {
  return all<JobRow>(
    `SELECT j.*, c.name as customer_name, u.name as assigned_to_name
     FROM jobs j
     JOIN customers c ON c.id = j.customer_id
     LEFT JOIN users u ON u.id = j.assigned_to
     WHERE j.scheduled_at BETWEEN ? AND ?
     ORDER BY j.scheduled_at ASC`,
    [startIso, endIso]
  );
}

// ---------- Invoices ----------

export function listInvoices(status?: string): InvoiceRow[] {
  const base = `
    SELECT i.*, c.name as customer_name FROM invoices i
    JOIN customers c ON c.id = i.customer_id
  `;
  if (status) {
    return all<InvoiceRow>(`${base} WHERE i.status = ? ORDER BY i.created_at DESC`, [status]);
  }
  return all<InvoiceRow>(`${base} ORDER BY i.created_at DESC`);
}

export function getInvoice(id: number): InvoiceRow | undefined {
  return one<InvoiceRow>(
    `SELECT i.*, c.name as customer_name FROM invoices i
     JOIN customers c ON c.id = i.customer_id
     WHERE i.id = ?`,
    [id]
  );
}

export function listInvoiceLineItems(invoiceId: number): InvoiceLineItemRow[] {
  return all<InvoiceLineItemRow>(
    "SELECT * FROM invoice_line_items WHERE invoice_id = ? ORDER BY sort_order ASC, id ASC",
    [invoiceId]
  );
}

export function getInvoiceForJob(jobId: number): InvoiceRow | undefined {
  return one<InvoiceRow>("SELECT * FROM invoices WHERE job_id = ?", [jobId]);
}

export function listFailedQboSyncs(): InvoiceRow[] {
  return all<InvoiceRow>(
    `SELECT i.*, c.name as customer_name FROM invoices i
     JOIN customers c ON c.id = i.customer_id
     WHERE i.qbo_sync_status = 'FAILED' ORDER BY i.created_at DESC`
  );
}

// ---------- Maintenance plans ----------

export function listMaintenancePlans(status?: string): MaintenancePlanRow[] {
  const base = `
    SELECT mp.*, c.name as customer_name, c.phone as customer_phone
    FROM maintenance_plans mp
    JOIN customers c ON c.id = mp.customer_id
  `;
  if (status) {
    return all<MaintenancePlanRow>(`${base} WHERE mp.status = ? ORDER BY mp.next_visit_due ASC`, [status]);
  }
  return all<MaintenancePlanRow>(`${base} ORDER BY mp.next_visit_due ASC`);
}

// ---------- Activity feed ----------

export function listActivity(limit = 20): ActivityRow[] {
  return all<ActivityRow>(
    `SELECT a.*, u.name as user_name FROM activity_log a
     LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC LIMIT ?`,
    [limit]
  );
}

// ---------- Dashboard aggregates ----------

export function getDashboardStats() {
  const newLeads = one<{ n: number }>(
    "SELECT COUNT(*) as n FROM leads WHERE status IN ('NEW', 'CONTACTED')"
  )?.n ?? 0;

  const jobsToday = one<{ n: number }>(
    "SELECT COUNT(*) as n FROM jobs WHERE date(scheduled_at) = date('now') AND status != 'CANCELLED'"
  )?.n ?? 0;

  const jobsThisWeek = one<{ n: number }>(
    "SELECT COUNT(*) as n FROM jobs WHERE date(scheduled_at) BETWEEN date('now') AND date('now', '+7 days') AND status != 'CANCELLED'"
  )?.n ?? 0;

  const openInvoicesTotal = one<{ total: number }>(
    "SELECT COALESCE(SUM(total_cents), 0) as total FROM invoices WHERE status IN ('SENT', 'OVERDUE')"
  )?.total ?? 0;

  const paidThisMonth = one<{ total: number }>(
    "SELECT COALESCE(SUM(total_cents), 0) as total FROM invoices WHERE status = 'PAID' AND strftime('%Y-%m', paid_at) = strftime('%Y-%m', 'now')"
  )?.total ?? 0;

  const activeMaintenancePlans = one<{ n: number }>(
    "SELECT COUNT(*) as n FROM maintenance_plans WHERE status = 'ACTIVE'"
  )?.n ?? 0;

  const missedCallsToday = one<{ n: number }>(
    "SELECT COUNT(*) as n FROM call_logs WHERE direction = 'missed' AND date(created_at) = date('now')"
  )?.n ?? 0;

  const overdueMaintenance = one<{ n: number }>(
    "SELECT COUNT(*) as n FROM maintenance_plans WHERE status = 'ACTIVE' AND next_visit_due < date('now')"
  )?.n ?? 0;

  return {
    newLeads,
    jobsToday,
    jobsThisWeek,
    openInvoicesTotal,
    paidThisMonth,
    activeMaintenancePlans,
    missedCallsToday,
    overdueMaintenance,
  };
}
