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
          <Field label="Address">
            <Input name="address" placeholder="Street address" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <Input name="city" />
            </Field>
            <Field label="Zip">
              <Input name="zip" />
            </Field>
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
