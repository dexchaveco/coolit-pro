"use client";

import { useActionState } from "react";
import { Field, Input, Button } from "@/components/ui";
import { updateOwnPasswordAction } from "@/lib/actions/team";

type State = { error?: string; success?: boolean };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => (await updateOwnPasswordAction(formData)) || {},
    {}
  );

  return (
    <form action={formAction} className="space-y-3">
      <Field label="New password">
        <Input name="password" type="password" required minLength={6} />
      </Field>
      {state?.error && <p className="text-sm text-critical">{state.error}</p>}
      {state?.success && <p className="text-sm text-good">Password updated.</p>}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}
