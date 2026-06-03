import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/CrudPage";
import { ArrowDown, ArrowUp, Wallet, DollarSign, CreditCard, Landmark } from "lucide-react";
import { fmtMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Kassa" }] }),
  component: Dashboard,
});

interface Tx { operation_type: "income" | "expense"; operation_date: string; amount: number; amount_uzs: number | null; account_id: string }

function Dashboard() {
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts_all"],
    queryFn: async () => (await supabase.from("accounts").select("id,name,currency,is_active")).data ?? [],
  });

  const { data: txs = [] } = useQuery({
    queryKey: ["dashboard", "txs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("operation_type,operation_date,amount,amount_uzs,account_id");
      if (error) throw error;
      return (data ?? []) as Tx[];
    },
  });

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";

  let balCash = 0, balUsd = 0, balBank = 0, balCard = 0;
  let todayIn = 0, todayOut = 0, monthIn = 0, monthOut = 0;

  for (const t of txs) {
    const acc = accounts.find((a) => a.id === t.account_id);
    if (!acc) continue;
    const sign = t.operation_type === "income" ? 1 : -1;
    if (acc.currency === "USD") balUsd += sign * t.amount;
    else if (acc.name.toLowerCase().includes("naqd")) balCash += sign * t.amount;
    else if (acc.name.toLowerCase().includes("bank")) balBank += sign * t.amount;
    else if (acc.name.toLowerCase().includes("plastik") || acc.name.toLowerCase().includes("card")) balCard += sign * t.amount;
    else balCash += sign * t.amount;

    const uzs = t.amount_uzs ?? t.amount;
    if (t.operation_date === today) {
      if (t.operation_type === "income") todayIn += uzs; else todayOut += uzs;
    }
    if (t.operation_date >= monthStart) {
      if (t.operation_type === "income") monthIn += uzs; else monthOut += uzs;
    }
  }

  const kpis = [
    { label: "Jami Naqd qoldiq", value: fmtMoney(balCash, "UZS"), icon: Wallet, color: "text-chart-1" },
    { label: "Bank hisobi", value: fmtMoney(balBank, "UZS"), icon: Landmark, color: "text-chart-3" },
    { label: "Plastik", value: fmtMoney(balCard, "UZS"), icon: CreditCard, color: "text-chart-5" },
    { label: "USD qoldiq", value: fmtMoney(balUsd, "USD"), icon: DollarSign, color: "text-chart-2" },
  ];

  const flow = [
    { label: "Bugungi kirim", value: todayIn, icon: ArrowDown, positive: true },
    { label: "Bugungi chiqim", value: todayOut, icon: ArrowUp, positive: false },
    { label: "Oylik kirim", value: monthIn, icon: ArrowDown, positive: true },
    { label: "Oylik chiqim", value: monthOut, icon: ArrowUp, positive: false },
  ];

  return (
    <>
      <PageHeader title="Kassa Dashboard" description="Asosiy moliyaviy ko'rsatkichlar" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <k.icon className={`size-4 ${k.color}`} />
              </div>
              <div className="text-xl font-semibold mt-2 tabular-nums">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {flow.map((f) => (
          <Card key={f.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{f.label}</div>
                <f.icon className={`size-4 ${f.positive ? "text-success" : "text-destructive"}`} />
              </div>
              <div className={`text-xl font-semibold mt-2 tabular-nums ${f.positive ? "text-success" : "text-destructive"}`}>{fmtMoney(f.value, "UZS")}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Hisob raqamlar bo'yicha qoldiq</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {accounts.map((a) => {
              const bal = txs.filter((t) => t.account_id === a.id).reduce((s, t) => s + (t.operation_type === "income" ? t.amount : -t.amount), 0);
              return (
                <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <div className="font-medium text-sm">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.currency}</div>
                  </div>
                  <div className="font-semibold tabular-nums">{fmtMoney(bal, a.currency as "UZS" | "USD")}</div>
                </div>
              );
            })}
            {accounts.length === 0 && <div className="text-sm text-muted-foreground text-center py-4">Hisob raqamlar yo'q</div>}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
