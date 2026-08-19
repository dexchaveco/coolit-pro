"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { run } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function createCustomerAction(formData: FormData) {
  const session = await getSession();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const zip = String(formData.get("zip") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) return { error: "Name is required." };

  const result = run(
    `INSERT INTO customers (name, phone, email, address, city, zip, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, phone || null, email || null, address || null, city || null, zip || null, notes || null]
  );

  logActivity(session?.uid ?? null, "added customer", "customer", Number(result.lastInsertRowid), name);
  revalidatePath("/customers");
  redirect(`/customers/${result.lastInsertRowid}`);
}

export async function updateCustomerAction(customerId: number, formData: FormData) {
  const session = await getSession();
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const zip = String(formData.get("zip") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  run(
    `UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, city = ?, zip = ?, notes = ? WHERE id = ?`,
    [name, phone || null, email || null, address || null, city || null, zip || null, notes || null, customerId]
  );

  logActivity(session?.uid ?? null, "updated customer", "customer", customerId, name);
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/customers");
}

export async function addPropertyAction(customerId: number, formData: FormData) {
  const label = String(formData.get("label") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const unit_type = String(formData.get("unit_type") || "").trim();
  if (!address) return;

  run(
    `INSERT INTO properties (customer_id, label, address, unit_type) VALUES (?, ?, ?, ?)`,
    [customerId, label || null, address, unit_type || null]
  );
  revalidatePath(`/customers/${customerId}`);
}
