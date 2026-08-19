"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Button, Card, Field, Input } from "@/components/ui";

type State = { error?: string };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => {
      const result = await loginAction(formData);
      return result || {};
    },
    {}
  );

  return (
    <Card className="p-6">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next || "/dashboard"} />
        <Field label="Email">
          <Input type="email" name="email" placeholder="you@coolitwithrick.com" required autoFocus autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input type="password" name="password" placeholder="••••••••" required autoComplete="current-password" />
        </Field>
        {state?.error && (
          <p className="rounded-xl bg-critical-tint px-3 py-2 text-sm text-[#a12e2e]">{state.error}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Card>
  );
}
