import { updateCustomerAction } from "@/lib/actions/customers";
import { Field, Input, Textarea, Button } from "@/components/ui";
import type { CustomerRow } from "@/lib/types";

export function CustomerEditForm({ customer }: { customer: CustomerRow }) {
  return (
    <form action={updateCustomerAction.bind(null, customer.id)} className="space-y-3">
      <Field label="Name">
        <Input name="name" defaultValue={customer.name} required />
      </Field>
      <Field label="Phone">
        <Input name="phone" type="tel" defaultValue={customer.phone ?? ""} />
      </Field>
      <Field label="Email">
        <Input name="email" type="email" defaultValue={customer.email ?? ""} />
      </Field>
      <Field label="Address (optional)">
        <Input name="address" defaultValue={customer.address ?? ""} placeholder="Not required to bill" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City">
          <Input name="city" defaultValue={customer.city ?? ""} />
        </Field>
        <Field label="Zip">
          <Input name="zip" defaultValue={customer.zip ?? ""} />
        </Field>
      </div>
      <Field label="Notes">
        <Textarea name="notes" rows={3} defaultValue={customer.notes ?? ""} />
      </Field>
      <Button type="submit" variant="secondary" className="w-full">
        Save changes
      </Button>
    </form>
  );
}
