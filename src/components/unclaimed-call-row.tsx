import Link from "next/link";
import { formatPhone, timeAgo } from "@/lib/utils";
import type { CallLogRow } from "@/lib/types";
import { PhoneMissed, Phone, PhoneOutgoing } from "lucide-react";

export function UnclaimedCallRow({ call }: { call: CallLogRow }) {
  const Icon = call.direction === "missed" ? PhoneMissed : call.direction === "outbound" ? PhoneOutgoing : Phone;
  const params = new URLSearchParams({
    customer_name: call.caller_name || "",
    phone: call.caller_number || "",
    issue_description: call.notes || "",
  });

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline p-3">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className={`h-4 w-4 shrink-0 ${call.direction === "missed" ? "text-critical" : "text-ink-muted"}`} />
        <div className="min-w-0">
          <p className="font-medium text-ink truncate">{call.caller_name || formatPhone(call.caller_number) || "Unknown caller"}</p>
          <p className="text-sm text-ink-secondary truncate">{call.notes || "No notes"} · {call.taken_by_name || "logged"} · {timeAgo(call.created_at)}</p>
        </div>
      </div>
      <Link
        href={`/intake/new?${params.toString()}`}
        className="shrink-0 rounded-lg bg-brand-tint text-brand-dark text-xs font-medium px-3 py-2 hover:bg-brand hover:text-white transition-colors"
      >
        Turn into lead
      </Link>
    </div>
  );
}
