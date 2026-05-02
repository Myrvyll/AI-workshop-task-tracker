import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-100 md:min-h-dvh md:flex-row dark:bg-zinc-950">
      <AppSidebar />
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-gradient-to-b from-zinc-50 via-zinc-50 to-zinc-100/80 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
        {children}
      </main>
    </div>
  );
}
