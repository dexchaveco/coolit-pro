import { logoutAction } from "@/lib/actions/auth";
import { Avatar } from "@/components/ui";
import { LogOut } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { QuickLogCallButton } from "@/components/quick-log-call";

export function TopBar({ session }: { session: SessionUser }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-hairline bg-surface/95 backdrop-blur px-4 py-3 md:px-8">
      <div className="md:hidden flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white text-sm font-bold">
          C
        </div>
        <span className="font-semibold text-ink">Coolit Pro</span>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <QuickLogCallButton />
        <div className="flex items-center gap-2">
          <Avatar name={session.name} />
          <span className="hidden sm:block text-sm font-medium text-ink">{session.name}</span>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Sign out"
            className="flex items-center justify-center rounded-xl p-2.5 text-ink-muted hover:bg-page hover:text-ink"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </form>
      </div>
    </header>
  );
}
