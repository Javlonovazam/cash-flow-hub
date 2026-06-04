import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
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
  Wallet,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const main = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Kassa operatsiyalari", url: "/operatsiyalar", icon: Receipt },
];

const nastroyka = [
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
  const nastroykaActive = pathname.startsWith("/nastroyka");
  const [openNastroyka, setOpenNastroyka] = useState(nastroykaActive);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">
            N
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="font-semibold tracking-tight text-sm">Novza eshiklari 2016</div>
            <div className="text-xs text-muted-foreground">Kassa boshqaruvi</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
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

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setOpenNastroyka((v) => !v)}
                  isActive={nastroykaActive}
                  tooltip="Nastroyka"
                >
                  <Settings className="size-4" />
                  <span>Nastroyka</span>
                  <ChevronRight
                    className={`ml-auto size-4 transition-transform ${openNastroyka ? "rotate-90" : ""}`}
                  />
                </SidebarMenuButton>
                {openNastroyka && (
                  <SidebarMenuSub>
                    {nastroyka.map((item) => (
                      <SidebarMenuSubItem key={item.url}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                          <Link to={item.url}>
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
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
