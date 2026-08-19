"use server";

import { revalidatePath } from "next/cache";
import { run, one } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function createMaintenancePlanAction(formData: FormData) {
  const session = await getSession();
  const customer_id = Number(formData.get("customer_id"));
  const plan_name = String(formData.get("plan_name") || "Cool It Care Plan").trim();
  const monthly_price = String(formData.get("monthly_price") || "29");
  const visits_per_year = Number(formData.get("visits_per_year") || 1);
  const next_visit_due = String(formData.get("next_visit_due") || "").trim();

  if (!customer_id) return { error: "Customer required" };

  const monthlyPriceCents = Math.round(parseFloat(monthly_price) * 100);

  run(
    `INSERT INTO maintenance_plans (customer_id, plan_name, monthly_price_cents, visits_per_year, next_visit_due)
     VALUES (?, ?, ?, ?, ?)`,
    [customer_id, plan_name, monthlyPriceCents, visits_per_year, next_visit_due || null]
  );
  run(`UPDATE customers SET on_maintenance_plan = 1 WHERE id = ?`, [customer_id]);

  logActivity(session?.uid ?? null, "started maintenance plan", "customer", customer_id, plan_name);

  revalidatePath("/maintenance");
  revalidatePath(`/customers/${customer_id}`);
  revalidatePath("/dashboard");
}

export async function recordMaintenanceVisitAction(planId: number, nextVisitDue?: string) {
  const session = await getSession();
  const plan = one<{ visits_per_year: number }>(`SELECT visits_per_year FROM maintenance_plans WHERE id = ?`, [planId]);
  const visitsPerYear = Number(plan?.visits_per_year) || 1;
  const monthsUntilNext = Math.max(1, Math.round(12 / visitsPerYear));

  const computedNext =
    nextVisitDue && nextVisitDue.trim()
      ? nextVisitDue
      : `date('now', '+${monthsUntilNext} months')`;

  const useLiteral = !(nextVisitDue && nextVisitDue.trim());

  run(
    `UPDATE maintenance_plans SET last_visit_at = datetime('now'), next_visit_due = ${useLiteral ? computedNext : "?"} WHERE id = ?`,
    useLiteral ? [planId] : [computedNext, planId]
  );
  logActivity(session?.uid ?? null, "logged maintenance visit", "maintenance_plan", planId);
  revalidatePath("/maintenance");
  revalidatePath("/dashboard");
}

export async function updateMaintenancePlanStatusAction(planId: number, status: "ACTIVE" | "PAUSED" | "CANCELLED") {
  const session = await getSession();
  run(`UPDATE maintenance_plans SET status = ? WHERE id = ?`, [status, planId]);
  logActivity(session?.uid ?? null, `maintenance plan ${status.toLowerCase()}`, "maintenance_plan", planId);
  revalidatePath("/maintenance");
}
