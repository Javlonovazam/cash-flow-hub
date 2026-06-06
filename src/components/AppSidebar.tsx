import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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
  ShieldCheck,
  ArrowLeftRight,
  Coins,
  DollarSign,
  Wallet,
  BadgeDollarSign,
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
import { Button } from "@/components/ui/button";
import { useAccess } from "@/hooks/use-access";
import { canAccess } from "@/lib/access";

const main = [
  { key: "dashboard", title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { key: "operatsiyalar", title: "Kassa operatsiyalari", url: "/operatsiyalar", icon: Receipt },
  { key: "cash_flow", title: "Cash Flow", url: "/cash-flow", icon: BadgeDollarSign },
];

const nastroyka = [
  { key: "nastroyka.accounts", title: "Hisob raqamlar", url: "/nastroyka/accounts", icon: Wallet },
  { key: "nastroyka.sources", title: "Manbalar", url: "/nastroyka/sources", icon: ArrowLeftRight },
  { key: "nastroyka.charge_types", title: "Nachisleniya", url: "/nastroyka/charge-types", icon: Coins },
  { key: "nastroyka.exchange_rates", title: "Valyuta kursi", url: "/nastroyka/exchange-rates", icon: DollarSign },
  { key: "nastroyka.contragents", title: "Kontragentlar", url: "/nastroyka/contragents", icon: Building2 },
  { key: "nastroyka.employees", title: "Xodimlar", url: "/nastroyka/employees", icon: Users },
  { key: "nastroyka.dealers", title: "Dilerlar", url: "/nastroyka/dealers", icon: UserCircle },
  { key: "nastroyka.products", title: "Mahsulotlar", url: "/nastroyka/products", icon: Package },
  { key: "nastroyka.unit_types", title: "Hajm turlari", url: "/nastroyka/unit-types", icon: Ruler },
  { key: "nastroyka.access_roles", title: "Ruxsatlar", url: "/nastroyka/access-roles", icon: ShieldCheck },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { role, setRole } = useAccess();
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");
  const nastroykaActive = pathname.startsWith("/nastroyka");
  const [openNastroyka, setOpenNastroyka] = useState(nastroykaActive);

  const visibleMain = main.filter((m) => canAccess(role, m.key));
  const visibleNastroyka = nastroyka.filter((m) => canAccess(role, m.key));

  const onLogout = () => {
    setRole(null);
    navigate({ to: "/auth", replace: true });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold">
            N
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="font-semibold tracking-tight text-sm">Novza eshiklari 2016</div>
            <div className="text-xs text-muted-foreground">{role?.name ?? "—"}</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMain.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {visibleNastroyka.length > 0 && (
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
                      {visibleNastroyka.map((item) => (
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
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onLogout}
        >
          <LogOut className="size-4" />
          <span className="group-data-[collapsible=icon]:hidden">Chiqish</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
