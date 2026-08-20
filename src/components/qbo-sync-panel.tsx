import { CheckCircle2, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { syncInvoiceToQuickBooksAction } from "@/lib/actions/quickbooks";
import { isConnected, buildQboInvoiceLink } from "@/lib/quickbooks";
import { timeAgo } from "@/lib/utils";
import type { InvoiceRow } from "@/lib/types";

export function QboSyncPanel({ invoice }: { invoice: InvoiceRow }) {
  const connected = isConnected();

  if (!connected) {
    return (
      <Card className="p-4 flex items-start gap-3 bg-[#f7f6f2]">
        <AlertTriangle className="h-4.5 w-4.5 text-ink-muted shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-ink-secondary">
            QuickBooks isn&apos;t connected yet. Connect it in Settings, then you&apos;ll be able to send this invoice
            straight to QuickBooks from here.
          </p>
        </div>
      </Card>
    );
  }

  if (invoice.qbo_sync_status === "SYNCED" && invoice.qbo_invoice_id) {
    const link = buildQboInvoiceLink(invoice.qbo_invoice_id);
    return (
      <Card className="p-4 flex items-center justify-between gap-3 bg-good-tint">
        <div className="flex items-center gap-2.5 text-sm">
          <CheckCircle2 className="h-4.5 w-4.5 text-[#0a7a0a] shrink-0" />
          <div>
            <p className="font-medium text-[#0a7a0a]">Synced to QuickBooks</p>
            <p className="text-[#0a7a0a]/80 text-xs mt-0.5">
              {invoice.qbo_synced_at ? `Confirmed ${timeAgo(invoice.qbo_synced_at)}` : "Confirmed"} · QuickBooks invoice
              #{invoice.qbo_invoice_id}
            </p>
          </div>
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#0a7a0a] hover:underline shrink-0"
          >
            View in QuickBooks <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </Card>
    );
  }

  if (invoice.qbo_sync_status === "FAILED") {
    return (
      <Card className="p-4 space-y-3 bg-critical-tint">
        <div className="flex items-start gap-2.5 text-sm">
          <AlertTriangle className="h-4.5 w-4.5 text-critical shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-critical">Didn&apos;t make it to QuickBooks</p>
            {invoice.qbo_sync_error && <p className="text-critical/80 text-xs mt-0.5">{invoice.qbo_sync_error}</p>}
            <p className="text-critical/70 text-xs mt-0.5">
              {invoice.qbo_sync_attempts} attempt{invoice.qbo_sync_attempts === 1 ? "" : "s"} so far. Nothing was
              double-billed — just retry once it&apos;s fixed (or if it was a one-off hiccup).
            </p>
          </div>
        </div>
        <form action={syncInvoiceToQuickBooksAction.bind(null, invoice.id)}>
          <Button type="submit" variant="danger" className="text-sm">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex items-center justify-between gap-3">
      <p className="text-sm text-ink-secondary">Not sent to QuickBooks yet.</p>
      <form action={syncInvoiceToQuickBooksAction.bind(null, invoice.id)}>
        <Button type="submit" variant="secondary" className="text-sm">
          Send to QuickBooks
        </Button>
      </form>
    </Card>
  );
}
