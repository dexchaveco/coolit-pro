import Link from "next/link";
import { listMaintenancePlans } from "@/lib/data";
import { PageHeader, Card, StatusBadge, EmptyState } from "@/components/ui";
import { formatCents, formatDate, formatPhone } from "@/lib/utils";

export default async function MaintenancePage() {
  const plans = listMaintenancePlans();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Maintenance plans"
        subtitle="Recurring plan customers and when they're due for a visit. Start a plan from any customer's page."
      />

      {plans.length === 0 ? (
        <EmptyState title="No maintenance plans yet" subtitle="Add one from a customer's profile." />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-hairline">
            {plans.map((plan) => {
              const overdue = plan.status === "ACTIVE" && plan.next_visit_due && plan.next_visit_due < today;
              return (
                <Link key={plan.id} href={`/customers/${plan.customer_id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-page">
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">{plan.customer_name}</p>
                    <p className="text-sm text-ink-secondary truncate">
                      {plan.plan_name} · {formatCents(plan.monthly_price_cents)}/mo · {formatPhone(plan.customer_phone)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-medium ${overdue ? "text-critical" : "text-ink"}`}>
                      {overdue ? "Overdue: " : "Due "}
                      {formatDate(plan.next_visit_due)}
                    </p>
                    <StatusBadge status={plan.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
