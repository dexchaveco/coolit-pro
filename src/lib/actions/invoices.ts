"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { run } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { dollarsToCents, generateInvoiceNumber } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/types";

export async function createInvoiceAction(formData: FormData) {
  const session = await getSession();
  const customer_id = Number(formData.get("customer_id"));
  const job_id = formData.get("job_id") ? Number(formData.get("job_id")) : null;
  const due_date = String(formData.get("due_date") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const taxRate = parseFloat(String(formData.get("tax_rate") || "0")) / 100;

  const services = formData.getAll("item_service") as string[];
  const scopes = formData.getAll("item_scope") as string[];
  const quantities = formData.getAll("item_quantity") as string[];
  const prices = formData.getAll("item_price") as string[];

  if (!customer_id) return { error: "Customer is required." };

  let subtotalCents = 0;
  const lineItems: { service: string; description: string; quantity: number; unit_price_cents: number; amount_cents: number }[] = [];

  for (let i = 0; i < services.length; i++) {
    const service = (services[i] || "").trim();
    const scope = (scopes[i] || "").trim();
    const unit_price_cents = dollarsToCents(prices[i] || "0");
    if (!service || !unit_price_cents) continue;
    // Short scopes read fine inline ("Service — scope"); longer/multi-paragraph
    // scopes (full Scope of Work / Warranty / Exclusions text) get their own lines.
    const description =
      scope && (scope.includes("\n") || scope.length > 60)
        ? `${service}\n\n${scope}`
        : scope
          ? `${service} — ${scope}`
          : service;
    const quantity = parseFloat(quantities[i] || "1") || 1;
    const amount_cents = Math.round(quantity * unit_price_cents);
    subtotalCents += amount_cents;
    lineItems.push({ service, description, quantity, unit_price_cents, amount_cents });
  }

  const taxCents = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + taxCents;
  const invoiceNumber = generateInvoiceNumber();

  const result = run(
    `INSERT INTO invoices (invoice_number, job_id, customer_id, status, subtotal_cents, tax_cents, total_cents, due_date, notes)
     VALUES (?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?)`,
    [invoiceNumber, job_id, customer_id, subtotalCents, taxCents, totalCents, due_date || null, notes || null]
  );
  const invoiceId = Number(result.lastInsertRowid);

  lineItems.forEach((item, idx) => {
    run(
      `INSERT INTO invoice_line_items (invoice_id, service, description, quantity, unit_price_cents, amount_cents, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoiceId, item.service, item.description, item.quantity, item.unit_price_cents, item.amount_cents, idx]
    );
  });

  if (job_id) {
    run(`UPDATE jobs SET status = 'INVOICED', updated_at = datetime('now') WHERE id = ?`, [job_id]);
    revalidatePath(`/jobs/${job_id}`);
  }

  logActivity(session?.uid ?? null, "created invoice", "invoice", invoiceId, invoiceNumber);

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoiceId}`);
}

export async function updateInvoiceStatusAction(invoiceId: number, status: InvoiceStatus) {
  const session = await getSession();
  const paidAt = status === "PAID" ? "datetime('now')" : "NULL";
  run(`UPDATE invoices SET status = ?, paid_at = ${paidAt} WHERE id = ?`, [status, invoiceId]);
  logActivity(session?.uid ?? null, `marked invoice ${status.toLowerCase()}`, "invoice", invoiceId);
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
}
