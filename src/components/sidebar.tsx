"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/nav-items";
import type { SessionUser } from "@/lib/auth";

export function Sidebar({ session }: { session: SessionUser }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r border-hairline bg-surface sticky top-0 h-screen shrink-0">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white text-lg font-bold">
          C
        </div>
        <div>
          <p className="font-semibold text-ink leading-none">Coolit Pro</p>
          <p className="text-xs text-ink-muted leading-none mt-0.5">Cool It With Rick</p>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand-tint text-brand-dark" : "text-ink-secondary hover:bg-page hover:text-ink"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-5 pt-2">
        <div className="rounded-xl bg-page px-3 py-2.5 text-xs text-ink-muted">
          Signed in as <span className="font-medium text-ink-secondary">{session.name}</span>
        </div>
      </div>
    </aside>
  );
}
