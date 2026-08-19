import { listCustomers, listUsers } from "@/lib/data";
import { createJobAction } from "@/lib/actions/jobs";
import { PageHeader, Card, Field, Input, Textarea, Select, Button } from "@/components/ui";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; lead_id?: string }>;
}) {
  const { customer_id, lead_id } = await searchParams;
  const customers = listCustomers();
  const users = listUsers();

  return (
    <div className="max-w-xl">
      <PageHeader title="New job" />
      <Card className="p-5">
        <form
          action={async (formData: FormData) => {
            "use server";
            await createJobAction(formData);
          }}
          className="space-y-4"
        >
          {lead_id && <input type="hidden" name="lead_id" value={lead_id} />}
          <Field label="Customer">
            <Select name="customer_id" defaultValue={customer_id || ""} required>
              <option value="" disabled>
                Select a customer
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Job title">
            <Input name="title" placeholder="e.g. AC not cooling — diagnose and repair" required autoFocus />
          </Field>
          <Field label="Details">
            <Textarea name="description" rows={3} />
          </Field>
          <Field label="Job address (if different from customer's)">
            <Input name="address" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type">
              <Select name="job_type" defaultValue="service">
                <option value="service">Service call</option>
                <option value="install">Install</option>
                <option value="maintenance">Maintenance visit</option>
                <option value="estimate">Estimate</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Priority">
              <Select name="priority" defaultValue="normal">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Scheduled for">
              <Input name="scheduled_at" type="datetime-local" />
            </Field>
            <Field label="Assign to">
              <Select name="assigned_to" defaultValue="">
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit" className="w-full">
            Save job
          </Button>
        </form>
      </Card>
    </div>
  );
}
