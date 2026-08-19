import { Card, StatusBadge, Field, Input, Button } from "@/components/ui";
import { createMaintenancePlanAction, recordMaintenanceVisitAction, updateMaintenancePlanStatusAction } from "@/lib/actions/maintenance";
import { formatCents, formatDate } from "@/lib/utils";
import type { CustomerRow, MaintenancePlanRow } from "@/lib/types";

export function MaintenancePlanCard({ customer, plan }: { customer: CustomerRow; plan?: MaintenancePlanRow }) {
  if (!plan) {
    return (
      <Card className="p-5">
        <h2 className="font-semibold text-ink mb-1">Maintenance plan</h2>
        <p className="text-sm text-ink-secondary mb-3">Not on a plan yet.</p>
        <form
          action={async (formData: FormData) => {
            "use server";
            await createMaintenancePlanAction(formData);
          }}
          className="space-y-3"
        >
          <input type="hidden" name="customer_id" value={customer.id} />
          <input type="hidden" name="plan_name" value="Cool It Care Plan" />
          <Field label="Monthly price ($)">
            <Input name="monthly_price" type="number" step="0.01" defaultValue="29" />
          </Field>
          <Field label="Visits per year">
            <Input name="visits_per_year" type="number" defaultValue="1" />
          </Field>
          <Field label="First visit due">
            <Input name="next_visit_due" type="date" />
          </Field>
          <Button type="submit" variant="secondary" className="w-full">
            Start plan
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-ink">Maintenance plan</h2>
        <StatusBadge status={plan.status} />
      </div>
      <dl className="text-sm space-y-1.5 mb-4">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Plan</dt>
          <dd className="text-ink font-medium">{plan.plan_name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Price</dt>
          <dd className="text-ink font-medium">{formatCents(plan.monthly_price_cents)}/mo</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Next visit due</dt>
          <dd className="text-ink font-medium">{formatDate(plan.next_visit_due)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">Last visit</dt>
          <dd className="text-ink font-medium">{formatDate(plan.last_visit_at)}</dd>
        </div>
      </dl>
      <form action={recordMaintenanceVisitAction.bind(null, plan.id, "")} className="mb-2">
        <Button type="submit" variant="secondary" className="w-full">
          Log a visit today
        </Button>
      </form>
      {plan.status === "ACTIVE" ? (
        <form action={updateMaintenancePlanStatusAction.bind(null, plan.id, "PAUSED")}>
          <button type="submit" className="w-full text-center text-xs text-ink-muted hover:text-ink py-1">
            Pause plan
          </button>
        </form>
      ) : (
        <form action={updateMaintenancePlanStatusAction.bind(null, plan.id, "ACTIVE")}>
          <button type="submit" className="w-full text-center text-xs text-ink-muted hover:text-ink py-1">
            Reactivate plan
          </button>
        </form>
      )}
    </Card>
  );
}
