"use client";

import { useTransition } from "react";
import { Select } from "@/components/ui";
import { assignLeadAction } from "@/lib/actions/intake";
import type { UserRow } from "@/lib/types";

export function AssignLeadSelect({
  leadId,
  users,
  assignedTo,
}: {
  leadId: number;
  users: UserRow[];
  assignedTo: number | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={assignedTo ?? ""}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value ? Number(e.target.value) : null;
        startTransition(() => assignLeadAction(leadId, value));
      }}
    >
      <option value="">Unassigned</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </Select>
  );
}
