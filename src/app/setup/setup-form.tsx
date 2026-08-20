"use client";

import { useActionState } from "react";
import { createOwnerAccountAction } from "@/lib/actions/auth";
import { Button, Card, Field, Input } from "@/components/ui";

type State = { error?: string };

export function SetupForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const result = await createOwnerAccountAction(formData);
      return result || {};
    },
    {}
  );

  return (
    <Card className="p-6">
      <form action={formAction} className="space-y-4">
        <Field label="Your name">
          <Input name="name" placeholder="Dexter Chaveco" required autoFocus autoComplete="name" />
        </Field>
        <Field label="Email">
          <Input type="email" name="email" placeholder="you@coolitwithrick.com" required autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input type="password" name="password" placeholder="At least 6 characters" required autoComplete="new-password" />
        </Field>
        {state?.error && (
          <p className="rounded-xl bg-critical-tint px-3 py-2 text-sm text-[#a12e2e]">{state.error}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating your account…" : "Create account"}
        </Button>
      </form>
    </Card>
  );
}
