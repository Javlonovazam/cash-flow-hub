import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Pencil, Trash2, Download, Search } from "lucide-react";
import { PageHeader } from "@/components/CrudPage";
import { TransactionForm } from "@/components/TransactionForm";
import { fmtDate, fmtDateTime, fmtMoney } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/operatsiyalar")({
  head: () => ({ meta: [{ title: "Kassa operatsiyalari" }] }),
  component: OperatsiyalarPage,
});

interface TxRow {
  id: string;
  operation_type: "income" | "expense";
  operation_date: string;
  amount: number;
  usd_rate: number | null;
  amount_uzs: number | null;
  account_id: string;
  contragent_id: string | null;
  source_id: string | null;
  employee_id: string | null;
  charge_type_id: string | null;
  charge_month: string | null;
  note: string | null;
  created_at: string;
}

function OperatsiyalarPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [opType, setOpType] = useState<"income" | "expense">("income");
  const [editing, setEditing] = useState<TxRow | null>(null);

  const [filters, setFilters] = useState({ from: "", to: "", account: "all", type: "all", search: "" });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts_opts"],
    queryFn: async () => (await supabase.from("accounts").select("id,name,currency")).data ?? [],
  });
  const { data: sources = [] } = useQuery({
    queryKey: ["sources_opts"],
    queryFn: async () => (await supabase.from("sources").select("id,name")).data ?? [],
  });
  const { data: contragents = [] } = useQuery({
    queryKey: ["contragents_opts"],
    queryFn: async () => (await supabase.from("contragents").select("id,name")).data ?? [],
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees_opts"],
    queryFn: async () => (await supabase.from("employees").select("id,full_name")).data ?? [],
  });
  const { data: chargeTypes = [] } = useQuery({
    queryKey: ["charge_types_opts"],
    queryFn: async () => (await supabase.from("charge_types").select("id,name")).data ?? [],
  });

  const lookup = useMemo(() => ({
    account: Object.fromEntries(accounts.map((a) => [a.id, a])),
    source: Object.fromEntries(sources.map((s) => [s.id, s.name])),
    contragent: Object.fromEntries(contragents.map((c) => [c.id, c.name])),
    employee: Object.fromEntries(employees.map((e) => [e.id, e.full_name])),
    charge: Object.fromEntries(chargeTypes.map((c) => [c.id, c.name])),
  }), [accounts, sources, contragents, employees, chargeTypes]);

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      let q = supabase.from("transactions").select("*").order("operation_date", { ascending: false }).order("created_at", { ascending: false });
      if (filters.from) q = q.gte("operation_date", filters.from);
      if (filters.to) q = q.lte("operation_date", filters.to);
      if (filters.account !== "all") q = q.eq("account_id", filters.account);
      if (filters.type !== "all") q = q.eq("operation_type", filters.type);
      const { data, error } = await q.limit(500);
      if (error) throw error;
      return (data ?? []) as TxRow[];
    },
  });

  const filtered = useMemo(() => {
    if (!filters.search) return txs;
    const s = filters.search.toLowerCase();
    return txs.filter((t) =>
      (t.note ?? "").toLowerCase().includes(s) ||
      (lookup.contragent[t.contragent_id ?? ""] ?? "").toLowerCase().includes(s) ||
      (lookup.source[t.source_id ?? ""] ?? "").toLowerCase().includes(s) ||
      (lookup.employee[t.employee_id ?? ""] ?? "").toLowerCase().includes(s)
    );
  }, [txs, filters.search, lookup]);

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("O'chirildi"); qc.invalidateQueries({ queryKey: ["transactions"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = (t: "income" | "expense") => { setEditing(null); setOpType(t); setOpen(true); };
  const openEdit = (row: TxRow) => { setEditing(row); setOpType(row.operation_type); setOpen(true); };

  const exportCsv = () => {
    const rows = [
      ["ID", "Sana", "Tur", "Hisob", "Summa", "Kurs", "Kontragent", "Manba", "Xodim", "Nachisleniya", "Oy", "Izoh", "Yaratilgan"],
      ...filtered.map((t) => [
        t.id, t.operation_date, t.operation_type === "income" ? "Kirim" : "Chiqim",
        lookup.account[t.account_id]?.name ?? "", t.amount, t.usd_rate ?? "",
        lookup.contragent[t.contragent_id ?? ""] ?? "", lookup.source[t.source_id ?? ""] ?? "",
        lookup.employee[t.employee_id ?? ""] ?? "", lookup.charge[t.charge_type_id ?? ""] ?? "",
        t.charge_month ?? "", (t.note ?? "").replace(/\n/g, " "), t.created_at,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `operatsiyalar_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <PageHeader title="Kassa operatsiyalari" description="Barcha kirim va chiqimlar jurnali" />
        <div className="flex gap-2">
          <Button onClick={() => openCreate("income")} className="gap-1"><Plus className="size-4" /> Kirim</Button>
          <Button onClick={() => openCreate("expense")} variant="secondary" className="gap-1"><Minus className="size-4" /> Chiqim</Button>
          <Button onClick={exportCsv} variant="outline" className="gap-1"><Download className="size-4" /> Excel</Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader><CardTitle className="text-sm">Filtrlar</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div><label className="text-xs text-muted-foreground">Sanadan</label><Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></div>
            <div><label className="text-xs text-muted-foreground">Sanagacha</label><Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></div>
            <div>
              <label className="text-xs text-muted-foreground">Hisob</label>
              <Select value={filters.account} onValueChange={(v) => setFilters({ ...filters, account: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tur</label>
              <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="income">Kirim</SelectItem>
                  <SelectItem value="expense">Chiqim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Qidiruv</label>
              <div className="relative">
                <Search className="size-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-8" placeholder="Izoh, kontragent..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sana</TableHead>
                  <TableHead>Tur</TableHead>
                  <TableHead>Hisob</TableHead>
                  <TableHead className="text-right">Summa</TableHead>
                  <TableHead>Kontragent</TableHead>
                  <TableHead>Manba</TableHead>
                  <TableHead>Xodim</TableHead>
                  <TableHead>Nachisleniya</TableHead>
                  <TableHead>Izoh</TableHead>
                  <TableHead>Yaratilgan</TableHead>
                  <TableHead className="text-right">Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Yuklanmoqda...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Ma'lumot yo'q</TableCell></TableRow>
                ) : filtered.map((t) => {
                  const acc = lookup.account[t.account_id];
                  return (
                    <TableRow key={t.id}>
                      <TableCell>{fmtDate(t.operation_date)}</TableCell>
                      <TableCell>
                        {t.operation_type === "income"
                          ? <Badge className="bg-success text-success-foreground hover:bg-success/90">Kirim</Badge>
                          : <Badge variant="destructive">Chiqim</Badge>}
                      </TableCell>
                      <TableCell>{acc?.name ?? "—"}</TableCell>
                      <TableCell className={`text-right font-medium tabular-nums ${t.operation_type === "income" ? "text-success" : "text-destructive"}`}>
                        {t.operation_type === "income" ? "+" : "−"} {fmtMoney(t.amount, acc?.currency ?? "UZS")}
                        {t.usd_rate && <div className="text-xs text-muted-foreground font-normal">kurs: {t.usd_rate}</div>}
                      </TableCell>
                      <TableCell className="text-sm">{lookup.contragent[t.contragent_id ?? ""] ?? "—"}</TableCell>
                      <TableCell className="text-sm">{lookup.source[t.source_id ?? ""] ?? "—"}</TableCell>
                      <TableCell className="text-sm">{lookup.employee[t.employee_id ?? ""] ?? "—"}</TableCell>
                      <TableCell className="text-sm">{lookup.charge[t.charge_type_id ?? ""] ?? "—"}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{t.note ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDateTime(t.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Pencil className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm("O'chirilsinmi?")) del.mutate(t.id); }}><Trash2 className="size-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TransactionForm open={open} onOpenChange={setOpen} operationType={opType} editing={editing} />
    </>
  );
}
