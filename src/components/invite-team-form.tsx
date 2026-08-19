"use client";

import { useActionState } from "react";
import { Field, Input, Select, Button } from "@/components/ui";
import { inviteTeamMemberAction } from "@/lib/actions/team";

type State = { error?: string; success?: boolean };

export function InviteTeamForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => (await inviteTeamMemberAction(formData)) || {},
    {}
  );

  return (
    <form action={formAction} className="space-y-3 border-t border-hairline pt-4">
      <p className="text-sm font-medium text-ink-secondary">Add a team member</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name">
          <Input name="name" required />
        </Field>
        <Field label="Role">
          <Select name="role" defaultValue="TECH">
            <option value="TECH">Technician</option>
            <option value="OWNER">Owner</option>
          </Select>
        </Field>
      </div>
      <Field label="Email">
        <Input name="email" type="email" required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone">
          <Input name="phone" type="tel" />
        </Field>
        <Field label="Temporary password">
          <Input name="password" type="text" required minLength={6} />
        </Field>
      </div>
      {state?.error && <p className="text-sm text-critical">{state.error}</p>}
      {state?.success && <p className="text-sm text-good">Added — share the login with them directly.</p>}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Adding…" : "Add team member"}
      </Button>
    </form>
  );
}
