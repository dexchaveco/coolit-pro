"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { run } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getLead } from "@/lib/data";
import type { LeadStatus } from "@/lib/types";

export async function createLeadAction(formData: FormData) {
  const session = await getSession();

  const customer_name = String(formData.get("customer_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const issue_description = String(formData.get("issue_description") || "").trim();
  const source = String(formData.get("source") || "phone");
  const assigned_to = formData.get("assigned_to") ? Number(formData.get("assigned_to")) : null;

  if (!customer_name) {
    return { error: "Name is required." };
  }

  const result = run(
    `INSERT INTO leads (customer_name, phone, email, address, issue_description, source, assigned_to, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [customer_name, phone || null, email || null, address || null, issue_description || null, source, assigned_to, session?.uid ?? null]
  );

  logActivity(session?.uid ?? null, "created lead", "lead", Number(result.lastInsertRowid), customer_name);

  revalidatePath("/intake");
  revalidatePath("/dashboard");
  redirect(`/intake/${result.lastInsertRowid}`);
}

export async function updateLeadStatusAction(leadId: number, status: LeadStatus, lostReason?: string) {
  const session = await getSession();
  run(
    `UPDATE leads SET status = ?, lost_reason = ?, updated_at = datetime('now') WHERE id = ?`,
    [status, lostReason ?? null, leadId]
  );
  const lead = getLead(leadId);
  logActivity(session?.uid ?? null, `moved lead to ${status}`, "lead", leadId, lead?.customer_name);
  revalidatePath("/intake");
  revalidatePath(`/intake/${leadId}`);
  revalidatePath("/dashboard");
}

export async function assignLeadAction(leadId: number, assignedTo: number | null) {
  const session = await getSession();
  run(`UPDATE leads SET assigned_to = ?, updated_at = datetime('now') WHERE id = ?`, [assignedTo, leadId]);
  logActivity(session?.uid ?? null, "reassigned lead", "lead", leadId);
  revalidatePath("/intake");
  revalidatePath(`/intake/${leadId}`);
}

export async function addLeadNoteCallAction(formData: FormData) {
  const session = await getSession();
  const leadId = Number(formData.get("lead_id"));
  const notes = String(formData.get("notes") || "").trim();
  const direction = String(formData.get("direction") || "inbound");
  const duration = Number(formData.get("duration_seconds") || 0);

  if (!leadId || !notes) return;

  run(
    `INSERT INTO call_logs (lead_id, direction, duration_seconds, notes, taken_by, source)
     VALUES (?, ?, ?, ?, ?, 'manual')`,
    [leadId, direction, duration, notes, session?.uid ?? null]
  );

  const lead = getLead(leadId);
  logActivity(session?.uid ?? null, "logged a call", "lead", leadId, lead?.customer_name);

  revalidatePath(`/intake/${leadId}`);
  revalidatePath("/intake");
  revalidatePath("/dashboard");
}

export async function logManualCallAction(formData: FormData) {
  const session = await getSession();
  const caller_name = String(formData.get("caller_name") || "").trim();
  const caller_number = String(formData.get("caller_number") || "").trim();
  const direction = String(formData.get("direction") || "inbound");
  const notes = String(formData.get("notes") || "").trim();

  const result = run(
    `INSERT INTO call_logs (caller_name, caller_number, direction, notes, taken_by, source)
     VALUES (?, ?, ?, ?, ?, 'manual')`,
    [caller_name || null, caller_number || null, direction, notes || null, session?.uid ?? null]
  );

  logActivity(session?.uid ?? null, "logged a call", "call", Number(result.lastInsertRowid), caller_name || caller_number);

  revalidatePath("/intake");
  revalidatePath("/dashboard");
}

export async function convertLeadToCustomerAction(leadId: number) {
  const session = await getSession();
  const lead = getLead(leadId);
  if (!lead) return { error: "Lead not found" };

  const existing = run(
    `INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)`,
    [lead.customer_name, lead.phone, lead.email, lead.address]
  );
  const customerId = Number(existing.lastInsertRowid);

  run(`UPDATE leads SET customer_id = ?, status = 'WON', updated_at = datetime('now') WHERE id = ?`, [customerId, leadId]);
  logActivity(session?.uid ?? null, "converted lead to customer", "customer", customerId, lead.customer_name);

  revalidatePath("/intake");
  revalidatePath("/customers");
  redirect(`/customers/${customerId}`);
}
