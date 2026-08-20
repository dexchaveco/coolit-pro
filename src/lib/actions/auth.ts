"use server";

import { redirect } from "next/navigation";
import { one, run } from "@/lib/db";
import { getUserByEmail } from "@/lib/data";
import { clearSessionCookie, setSessionCookie, verifyPassword, hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

/**
 * First-run bootstrap: creates the very first (OWNER) account on a fresh
 * deployment. Only works while the users table is empty — re-checked here
 * as a race guard, not just trusted from the page that rendered the form —
 * so there's no way to use this to create extra accounts later.
 */
export async function createOwnerAccountAction(formData: FormData): Promise<{ error?: string }> {
  const existing = one<{ count: number }>("SELECT COUNT(*) as count FROM users");
  if (existing && Number(existing.count) > 0) {
    return { error: "An account already exists — go to the login page instead." };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || !password) return { error: "Name, email, and password are all required." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const password_hash = await hashPassword(password);
  const result = run(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'OWNER')`,
    [name, email, password_hash]
  );
  const userId = Number(result.lastInsertRowid);

  logActivity(userId, "created the account", "user", userId, "First-run setup");

  await setSessionCookie({ uid: userId, name, email, role: "OWNER" });
  redirect("/dashboard");
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = getUserByEmail(email);
  if (!user) {
    return { error: "We don't recognize that email." };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { error: "That password isn't right." };
  }

  await setSessionCookie({
    uid: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect(next || "/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
