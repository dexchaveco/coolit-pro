"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { one, run } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getInvoice, listInvoiceLineItems } from "@/lib/data";
import { disconnectQuickBooks, findOrCreateQboCustomer, createQboInvoice } from "@/lib/quickbooks";
import type { CustomerRow } from "@/lib/types";

export async function disconnectQuickBooksAction() {
  const session = await getSession();
  if (session?.role !== "OWNER") return;
  disconnectQuickBooks();
  logActivity(session.uid, "disconnected QuickBooks", "settings", null);
  revalidatePath("/settings");
  redirect("/settings");
}

/**
 * Sends one invoice to QuickBooks. Manual/explicit (a button click, never automatic)
 * so nothing writes to the real books without a person deciding to. Always leaves a
 * clear trail: on success, the invoice stores QuickBooks' own invoice ID and a direct
 * link to it there; on failure, the exact error is stored and shown, and the invoice
 * is flagged on the dashboard until someone retries or resolves it.
 */
export async function syncInvoiceToQuickBooksAction(invoiceId: number) {
  const session = await getSession();
  const invoice = getInvoice(invoiceId);
  if (!invoice) return;

  run(`UPDATE invoices SET qbo_sync_status = 'SYNCING' WHERE id = ?`, [invoiceId]);
  revalidatePath(`/invoices/${invoiceId}`);

  try {
    const customer = one<CustomerRow>("SELECT * FROM customers WHERE id = ?", [invoice.customer_id]);
    if (!customer) throw new Error("Customer for this invoice no longer exists.");

    const qboCustomerId = await findOrCreateQboCustomer(customer);
    const lineItems = listInvoiceLineItems(invoiceId);

    const { qboInvoiceId, qboLink } = await createQboInvoice({
      qboCustomerId,
      docNumber: invoice.invoice_number,
      dueDate: invoice.due_date,
      lines: lineItems.map((li) => ({
        service: li.service || "Other",
        description: li.description,
        quantity: li.quantity,
        unitPriceDollars: li.unit_price_cents / 100,
      })),
    });

    run(
      `UPDATE invoices SET qbo_invoice_id = ?, qbo_sync_status = 'SYNCED', qbo_synced_at = datetime('now'),
        qbo_sync_error = NULL, qbo_sync_attempts = qbo_sync_attempts + 1 WHERE id = ?`,
      [qboInvoiceId, invoiceId]
    );
    logActivity(session?.uid ?? null, "synced invoice to QuickBooks", "invoice", invoiceId, qboLink);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error talking to QuickBooks.";
    run(
      `UPDATE invoices SET qbo_sync_status = 'FAILED', qbo_sync_error = ?, qbo_sync_attempts = qbo_sync_attempts + 1 WHERE id = ?`,
      [message, invoiceId]
    );
    logActivity(session?.uid ?? null, "QuickBooks sync failed", "invoice", invoiceId, message);
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}
