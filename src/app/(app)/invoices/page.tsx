import Link from "next/link";
import { listInvoices } from "@/lib/data";
import { PageHeader, LinkButton, Card, StatusBadge, EmptyState } from "@/components/ui";
import { formatCents, formatDate } from "@/lib/utils";

const FILTERS = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
];

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const invoices = listInvoices(status || undefined);

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Every bill, and where it stands." actions={<LinkButton href="/invoices/new">+ New invoice</LinkButton>} />

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/invoices?status=${f.value}` : "/invoices"}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${
              (status || "") === f.value ? "bg-brand text-white" : "bg-surface border border-hairline text-ink-secondary"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {invoices.length === 0 ? (
        <EmptyState title="No invoices yet" />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-hairline">
            {invoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-page">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{inv.invoice_number}</p>
                  <p className="text-sm text-ink-secondary truncate">{inv.customer_name} · {formatDate(inv.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-ink">{formatCents(inv.total_cents)}</p>
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
