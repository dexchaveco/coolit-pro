import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { getConnection } from "@/lib/quickbooks";
import { disconnectQuickBooksAction } from "@/lib/actions/quickbooks";
import { formatDate } from "@/lib/utils";

export function QuickBooksSettingsCard({ notice }: { notice?: { type: string; message?: string } }) {
  const connection = getConnection();

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-ink mb-1">QuickBooks</h2>
      <p className="text-sm text-ink-secondary mb-4">
        Connect QuickBooks once, and invoices can be sent there straight from Coolit Pro — with a clear status on
        every invoice (Sent / Not sent / Failed) so nothing goes through silently.
      </p>

      {notice?.type === "connected" && (
        <p className="text-sm text-[#0a7a0a] bg-good-tint rounded-lg px-3 py-2 mb-4">QuickBooks connected.</p>
      )}
      {notice?.type === "denied" && (
        <p className="text-sm text-ink-secondary bg-[#f1f0ec] rounded-lg px-3 py-2 mb-4">
          QuickBooks connection was cancelled — nothing changed.
        </p>
      )}
      {notice?.type === "error" && (
        <p className="text-sm text-critical bg-critical-tint rounded-lg px-3 py-2 mb-4">
          Couldn&apos;t connect QuickBooks{notice.message ? `: ${notice.message}` : "."}
        </p>
      )}

      {connection ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 text-sm">
            <CheckCircle2 className="h-4.5 w-4.5 text-[#0a7a0a] shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-ink">
                Connected{connection.company_name ? ` — ${connection.company_name}` : ""}
              </p>
              <p className="text-ink-muted text-xs mt-0.5">
                {connection.environment === "sandbox" ? "Sandbox (test) mode" : "Production"} · since{" "}
                {formatDate(connection.connected_at)}
              </p>
            </div>
          </div>
          <form action={disconnectQuickBooksAction}>
            <Button type="submit" variant="ghost" className="text-sm text-critical">
              Disconnect
            </Button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 text-sm text-ink-secondary">
            <AlertTriangle className="h-4.5 w-4.5 text-ink-muted shrink-0 mt-0.5" />
            <p>Not connected yet.</p>
          </div>
          <a href="/api/quickbooks/connect">
            <Button type="button" className="text-sm">
              Connect QuickBooks
            </Button>
          </a>
        </div>
      )}
    </Card>
  );
}
