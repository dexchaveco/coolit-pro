import { listUsers } from "@/lib/data";
import { createLeadAction } from "@/lib/actions/intake";
import { PageHeader, Card, Field, Input, Textarea, Select, Button } from "@/components/ui";

export default async function NewLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ customer_name?: string; phone?: string; issue_description?: string }>;
}) {
  const users = listUsers();
  const params = await searchParams;

  return (
    <div className="max-w-xl">
      <PageHeader title="New lead" subtitle="Log a call, text, or walk-in the moment it comes in." />
      <Card className="p-5">
        <form
          action={async (formData: FormData) => {
            "use server";
            await createLeadAction(formData);
          }}
          className="space-y-4"
        >
          <Field label="Name">
            <Input name="customer_name" defaultValue={params.customer_name} required autoFocus placeholder="Caller's name" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <Input name="phone" type="tel" defaultValue={params.phone} placeholder="(305) 555-0100" />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" placeholder="optional" />
            </Field>
          </div>
          <Field label="Address">
            <Input name="address" placeholder="Where's the job?" />
          </Field>
          <Field label="What do they need?">
            <Textarea name="issue_description" rows={3} defaultValue={params.issue_description} placeholder="AC not cooling, annual maintenance, new install quote, etc." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="How did it come in?">
              <Select name="source" defaultValue="phone">
                <option value="phone">Phone call</option>
                <option value="text">Text message</option>
                <option value="referral">Referral</option>
                <option value="web">Website / online</option>
                <option value="walk-in">Walk-in</option>
                <option value="other">Other</option>
              </Select>
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
            Save lead
          </Button>
        </form>
      </Card>
    </div>
  );
}
