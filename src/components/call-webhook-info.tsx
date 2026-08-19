import { Card } from "@/components/ui";

export function CallWebhookInfo() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-ink mb-2">Connecting a phone system</h2>
      <p className="text-sm text-ink-secondary mb-3">
        Right now anyone can tap <span className="font-medium text-ink">Log a call</span> at the top of the app to
        record what came in — that alone fixes the &quot;only Rick knows&quot; problem. When you&apos;re ready to stop
        typing that in by hand, this app has a webhook endpoint ready to receive calls automatically from a real
        phone provider:
      </p>
      <div className="rounded-xl bg-page px-3.5 py-2.5 font-mono text-xs text-ink-secondary break-all mb-3">
        POST {base}/api/webhooks/calls
        <br />
        Header: x-webhook-secret: (set CALL_WEBHOOK_SECRET in your environment)
      </div>
      <p className="text-sm text-ink-secondary">
        <span className="font-medium text-ink">OpenPhone</span> is the easiest fit — it has real webhooks for calls and
        texts, and it&apos;s built for exactly this (one shared number, whole team sees the activity). Grasshopper
        doesn&apos;t publish a webhook API, so the practical path there is Grasshopper &rarr; Zapier &rarr; this URL. Either way,
        once a call hits this endpoint it auto-links to the matching lead or customer by phone number.
      </p>
    </Card>
  );
}
