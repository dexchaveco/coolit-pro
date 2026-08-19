import { getSession } from "@/lib/auth";
import { listUsers } from "@/lib/data";
import { PageHeader, Card, Avatar } from "@/components/ui";
import { InviteTeamForm } from "@/components/invite-team-form";
import { ChangePasswordForm } from "@/components/change-password-form";
import { CallWebhookInfo } from "@/components/call-webhook-info";

export default async function SettingsPage() {
  const session = await getSession();
  const users = listUsers();

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Team access and how calls get into Coolit Pro." />

      <Card className="p-5">
        <h2 className="font-semibold text-ink mb-3">Team</h2>
        <div className="space-y-2 mb-4">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3">
              <Avatar name={u.name} color={u.color} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{u.name}</p>
                <p className="text-xs text-ink-muted">{u.email} · {u.role === "OWNER" ? "Owner" : "Technician"}</p>
              </div>
            </div>
          ))}
        </div>
        {session?.role === "OWNER" && <InviteTeamForm />}
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold text-ink mb-3">Your password</h2>
        <ChangePasswordForm />
      </Card>

      {session?.role === "OWNER" && <CallWebhookInfo />}
    </div>
  );
}
