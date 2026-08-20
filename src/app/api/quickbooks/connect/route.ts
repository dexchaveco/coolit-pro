import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAuthorizeUrl } from "@/lib/quickbooks";

const STATE_COOKIE = "qbo_oauth_state";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    return NextResponse.redirect(new URL("/settings", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100"));
  }

  const state = randomBytes(16).toString("hex");
  let authorizeUrl: string;
  try {
    authorizeUrl = getAuthorizeUrl(state);
  } catch (err) {
    const message = err instanceof Error ? err.message : "QuickBooks is not configured yet.";
    const url = new URL("/settings", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100");
    url.searchParams.set("qbo", "error");
    url.searchParams.set("message", message);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
  return res;
}
