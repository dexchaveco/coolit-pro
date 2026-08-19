import { NextRequest, NextResponse } from "next/server";
import { run, one } from "@/lib/db";
import { logActivity } from "@/lib/activity";

// Generic inbound webhook for phone/call providers (OpenPhone, Grasshopper via
// Zapier, Twilio, RingCentral, etc). Point your provider's webhook at:
//
//   POST https://your-domain.com/api/webhooks/calls
//   Header: x-webhook-secret: <CALL_WEBHOOK_SECRET>
//
// This endpoint is deliberately loose about payload shape since every
// provider formats things differently. It tries a handful of common field
// names and falls back to storing the raw payload as notes so nothing is
// ever silently dropped. See DEPLOYMENT.md for provider-specific notes —
// Grasshopper has no public webhook API today, so the practical path there
// is Grasshopper -> Zapier -> this endpoint, or switching to a provider
// with native webhooks (OpenPhone is the easiest fit).

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

function digitsOnly(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const d = v.replace(/\D/g, "");
  return d || null;
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  const expected = process.env.CALL_WEBHOOK_SECRET;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  // Some providers (OpenPhone) nest the real payload under data.object
  const dataObj = body.data as Record<string, unknown> | undefined;
  const payload = (dataObj?.object as Record<string, unknown>) || body;

  const fromRaw = pick(payload, ["from", "caller", "callerNumber", "from_number"]);
  const toRaw = pick(payload, ["to", "callee", "to_number"]);
  const directionRaw = String(pick(payload, ["direction"]) ?? "inbound").toLowerCase();
  const direction = directionRaw.includes("out") ? "outbound" : directionRaw.includes("miss") ? "missed" : "inbound";
  const durationRaw = pick(payload, ["duration", "durationSeconds", "call_duration"]);
  const recordingRaw = pick(payload, ["recordingUrl", "recording_url", "mediaUrl"]);
  const transcriptRaw = pick(payload, ["transcript", "voicemail_transcript", "summary"]);
  const callerNameRaw = pick(payload, ["contactName", "caller_name", "name"]);

  const callerNumber = digitsOnly(fromRaw) ?? digitsOnly(toRaw);
  const callerName = typeof callerNameRaw === "string" ? callerNameRaw : null;

  // Try to auto-link to an existing lead or customer by phone number
  let leadId: number | null = null;
  let customerId: number | null = null;
  if (callerNumber) {
    const lead = one<{ id: number }>(
      `SELECT id FROM leads WHERE replace(replace(replace(phone,'-',''),' ',''),'.','') LIKE ? ORDER BY created_at DESC LIMIT 1`,
      [`%${callerNumber.slice(-7)}%`]
    );
    leadId = lead?.id ?? null;

    const customer = one<{ id: number }>(
      `SELECT id FROM customers WHERE replace(replace(replace(phone,'-',''),' ',''),'.','') LIKE ? LIMIT 1`,
      [`%${callerNumber.slice(-7)}%`]
    );
    customerId = customer?.id ?? null;
  }

  const result = run(
    `INSERT INTO call_logs (lead_id, customer_id, caller_number, caller_name, direction, duration_seconds, notes, recording_url, transcript, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      leadId,
      customerId,
      callerNumber,
      callerName,
      direction,
      typeof durationRaw === "number" ? durationRaw : Number(durationRaw) || 0,
      typeof recordingRaw !== "string" && typeof transcriptRaw !== "string" ? JSON.stringify(payload).slice(0, 4000) : null,
      typeof recordingRaw === "string" ? recordingRaw : null,
      typeof transcriptRaw === "string" ? transcriptRaw : null,
      "webhook",
    ]
  );

  logActivity(null, "call received via webhook", "call", Number(result.lastInsertRowid), callerName || callerNumber || undefined);

  return NextResponse.json({ ok: true, id: result.lastInsertRowid, matchedLead: leadId, matchedCustomer: customerId });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Coolit Pro call webhook is live. Send POST requests here from your phone provider.",
  });
}
