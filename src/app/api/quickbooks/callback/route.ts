import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { exchangeCodeForTokens } from "@/lib/quickbooks";
import { logActivity } from "@/lib/activity";

const STATE_COOKIE = "qbo_oauth_state";

export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100";
  const settingsUrl = new URL("/settings", base);

  const session = await getSession();
  const { searchParams } = request.nextUrl;

  const errorParam = searchParams.get("error");
  if (errorParam) {
    settingsUrl.searchParams.set("qbo", "denied");
    return NextResponse.redirect(settingsUrl);
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const realmId = searchParams.get("realmId");
  const cookieState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !realmId || !state || !cookieState || state !== cookieState) {
    settingsUrl.searchParams.set("qbo", "error");
    settingsUrl.searchParams.set("message", "QuickBooks sign-in didn't complete cleanly — please try Connect QuickBooks again.");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    await exchangeCodeForTokens(code, realmId, session?.uid ?? null);
    logActivity(session?.uid ?? null, "connected QuickBooks", "settings", null);
    settingsUrl.searchParams.set("qbo", "connected");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error connecting to QuickBooks.";
    settingsUrl.searchParams.set("qbo", "error");
    settingsUrl.searchParams.set("message", message);
  }

  const res = NextResponse.redirect(settingsUrl);
  res.cookies.delete(STATE_COOKIE);
  return res;
}
