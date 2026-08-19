import {
  LayoutDashboard,
  PhoneIncoming,
  Users,
  Wrench,
  CalendarDays,
  Receipt,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/intake", label: "Intake", icon: PhoneIncoming },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Wrench },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/maintenance", label: "Plans", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];
