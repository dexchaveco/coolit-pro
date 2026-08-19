"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { updateJobStatusAction } from "@/lib/actions/jobs";
import type { JobStatus } from "@/lib/types";

const OPTIONS: { status: JobStatus; label: string }[] = [
  { status: "UNSCHEDULED", label: "Unscheduled" },
  { status: "SCHEDULED", label: "Scheduled" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "COMPLETED", label: "Completed" },
  { status: "CANCELLED", label: "Cancelled" },
];

export function JobStatusControls({ jobId, status }: { jobId: number; status: JobStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.status}
          disabled={pending}
          onClick={() => startTransition(() => updateJobStatusAction(jobId, opt.status))}
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
