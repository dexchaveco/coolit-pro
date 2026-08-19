"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { updateLeadStatusAction } from "@/lib/actions/intake";
import { formatPhone, timeAgo } from "@/lib/utils";
import type { LeadRow, LeadStatus, UserRow } from "@/lib/types";

const NEXT_STATUS: Record<string, { status: LeadStatus; label: string } | undefined> = {
  NEW: { status: "CONTACTED", label: "Mark contacted" },
  CONTACTED: { status: "SCHEDULED", label: "Mark scheduled" },
  SCHEDULED: { status: "WON", label: "Mark won" },
};

export function LeadCard({ lead }: { lead: LeadRow; users: UserRow[] }) {
  const [pending, startTransition] = useTransition();
  const next = NEXT_STATUS[lead.status];
  const canLose = lead.status === "NEW" || lead.status === "CONTACTED" || lead.status === "SCHEDULED";

  return (
    <div className="rounded-xl border border-hairline bg-surface p-3.5 shadow-sm">
      <Link href={`/intake/${lead.id}`} className="block">
        <p className="font-medium text-ink truncate">{lead.customer_name}</p>
        <p className="text-sm text-ink-secondary truncate">{formatPhone(lead.phone)}</p>
        {lead.issue_description && (
          <p className="text-sm text-ink-muted mt-1 line-clamp-2">{lead.issue_description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-ink-muted">{lead.assigned_to_name || "Unassigned"} · {timeAgo(lead.created_at)}</span>
        </div>
      </Link>
      <div className="flex items-center gap-2 mt-3">
        {next && (
          <button
            disabled={pending}
            onClick={() => startTransition(() => updateLeadStatusAction(lead.id, next.status))}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-brand-tint text-brand-dark text-xs font-medium px-2.5 py-2 hover:bg-brand hover:text-white transition-colors"
          >
            {next.label} <ArrowRight className="h-3 w-3" />
          </button>
        )}
        {canLose && (
          <button
            disabled={pending}
            onClick={() => startTransition(() => updateLeadStatusAction(lead.id, "LOST"))}
            className="inline-flex items-center justify-center rounded-lg px-2 py-2 text-ink-muted hover:bg-critical-tint hover:text-critical transition-colors"
            title="Mark lost"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
