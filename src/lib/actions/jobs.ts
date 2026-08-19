"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { run } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getJob } from "@/lib/data";
import type { JobStatus } from "@/lib/types";

export async function createJobAction(formData: FormData) {
  const session = await getSession();
  const customer_id = Number(formData.get("customer_id"));
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const job_type = String(formData.get("job_type") || "service");
  const priority = String(formData.get("priority") || "normal");
  const address = String(formData.get("address") || "").trim();
  const scheduled_at = String(formData.get("scheduled_at") || "").trim();
  const assigned_to = formData.get("assigned_to") ? Number(formData.get("assigned_to")) : null;
  const lead_id = formData.get("lead_id") ? Number(formData.get("lead_id")) : null;

  if (!customer_id || !title) return { error: "Customer and title are required." };

  const status: JobStatus = scheduled_at ? "SCHEDULED" : "UNSCHEDULED";

  const result = run(
    `INSERT INTO jobs (customer_id, lead_id, title, description, job_type, priority, address, scheduled_at, assigned_to, created_by, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [customer_id, lead_id, title, description || null, job_type, priority, address || null, scheduled_at || null, assigned_to, session?.uid ?? null, status]
  );

  logActivity(session?.uid ?? null, "created job", "job", Number(result.lastInsertRowid), title);

  if (lead_id) {
    run(`UPDATE leads SET status = 'SCHEDULED', updated_at = datetime('now') WHERE id = ?`, [lead_id]);
    revalidatePath("/intake");
    revalidatePath(`/intake/${lead_id}`);
  }

  revalidatePath("/jobs");
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  redirect(`/jobs/${result.lastInsertRowid}`);
}

export async function updateJobStatusAction(jobId: number, status: JobStatus) {
  const session = await getSession();
  const completedAt = status === "COMPLETED" ? "datetime('now')" : "NULL";
  run(`UPDATE jobs SET status = ?, completed_at = ${completedAt}, updated_at = datetime('now') WHERE id = ?`, [status, jobId]);
  const job = getJob(jobId);
  logActivity(session?.uid ?? null, `marked job ${status.toLowerCase().replace("_", " ")}`, "job", jobId, job?.title);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  revalidatePath("/schedule");
}

export async function updateJobScheduleAction(jobId: number, scheduledAt: string, assignedTo: number | null) {
  const session = await getSession();
  run(
    `UPDATE jobs SET scheduled_at = ?, assigned_to = ?, status = CASE WHEN status = 'UNSCHEDULED' THEN 'SCHEDULED' ELSE status END, updated_at = datetime('now') WHERE id = ?`,
    [scheduledAt || null, assignedTo, jobId]
  );
  logActivity(session?.uid ?? null, "rescheduled job", "job", jobId);
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
}

export async function addJobNoteAction(formData: FormData) {
  const session = await getSession();
  const jobId = Number(formData.get("job_id"));
  const note = String(formData.get("note") || "").trim();
  if (!jobId || !note) return;

  run(`INSERT INTO job_notes (job_id, user_id, note) VALUES (?, ?, ?)`, [jobId, session?.uid ?? null, note]);
  logActivity(session?.uid ?? null, "added a job note", "job", jobId);
  revalidatePath(`/jobs/${jobId}`);
}
