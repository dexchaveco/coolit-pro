import { redirect } from "next/navigation";
import { listUsers } from "@/lib/data";
import { SetupForm } from "./setup-form";

// First-run setup: shown once, only when the database has no users yet
// (a brand-new deployment). After the first account is created, this page
// always redirects to /login — there's no way to get back here.
//
// Forced dynamic: this page's only signal is a DB read (no cookies/headers),
// so Next.js would otherwise try to prerender it once at build time and
// bake that result in permanently — which would ignore real DB state after
// the first account is created (or before a persistent volume is attached).
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const users = listUsers();
  if (users.length > 0) redirect("/login");

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white text-2xl font-bold">
            C
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Welcome to Coolit Pro</h1>
          <p className="text-ink-secondary mt-1">
            This is a brand-new install — set up your owner account to get started.
          </p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}
