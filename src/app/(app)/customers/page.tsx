import Link from "next/link";
import { listCustomers } from "@/lib/data";
import { PageHeader, LinkButton, Card, Input, EmptyState } from "@/components/ui";
import { formatPhone } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = listCustomers(q);

  return (
    <div>
      <PageHeader title="Customers" subtitle="Everyone Cool It With Rick has serviced." actions={<LinkButton href="/customers/new">+ Add customer</LinkButton>} />

      <form className="mb-5 max-w-sm" action="/customers" method="get">
        <Input name="q" defaultValue={q} placeholder="Search name, phone, or address" />
      </form>

      {customers.length === 0 ? (
        <EmptyState title="No customers yet" subtitle="Convert a lead from Intake, or add one directly." />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-hairline">
            {customers.map((c) => (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-page"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink flex items-center gap-2">
                    {c.name}
                    {!!c.on_maintenance_plan && <ShieldCheck className="h-3.5 w-3.5 text-good" />}
                  </p>
                  <p className="text-sm text-ink-secondary truncate">{c.address || "No address on file"}</p>
                </div>
                <p className="text-sm text-ink-muted shrink-0">{formatPhone(c.phone)}</p>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
