import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar session={session} />
      <div className="flex flex-1 flex-col min-w-0 pb-16 md:pb-0">
        <TopBar session={session} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
