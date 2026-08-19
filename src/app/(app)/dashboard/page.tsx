import { getDashboardStats, listActivity, listJobsForSchedule, listLeads } from "@/lib/data";
import { PageHeader, StatTile, Card, StatusBadge, EmptyState, LinkButton } from "@/components/ui";
import { formatCents, formatDateTime, timeAgo } from "@/lib/utils";
import { PhoneIncoming } from "lucide-react";

export default async function DashboardPage() {
  const stats = getDashboardStats();
  const activity = listActivity(12);
  const openLeads = listLeads().filter((l) => l.status === "NEW" || l.status === "CONTACTED").slice(0, 5);

  const now = new Date();
  const start = now.toISOString().slice(0, 10);
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const todaysJobs = listJobsForSchedule(start, end);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Everything coming in and going out, in one place — not just in Rick's head."
        actions={<LinkButton href="/intake">View intake board</LinkButton>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatTile label="Open leads" value={stats.newLeads} href="/intake" tone={stats.newLeads > 3 ? "warning" : "default"} />
        <StatTile label="Jobs today" value={stats.jobsToday} href="/schedule" />
        <StatTile label="Missed calls today" value={stats.missedCallsToday} tone={stats.missedCallsToday > 0 ? "critical" : "default"} />
        <StatTile label="Jobs this week" value={stats.jobsThisWeek} href="/schedule" />
        <StatTile label="Open invoices" value={formatCents(stats.openInvoicesTotal)} href="/invoices" />
        <StatTile label="Collected this month" value={formatCents(stats.paidThisMonth)} tone="good" href="/invoices" />
        <StatTile label="Active maintenance plans" value={stats.activeMaintenancePlans} href="/maintenance" />
        <StatTile label="Maintenance overdue" value={stats.overdueMaintenance} tone={stats.overdueMaintenance > 0 ? "warning" : "default"} href="/maintenance" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Needs a response</h2>
            <PhoneIncoming className="h-4 w-4 text-ink-muted" />
          </div>
          {openLeads.length === 0 ? (
            <EmptyState title="Intake is clear" subtitle="No open leads or calls waiting on a response right now." />
          ) : (
            <div className="space-y-2">
              {openLeads.map((lead) => (
                <a
                  key={lead.id}
                  href={`/intake/${lead.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-hairline p-3 hover:border-brand/40"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">{lead.customer_name}</p>
                    <p className="text-sm text-ink-secondary truncate">{lead.issue_description || lead.phone || "No details yet"}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </a>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-ink mb-4">Today&apos;s schedule</h2>
          {todaysJobs.length === 0 ? (
            <EmptyState title="Nothing scheduled today" subtitle="Jobs you schedule will show up here." />
          ) : (
            <div className="space-y-2">
              {todaysJobs.map((job) => (
                <a
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-hairline p-3 hover:border-brand/40"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">{job.title}</p>
                    <p className="text-sm text-ink-secondary truncate">
                      {job.customer_name} · {job.assigned_to_name || "Unassigned"} · {formatDateTime(job.scheduled_at)}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </a>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5 mt-6">
        <h2 className="font-semibold text-ink mb-4">Recent activity</h2>
        {activity.length === 0 ? (
          <EmptyState title="Nothing yet" subtitle="Activity across the whole team will show up here as it happens." />
        ) : (
          <ul className="space-y-3">
            {activity.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                <p className="text-ink-secondary">
                  <span className="font-medium text-ink">{a.user_name || "Someone"}</span> {a.action}
                  {a.details ? <span className="text-ink-muted"> — {a.details}</span> : null}
                  <span className="text-ink-muted"> · {timeAgo(a.created_at)}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
