import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listUsers } from "@/lib/data";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  if (listUsers().length === 0) redirect("/setup");
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white text-2xl font-bold">
            C
          </div>
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Coolit Pro</h1>
          <p className="text-ink-secondary mt-1">Cool It With Rick — team console</p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
