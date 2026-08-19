"use client";

import { useRef, useState, useTransition } from "react";
import { Phone, X } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { logManualCallAction } from "@/lib/actions/intake";

export function QuickLogCallButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await logManualCallAction(formData);
      formRef.current?.reset();
      setOpen(false);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="!px-3.5 md:!px-4">
        <Phone className="h-4 w-4" />
        <span className="hidden sm:inline">Log a call</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-surface p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink">Log a call</h2>
              <button onClick={() => setOpen(false)} className="p-1 text-ink-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-ink-secondary mb-4">
              Anyone who picks up the phone logs it here — so nothing depends on one person remembering to pass it along.
            </p>
            <form ref={formRef} action={handleSubmit} className="space-y-3">
              <Field label="Caller name">
                <Input name="caller_name" placeholder="Who called" />
              </Field>
              <Field label="Phone number">
                <Input name="caller_number" placeholder="(305) 555-0100" type="tel" />
              </Field>
              <Field label="Direction">
                <Select name="direction" defaultValue="inbound">
                  <option value="inbound">Inbound (they called us)</option>
                  <option value="outbound">Outbound (we called them)</option>
                  <option value="missed">Missed</option>
                </Select>
              </Field>
              <Field label="What's it about?">
                <Textarea name="notes" rows={3} placeholder="AC not cooling, wants a quote, follow-up on invoice, etc." required />
              </Field>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Saving…" : "Save call"}
              </Button>
              <p className="text-xs text-ink-muted text-center">
                Need to turn this into a job? Save it here, then create a lead from the Intake board.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
