import { listLeads, listRecentCalls, listUsers } from "@/lib/data";
import { PageHeader, LinkButton, Card } from "@/components/ui";
import { LeadCard } from "@/components/lead-card";
import { UnclaimedCallRow } from "@/components/unclaimed-call-row";
import type { LeadStatus } from "@/lib/types";

const COLUMNS: { status: LeadStatus; label: string }[] = [
  { status: "NEW", label: "New" },
  { status: "CONTACTED", label: "Contacted" },
  { status: "SCHEDULED", label: "Scheduled" },
  { status: "WON", label: "Won" },
  { status: "LOST", label: "Lost" },
];

export default async function IntakePage() {
  const leads = listLeads();
  const users = listUsers();
  const recentCalls = listRecentCalls(15).filter((c) => !c.lead_id && !c.customer_id);

  const byStatus: Record<string, typeof leads> = {};
  for (const col of COLUMNS) byStatus[col.status] = [];
  for (const lead of leads) {
    (byStatus[lead.status] ||= []).push(lead);
  }

  return (
    <div>
      <PageHeader
        title="Intake"
        subtitle="Every call and lead lands here first — visible to the whole team, not just whoever answered the phone."
        actions={<LinkButton href="/intake/new">+ New lead</LinkButton>}
      />

      {recentCalls.length > 0 && (
        <Card className="p-5 mb-6">
          <h2 className="font-semibold text-ink mb-3">Calls logged, not yet turned into a lead</h2>
          <div className="space-y-2">
            {recentCalls.map((call) => (
              <UnclaimedCallRow key={call.id} call={call} />
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="min-w-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-ink-secondary uppercase tracking-wide">{col.label}</h3>
              <span className="text-xs text-ink-muted bg-page rounded-full px-2 py-0.5">{byStatus[col.status].length}</span>
            </div>
            <div className="space-y-3">
              {byStatus[col.status].length === 0 ? (
                <div className="rounded-xl border border-dashed border-hairline p-4 text-center text-xs text-ink-muted">
                  Nothing here
                </div>
              ) : (
                byStatus[col.status].map((lead) => <LeadCard key={lead.id} lead={lead} users={users} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
