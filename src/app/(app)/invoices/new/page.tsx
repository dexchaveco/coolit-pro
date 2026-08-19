import { listCustomers, getJob } from "@/lib/data";
import { createInvoiceAction } from "@/lib/actions/invoices";
import { PageHeader, Card, Field, Input, Select, Textarea, Button } from "@/components/ui";
import { InvoiceLineItemsEditor } from "@/components/invoice-line-items-editor";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; job_id?: string }>;
}) {
  const { customer_id, job_id } = await searchParams;
  const customers = listCustomers();
  const job = job_id ? getJob(Number(job_id)) : undefined;

  return (
    <div className="max-w-2xl">
      <PageHeader title="New invoice" subtitle={job ? `For job: ${job.title}` : undefined} />
      <Card className="p-5">
        <form
          action={async (formData: FormData) => {
            "use server";
            await createInvoiceAction(formData);
          }}
          className="space-y-4"
        >
          {job_id && <input type="hidden" name="job_id" value={job_id} />}
          <Field label="Customer">
            <Select name="customer_id" defaultValue={customer_id || job?.customer_id || ""} required>
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

          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1.5">Line items</label>
            <InvoiceLineItemsEditor />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tax rate (%)">
              <Input name="tax_rate" type="number" step="0.01" defaultValue="0" />
            </Field>
            <Field label="Due date">
              <Input name="due_date" type="date" />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea name="notes" rows={2} placeholder="Payment terms, thank-you note, etc." />
          </Field>

          <Button type="submit" className="w-full">
            Create invoice
          </Button>
        </form>
      </Card>
    </div>
  );
}
