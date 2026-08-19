"use server";

import { redirect } from "next/navigation";
import { getUserByEmail } from "@/lib/data";
import { clearSessionCookie, setSessionCookie, verifyPassword } from "@/lib/auth";

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
