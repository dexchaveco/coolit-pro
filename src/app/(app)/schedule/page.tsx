import Link from "next/link";
import { listJobsForSchedule } from "@/lib/data";
import { PageHeader, Card, StatusBadge, PriorityBadge, EmptyState, LinkButton } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dayLabel(d: Date, today: Date) {
  const isToday = isoDate(d) === isoDate(today);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { weekday: isToday ? "Today" : weekday, day };
}

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = date ? new Date(date + "T00:00:00") : today;

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const dayStart = isoDate(selected);
  const dayEndDate = new Date(selected);
  dayEndDate.setDate(dayEndDate.getDate() + 1);
  const dayEnd = isoDate(dayEndDate);

  const jobs = listJobsForSchedule(dayStart, dayEnd).filter((j) => j.scheduled_at && j.scheduled_at.slice(0, 10) <= dayEnd && j.scheduled_at.slice(0, 10) >= dayStart);

  return (
    <div>
      <PageHeader title="Schedule" subtitle="What's happening, day by day." actions={<LinkButton href="/jobs/new">+ New job</LinkButton>} />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
        {days.map((d) => {
          const { weekday, day } = dayLabel(d, today);
          const active = isoDate(d) === isoDate(selected);
          return (
            <Link
              key={isoDate(d)}
              href={`/schedule?date=${isoDate(d)}`}
              className={cn(
                "shrink-0 flex flex-col items-center rounded-xl px-3.5 py-2.5 min-w-[64px] border",
                active ? "bg-brand text-white border-brand" : "bg-surface border-hairline text-ink-secondary"
              )}
            >
              <span className="text-xs font-medium">{weekday}</span>
              <span className="text-sm font-semibold">{day}</span>
            </Link>
          );
        })}
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="Nothing scheduled" subtitle="No jobs on this day yet." />
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
                    {formatDateTime(job.scheduled_at)} · {job.customer_name} · {job.assigned_to_name || "Unassigned"}
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
