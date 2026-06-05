import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AccessProvider, useAccess } from "@/hooks/use-access";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: () => (
    <AccessProvider>
      <Gate />
    </AccessProvider>
  ),
});

function Gate() {
  const { role, loading } = useAccess();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !role) navigate({ to: "/auth", replace: true });
  }, [loading, role, navigate]);
  if (loading || !role) return null;
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-card/50 backdrop-blur px-4 sticky top-0 z-20">
            <SidebarTrigger />
            <div className="text-sm font-medium text-muted-foreground">Novza eshiklari 2016</div>
            <div className="ml-auto text-xs text-muted-foreground">
              Pozitsiya: <span className="font-medium text-foreground">{role.name}</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
