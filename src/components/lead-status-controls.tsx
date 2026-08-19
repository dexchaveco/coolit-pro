"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { updateLeadStatusAction } from "@/lib/actions/intake";
import type { LeadStatus } from "@/lib/types";

const OPTIONS: { status: LeadStatus; label: string }[] = [
  { status: "NEW", label: "New" },
  { status: "CONTACTED", label: "Contacted" },
  { status: "SCHEDULED", label: "Scheduled" },
  { status: "WON", label: "Won" },
  { status: "LOST", label: "Lost" },
];

export function LeadStatusControls({ leadId, status }: { leadId: number; status: LeadStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.status}
          disabled={pending}
          onClick={() => startTransition(() => updateLeadStatusAction(leadId, opt.status))}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            status === opt.status ? "bg-brand text-white" : "bg-page text-ink-secondary hover:bg-brand-tint hover:text-brand-dark"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
