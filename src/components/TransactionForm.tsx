import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { todayISO } from "@/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  operationType: "income" | "expense";
  editing?: Record<string, unknown> | null;
}

export function TransactionForm({ open, onOpenChange, operationType, editing }: Props) {
  const qc = useQueryClient();

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts_opts"],
    queryFn: async () => (await supabase.from("accounts").select("id,name,currency,is_active").eq("is_active", true).order("name")).data ?? [],
  });
  const { data: sources = [] } = useQuery({
    queryKey: ["sources_opts"],
    queryFn: async () => (await supabase.from("sources").select("id,name").order("name")).data ?? [],
  });
  const { data: contragents = [] } = useQuery({
    queryKey: ["contragents_opts"],
    queryFn: async () => (await supabase.from("contragents").select("id,name").order("name")).data ?? [],
  });
  const { data: employees = [] } = useQuery({
    queryKey: ["employees_opts"],
    queryFn: async () => (await supabase.from("employees").select("id,full_name").eq("is_active", true).order("full_name")).data ?? [],
  });
  const { data: chargeTypes = [] } = useQuery({
    queryKey: ["charge_types_opts"],
    queryFn: async () => (await supabase.from("charge_types").select("id,name").order("name")).data ?? [],
  });

  const [form, setForm] = useState({
    operation_date: todayISO(),
    amount: "" as string | number,
    account_id: "",
    usd_rate: "" as string | number,
    contragent_id: "",
    source_id: "",
    employee_id: "",
    charge_type_id: "",
    charge_month: "",
    note: "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        operation_date: (editing.operation_date as string) ?? todayISO(),
        amount: (editing.amount as number) ?? "",
        account_id: (editing.account_id as string) ?? "",
        usd_rate: (editing.usd_rate as number) ?? "",
        contragent_id: (editing.contragent_id as string) ?? "",
        source_id: (editing.source_id as string) ?? "",
        employee_id: (editing.employee_id as string) ?? "",
        charge_type_id: (editing.charge_type_id as string) ?? "",
        charge_month: (editing.charge_month as string) ?? "",
        note: (editing.note as string) ?? "",
      });
    } else {
      setForm({
        operation_date: todayISO(), amount: "", account_id: "", usd_rate: "",
        contragent_id: "", source_id: "", employee_id: "", charge_type_id: "", charge_month: "", note: "",
      });
    }
  }, [editing, open]);

  const selectedAccount = accounts.find((a) => a.id === form.account_id);
  const isUsd = selectedAccount?.currency === "USD";
  const amountNum = typeof form.amount === "number" ? form.amount : parseFloat(form.amount as string) || 0;
  const rateNum = typeof form.usd_rate === "number" ? form.usd_rate : parseFloat(form.usd_rate as string) || 0;
  const amountUzs = useMemo(() => (isUsd ? amountNum * rateNum : amountNum), [isUsd, amountNum, rateNum]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form.operation_date) throw new Error("Sana bo'sh bo'lmasin");
      if (!amountNum) throw new Error("Summa bo'sh bo'lmasin");
      if (!form.account_id) throw new Error("Hisob raqami tanlanishi shart");
      if (!form.source_id) throw new Error("Manba tanlanishi shart");
      if (isUsd && !rateNum) throw new Error("USD uchun kurs kiritilishi shart");

      const { data: userRes } = await supabase.auth.getUser();
      const payload = {
        operation_type: operationType,
        operation_date: form.operation_date,
        amount: amountNum,
        account_id: form.account_id,
        usd_rate: isUsd ? rateNum : null,
        amount_uzs: isUsd ? amountUzs : amountNum,
        contragent_id: form.contragent_id || null,
        source_id: form.source_id,
        employee_id: form.employee_id || null,
        charge_type_id: form.charge_type_id || null,
        charge_month: form.charge_month ? `${form.charge_month}-01` : null,
        note: form.note || null,
        created_by: userRes.user?.id ?? null,
      };
      if (editing?.id) {
        const { error } = await supabase.from("transactions").update(payload).eq("id", editing.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("transactions").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Yangilandi" : (operationType === "income" ? "Kirim qo'shildi" : "Chiqim qo'shildi"));
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Operatsiyani tahrirlash" : operationType === "income" ? "Kirim qo'shish" : "Chiqim qo'shish"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Sana *</Label>
            <Input type="date" value={form.operation_date} onChange={(e) => setForm({ ...form, operation_date: e.target.value })} />
          </div>
          <div>
            <Label>Summa *</Label>
            <Input type="number" step="any" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <Label>Hisob raqami *</Label>
            <Select value={form.account_id} onValueChange={(v) => setForm({ ...form, account_id: v })}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {isUsd && (
            <div>
              <Label>USD kursi *</Label>
              <Input type="number" step="any" value={form.usd_rate} onChange={(e) => setForm({ ...form, usd_rate: e.target.value })} />
              {amountUzs > 0 && <p className="text-xs text-muted-foreground mt-1">= {amountUzs.toLocaleString()} so'm</p>}
            </div>
          )}
          <div>
            <Label>Manba *</Label>
            <Select value={form.source_id} onValueChange={(v) => setForm({ ...form, source_id: v })}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>{sources.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Kontragent</Label>
            <Select value={form.contragent_id} onValueChange={(v) => setForm({ ...form, contragent_id: v })}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>{contragents.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Xodim</Label>
            <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nachisleniya turi</Label>
            <Select value={form.charge_type_id} onValueChange={(v) => setForm({ ...form, charge_type_id: v })}>
              <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
              <SelectContent>{chargeTypes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Qaysi oy uchun</Label>
            <Input type="month" value={form.charge_month} onChange={(e) => setForm({ ...form, charge_month: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Izoh</Label>
            <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Bekor</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Saqlash</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
