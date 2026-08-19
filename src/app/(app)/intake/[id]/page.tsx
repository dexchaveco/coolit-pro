import { notFound } from "next/navigation";
import { getLead, listCallsForLead, listUsers } from "@/lib/data";
import { PageHeader, Card, StatusBadge, LinkButton, Textarea, Button, Select, Field } from "@/components/ui";
import { formatPhone, formatDateTime, timeAgo } from "@/lib/utils";
import { addLeadNoteCallAction, convertLeadToCustomerAction } from "@/lib/actions/intake";
import { LeadStatusControls } from "@/components/lead-status-controls";
import { AssignLeadSelect } from "@/components/assign-lead-select";
import { PhoneMissed, Phone, PhoneOutgoing } from "lucide-react";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = getLead(Number(id));
  if (!lead) notFound();

  const calls = listCallsForLead(lead.id);
  const users = listUsers();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={lead.customer_name}
        subtitle={`Came in via ${lead.source} · ${timeAgo(lead.created_at)}`}
        actions={<StatusBadge status={lead.status} />}
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Details</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-ink-muted">Phone</dt>
                <dd className="text-ink font-medium">{formatPhone(lead.phone)}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Email</dt>
                <dd className="text-ink font-medium">{lead.email || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink-muted">Address</dt>
                <dd className="text-ink font-medium">{lead.address || "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink-muted">What they need</dt>
                <dd className="text-ink font-medium">{lead.issue_description || "—"}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Call history</h2>
            {calls.length === 0 ? (
              <p className="text-sm text-ink-muted">No calls logged yet.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {calls.map((call) => {
                  const Icon = call.direction === "missed" ? PhoneMissed : call.direction === "outbound" ? PhoneOutgoing : Phone;
                  return (
                    <div key={call.id} className="flex gap-3 text-sm">
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${call.direction === "missed" ? "text-critical" : "text-ink-muted"}`} />
                      <div>
                        <p className="text-ink">{call.notes}</p>
                        <p className="text-ink-muted text-xs mt-0.5">
                          {call.taken_by_name || "System"} · {formatDateTime(call.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <form action={addLeadNoteCallAction} className="space-y-2 border-t border-hairline pt-4">
              <input type="hidden" name="lead_id" value={lead.id} />
              <Field label="Log another call or note">
                <Textarea name="notes" rows={2} placeholder="What did you talk about?" required />
              </Field>
              <div className="flex items-center gap-2">
                <Select name="direction" defaultValue="inbound" className="max-w-[180px]">
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                  <option value="missed">Missed</option>
                </Select>
                <Button type="submit" variant="secondary">
                  Add
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Move this lead</h2>
            <LeadStatusControls leadId={lead.id} status={lead.status} />
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Assigned to</h2>
            <AssignLeadSelect leadId={lead.id} users={users} assignedTo={lead.assigned_to} />
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-ink mb-3">Next step</h2>
            {lead.customer_id ? (
              <LinkButton href={`/jobs/new?customer_id=${lead.customer_id}&lead_id=${lead.id}`} className="w-full">
                Create a job
              </LinkButton>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await convertLeadToCustomerAction(lead.id);
                }}
              >
                <Button type="submit" className="w-full">
                  Convert to customer
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
