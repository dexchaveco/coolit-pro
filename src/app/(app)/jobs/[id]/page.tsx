import { notFound } from "next/navigation";
import { getJob, listJobNotes, listUsers, getInvoiceForJob } from "@/lib/data";
import { PageHeader, Card, StatusBadge, PriorityBadge, Textarea, Button, LinkButton } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import { JobStatusControls } from "@/components/job-status-controls";
import { addJobNoteAction } from "@/lib/actions/jobs";
import { RescheduleForm } from "@/components/reschedule-form";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJob(Number(id));
  if (!job) notFound();

  const notes = listJobNotes(job.id);
  const users = listUsers();
  const invoice = getInvoiceForJob(job.id);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={job.title}
        subtitle={`${job.customer_name} · ${job.address || "no address set"}`}
        actions={
          <div className="flex items-center gap-2">
            <PriorityBadge priority={job.priority} />
            <StatusBadge status={job.status} />
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-2">Details</h2>
            <p className="text-sm text-ink-secondary whitespace-pre-wrap">{job.description || "No details added."}</p>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Notes &amp; timeline</h2>
            {notes.length === 0 ? (
              <p className="text-sm text-ink-muted mb-4">No notes yet.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {notes.map((n) => (
                  <div key={n.id} className="text-sm">
                    <p className="text-ink">{n.note}</p>
                    <p className="text-ink-muted text-xs mt-0.5">
                      {n.user_name || "Someone"} · {timeAgo(n.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <form action={addJobNoteAction} className="space-y-2 border-t border-hairline pt-4">
              <input type="hidden" name="job_id" value={job.id} />
              <Textarea name="note" rows={2} placeholder="What happened on this job?" required />
              <Button type="submit" variant="secondary">
                Add note
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Status</h2>
            <JobStatusControls jobId={job.id} status={job.status} />
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Schedule</h2>
            <RescheduleForm job={job} users={users} />
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Billing</h2>
            {invoice ? (
              <LinkButton href={`/invoices/${invoice.id}`} className="w-full">
                View invoice {invoice.invoice_number}
              </LinkButton>
            ) : (
              <LinkButton href={`/invoices/new?job_id=${job.id}&customer_id=${job.customer_id}`} className="w-full">
                Create invoice
              </LinkButton>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
