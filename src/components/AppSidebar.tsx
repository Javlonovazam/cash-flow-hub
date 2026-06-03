import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Settings,
  LogOut,
  Building2,
  Users,
  UserCircle,
  Package,
  Ruler,
  Tag,
  ArrowLeftRight,
  Coins,
  DollarSign,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Kassa operatsiyalari", url: "/operatsiyalar", icon: Receipt },
];

const settings = [
  { title: "Hisob raqamlar", url: "/nastroyka/accounts", icon: Wallet },
  { title: "Manbalar", url: "/nastroyka/sources", icon: ArrowLeftRight },
  { title: "Nachisleniya", url: "/nastroyka/charge-types", icon: Coins },
  { title: "Valyuta kursi", url: "/nastroyka/exchange-rates", icon: DollarSign },
  { title: "Kontragentlar", url: "/nastroyka/contragents", icon: Building2 },
  { title: "Xodimlar", url: "/nastroyka/employees", icon: Users },
  { title: "Dilerlar", url: "/nastroyka/dealers", icon: UserCircle },
  { title: "Mahsulotlar", url: "/nastroyka/products", icon: Package },
  { title: "Hajm turlari", url: "/nastroyka/unit-types", icon: Ruler },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">
            E
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="font-semibold tracking-tight text-sm">Lovable ERP</div>
            <div className="text-xs text-muted-foreground">Kassa boshqaruvi</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Asosiy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Settings className="size-3.5" /> Nastroyka
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settings.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => supabase.auth.signOut()}
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">Chiqish</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export { Tag };
