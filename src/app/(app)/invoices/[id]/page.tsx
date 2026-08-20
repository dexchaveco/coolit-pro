import { notFound } from "next/navigation";
import { getInvoice, listInvoiceLineItems } from "@/lib/data";
import { PageHeader, Card, StatusBadge, Button } from "@/components/ui";
import { formatCents, formatDate } from "@/lib/utils";
import { updateInvoiceStatusAction } from "@/lib/actions/invoices";
import { QboSyncPanel } from "@/components/qbo-sync-panel";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = getInvoice(Number(id));
  if (!invoice) notFound();

  const lineItems = listInvoiceLineItems(invoice.id);

  return (
    <div className="max-w-2xl">
      <PageHeader title={invoice.invoice_number} subtitle={invoice.customer_name} actions={<StatusBadge status={invoice.status} />} />

      <div className="mb-4">
        <QboSyncPanel invoice={invoice} />
      </div>

      <Card className="p-6">
        <div className="flex justify-between text-sm text-ink-secondary mb-6">
          <span>Created {formatDate(invoice.created_at)}</span>
          <span>Due {formatDate(invoice.due_date)}</span>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-left text-ink-muted border-b border-hairline">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 font-medium text-right">Qty</th>
              <th className="py-2 font-medium text-right">Price</th>
              <th className="py-2 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr key={item.id} className="border-b border-hairline align-top">
                <td className="py-2.5 pr-4 text-ink whitespace-pre-wrap">{item.description}</td>
                <td className="py-2.5 text-right text-ink-secondary whitespace-nowrap">{item.quantity}</td>
                <td className="py-2.5 text-right text-ink-secondary whitespace-nowrap">{formatCents(item.unit_price_cents)}</td>
                <td className="py-2.5 text-right text-ink font-medium whitespace-nowrap">{formatCents(item.amount_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-48 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-secondary">Subtotal</span>
              <span className="text-ink">{formatCents(invoice.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">Tax</span>
              <span className="text-ink">{formatCents(invoice.tax_cents)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-1.5 border-t border-hairline">
              <span className="text-ink">Total</span>
              <span className="text-ink">{formatCents(invoice.total_cents)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && <p className="text-sm text-ink-secondary mt-6 border-t border-hairline pt-4">{invoice.notes}</p>}
      </Card>

      <div className="flex gap-2 mt-4">
        {invoice.status === "DRAFT" && (
          <form action={updateInvoiceStatusAction.bind(null, invoice.id, "SENT")}>
            <Button type="submit">Mark as sent</Button>
          </form>
        )}
        {invoice.status !== "PAID" && (
          <form action={updateInvoiceStatusAction.bind(null, invoice.id, "PAID")}>
            <Button type="submit" variant="secondary">
              Mark as paid
            </Button>
          </form>
        )}
        {invoice.status !== "VOID" && invoice.status !== "PAID" && (
          <form action={updateInvoiceStatusAction.bind(null, invoice.id, "VOID")}>
            <Button type="submit" variant="ghost">
              Void
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
