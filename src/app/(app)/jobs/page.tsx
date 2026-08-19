import Link from "next/link";
import { listJobs } from "@/lib/data";
import { PageHeader, LinkButton, Card, StatusBadge, PriorityBadge, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

const FILTERS = [
  { value: "", label: "All" },
  { value: "UNSCHEDULED", label: "Unscheduled" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "INVOICED", label: "Invoiced" },
];

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const jobs = listJobs(status || undefined);

  return (
    <div>
      <PageHeader title="Jobs" subtitle="Every job, who's on it, and where it stands." actions={<LinkButton href="/jobs/new">+ New job</LinkButton>} />

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/jobs?status=${f.value}` : "/jobs"}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${
              (status || "") === f.value ? "bg-brand text-white" : "bg-surface border border-hairline text-ink-secondary"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No jobs here" subtitle="Create one from a customer page or the button above." />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-hairline">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-page">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate flex items-center gap-2">
                    {job.title}
                    <PriorityBadge priority={job.priority} />
                  </p>
                  <p className="text-sm text-ink-secondary truncate">
                    {job.customer_name} · {job.assigned_to_name || "Unassigned"} · {formatDateTime(job.scheduled_at)}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
