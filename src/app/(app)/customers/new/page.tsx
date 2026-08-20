import { createCustomerAction } from "@/lib/actions/customers";
import { PageHeader, Card, Field, Input, Textarea, Button } from "@/components/ui";

export default function NewCustomerPage() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Add customer" />
      <Card className="p-5">
        <form
          action={async (formData: FormData) => {
            "use server";
            await createCustomerAction(formData);
          }}
          className="space-y-4"
        >
          <Field label="Name">
            <Input name="name" required autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <Input name="phone" type="tel" />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" />
            </Field>
          </div>

          <div className="border-t border-hairline pt-4">
            <p className="text-sm font-medium text-ink-secondary mb-1">Address (optional)</p>
            <p className="text-xs text-ink-muted mb-3">
              Not required to bill — mainly useful so whoever answers next time recognizes the property.
            </p>
            <div className="space-y-4">
              <Input name="address" placeholder="Street address" />
              <div className="grid grid-cols-2 gap-4">
                <Input name="city" placeholder="City" />
                <Input name="zip" placeholder="Zip" />
              </div>
            </div>
          </div>

          <Field label="Notes">
            <Textarea name="notes" rows={3} placeholder="Equipment, access notes, anything worth knowing" />
          </Field>
          <Button type="submit" className="w-full">
            Save customer
          </Button>
        </form>
      </Card>
    </div>
  );
}
