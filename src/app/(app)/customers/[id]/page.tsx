import { notFound } from "next/navigation";
import { getCustomer, getCustomerInvoices, getCustomerJobs, listMaintenancePlans } from "@/lib/data";
import { PageHeader, Card, StatusBadge, LinkButton, EmptyState } from "@/components/ui";
import { formatCents, formatDate } from "@/lib/utils";
import { CustomerEditForm } from "@/components/customer-edit-form";
import { MaintenancePlanCard } from "@/components/maintenance-plan-card";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = getCustomer(Number(id));
  if (!customer) notFound();

  const jobs = getCustomerJobs(customer.id);
  const invoices = getCustomerInvoices(customer.id);
  const plan = listMaintenancePlans().find((p) => p.customer_id === customer.id);

  return (
    <div>
      <PageHeader
        title={customer.name}
        subtitle={customer.address ? `${customer.address}${customer.city ? ", " + customer.city : ""}` : "No address on file"}
        actions={<LinkButton href={`/jobs/new?customer_id=${customer.id}`}>+ New job</LinkButton>}
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Jobs</h2>
            {jobs.length === 0 ? (
              <EmptyState title="No jobs yet" />
            ) : (
              <div className="space-y-2">
                {jobs.map((job) => (
                  <a key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-hairline p-3 hover:border-brand/40">
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate">{job.title}</p>
                      <p className="text-sm text-ink-secondary">{formatDate(job.scheduled_at)} · {job.assigned_to_name || "Unassigned"}</p>
                    </div>
                    <StatusBadge status={job.status} />
                  </a>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Invoices</h2>
            {invoices.length === 0 ? (
              <EmptyState title="No invoices yet" />
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <a key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-hairline p-3 hover:border-brand/40">
                    <div>
                      <p className="font-medium text-ink">{inv.invoice_number}</p>
                      <p className="text-sm text-ink-secondary">{formatDate(inv.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink">{formatCents(inv.total_cents)}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Contact info</h2>
            <CustomerEditForm customer={customer} />
          </Card>

          <MaintenancePlanCard customer={customer} plan={plan} />
        </div>
      </div>
    </div>
  );
}
