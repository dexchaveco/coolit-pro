"use client";

import { useTransition } from "react";
import { Field, Input, Select, Button } from "@/components/ui";
import { updateJobScheduleAction } from "@/lib/actions/jobs";
import type { JobRow, UserRow } from "@/lib/types";

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso.includes("T") ? iso : iso.replace(" ", "T") + "Z");
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RescheduleForm({ job, users }: { job: JobRow; users: UserRow[] }) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const scheduledAt = String(formData.get("scheduled_at") || "");
    const assignedTo = formData.get("assigned_to") ? Number(formData.get("assigned_to")) : null;
    startTransition(() => updateJobScheduleAction(job.id, scheduledAt, assignedTo));
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <Field label="Date &amp; time">
        <Input name="scheduled_at" type="datetime-local" defaultValue={toLocalInputValue(job.scheduled_at)} />
      </Field>
      <Field label="Assigned to">
        <Select name="assigned_to" defaultValue={job.assigned_to ?? ""}>
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" variant="secondary" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Update schedule"}
      </Button>
    </form>
  );
}
