"use server";

import { revalidatePath } from "next/cache";
import { run } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getUserByEmail } from "@/lib/data";

export async function inviteTeamMemberAction(formData: FormData) {
  const session = await getSession();
  if (session?.role !== "OWNER") return { error: "Only owners can add team members." };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "TECH") as "OWNER" | "TECH";
  const phone = String(formData.get("phone") || "").trim();

  if (!name || !email || !password) return { error: "Name, email, and password are required." };
  if (getUserByEmail(email)) return { error: "That email is already in use." };

  const password_hash = await hashPassword(password);
  const result = run(
    `INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)`,
    [name, email, password_hash, role, phone || null]
  );

  logActivity(session.uid, "added team member", "user", Number(result.lastInsertRowid), name);
  revalidatePath("/settings");
  return { success: true };
}

export async function updateOwnPasswordAction(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  const password = String(formData.get("password") || "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const password_hash = await hashPassword(password);
  run(`UPDATE users SET password_hash = ? WHERE id = ?`, [password_hash, session.uid]);
  return { success: true };
}
