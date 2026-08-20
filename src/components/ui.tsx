import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/utils";
import Link from "next/link";
import { forwardRef, type ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-hairline bg-surface shadow-sm", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-ink-secondary mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-brand-tint text-brand-dark",
  CONTACTED: "bg-warning-tint text-[#8a5a00]",
  SCHEDULED: "bg-brand-tint text-brand-dark",
  WON: "bg-good-tint text-[#0a7a0a]",
  LOST: "bg-critical-tint text-[#a12e2e]",
  UNSCHEDULED: "bg-[#f1f0ec] text-ink-secondary",
  IN_PROGRESS: "bg-warning-tint text-[#8a5a00]",
  COMPLETED: "bg-good-tint text-[#0a7a0a]",
  INVOICED: "bg-brand-tint text-brand-dark",
  CANCELLED: "bg-[#f1f0ec] text-ink-muted",
  DRAFT: "bg-[#f1f0ec] text-ink-secondary",
  SENT: "bg-brand-tint text-brand-dark",
  PAID: "bg-good-tint text-[#0a7a0a]",
  OVERDUE: "bg-critical-tint text-[#a12e2e]",
  VOID: "bg-[#f1f0ec] text-ink-muted",
  ACTIVE: "bg-good-tint text-[#0a7a0a]",
  PAUSED: "bg-warning-tint text-[#8a5a00]",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        STATUS_STYLES[status] || "bg-[#f1f0ec] text-ink-secondary"
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "emergency") {
    return (
      <span className="inline-flex items-center rounded-full bg-critical-tint px-2.5 py-1 text-xs font-medium text-[#a12e2e]">
        Emergency
      </span>
    );
  }
  if (priority === "urgent") {
    return (
      <span className="inline-flex items-center rounded-full bg-serious-tint px-2.5 py-1 text-xs font-medium text-[#8a4325]">
        Urgent
      </span>
    );
  }
  return null;
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "bg-[#f1f0ec] text-ink hover:bg-[#e6e5df]",
    ghost: "bg-transparent text-ink-secondary hover:bg-[#f1f0ec]",
    danger: "bg-critical text-white hover:bg-[#a12e2e]",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "bg-[#f1f0ec] text-ink hover:bg-[#e6e5df]",
    ghost: "bg-transparent text-ink-secondary hover:bg-[#f1f0ec]",
  };
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
        styles[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
        props.className
      )}
    />
  );
}

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea(props, ref) {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          "w-full rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
          props.className
        )}
      />
    );
  }
);

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-hairline bg-surface px-3.5 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
        props.className
      )}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-sm font-medium text-ink-secondary mb-1.5">{children}</label>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function Avatar({ name, color }: { name: string; color?: string | null }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shrink-0"
      style={{ backgroundColor: color || "#2a78d6" }}
    >
      {initials}
    </div>
  );
}

export function StatTile({
  label,
  value,
  tone = "default",
  href,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "warning" | "critical";
  href?: string;
}) {
  const toneStyles: Record<string, string> = {
    default: "text-ink",
    good: "text-good",
    warning: "text-[#8a5a00]",
    critical: "text-critical",
  };
  const content = (
    <>
      <p className="text-sm text-ink-secondary">{label}</p>
      <p className={cn("mt-1.5 text-3xl font-semibold tracking-tight", toneStyles[tone])}>{value}</p>
    </>
  );
  if (href) {
    return (
      <Link href={href} className="block rounded-2xl border border-hairline bg-surface p-5 shadow-sm hover:border-brand/40 transition-colors">
        {content}
      </Link>
    );
  }
  return <div className="rounded-2xl border border-hairline bg-surface p-5 shadow-sm">{content}</div>;
}

export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline py-16 px-6 text-center">
      <p className="text-ink font-medium">{title}</p>
      {subtitle && <p className="text-ink-secondary text-sm mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
