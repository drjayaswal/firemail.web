import { AppSidebar } from "@/components/chat/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import Auth from "@/components/Auth";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return <Auth />
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 min-w-0 overflow-hidden relative">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}