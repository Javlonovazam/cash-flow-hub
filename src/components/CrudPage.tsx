import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fmtDate } from "@/lib/format";

export type FieldType = "text" | "textarea" | "switch" | "select" | "date" | "number";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  showInTable?: boolean;
  render?: (v: unknown, row: Record<string, unknown>) => React.ReactNode;
  defaultValue?: unknown;
}

interface Props {
  title: string;
  description?: string;
  table: string;
  fields: FieldDef[];
  orderBy?: { column: string; ascending?: boolean };
}

export function CrudPage({ title, description, table, fields, orderBy }: Props) {
  const qc = useQueryClient();
  const queryKey = ["crud", table];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const q = supabase.from(table as never).select("*");
      const ob = orderBy ?? { column: "created_at", ascending: false };
      const { data, error } = await q.order(ob.column, { ascending: !!ob.ascending });
      if (error) throw error;
      return (data ?? []) as Record<string, unknown>[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const reset = () => {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => { init[f.key] = f.defaultValue ?? (f.type === "switch" ? true : ""); });
    setForm(init);
    setEditing(null);
  };

  const openCreate = () => { reset(); setOpen(true); };
  const openEdit = (row: Record<string, unknown>) => {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => { init[f.key] = row[f.key] ?? ""; });
    setForm(init);
    setEditing(row);
    setOpen(true);
  };

  const upsert = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};
      fields.forEach((f) => {
        let v = form[f.key];
        if (v === "" || v === undefined) v = null;
        payload[f.key] = v;
      });
      if (editing?.id) {
        const { error } = await supabase.from(table as never).update(payload as never).eq("id", editing.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table as never).insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "O'zgartirildi" : "Qo'shildi");
      qc.invalidateQueries({ queryKey });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as never).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("O'chirildi"); qc.invalidateQueries({ queryKey }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const tableFields = fields.filter((f) => f.showInTable !== false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}><Plus className="size-4 mr-1" /> Qo'shish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Tahrirlash" : "Yangi qo'shish"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {fields.map((f) => (
                <FieldInput key={f.key} field={f} value={form[f.key]} onChange={(v) => setForm((p) => ({ ...p, [f.key]: v }))} />
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Bekor</Button>
              <Button onClick={() => upsert.mutate()} disabled={upsert.isPending}>Saqlash</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {tableFields.map((f) => <TableHead key={f.key}>{f.label}</TableHead>)}
                <TableHead className="w-24 text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={tableFields.length + 1} className="text-center text-muted-foreground py-8">Yuklanmoqda...</TableCell></TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow><TableCell colSpan={tableFields.length + 1} className="text-center text-muted-foreground py-8">Ma'lumot yo'q</TableCell></TableRow>
              ) : data.map((row) => (
                <TableRow key={row.id as string}>
                  {tableFields.map((f) => (
                    <TableCell key={f.key}>{renderCell(f, row[f.key], row)}</TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(row)}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("O'chirilsinmi?")) del.mutate(row.id as string); }}><Trash2 className="size-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function renderCell(f: FieldDef, v: unknown, row: Record<string, unknown>) {
  if (f.render) return f.render(v, row);
  if (f.type === "switch") return v ? "Faol" : "Nofaol";
  if (f.type === "date") return fmtDate(v as string);
  if (f.type === "select" && f.options) {
    const opt = f.options.find((o) => o.value === v);
    return opt?.label ?? (v as string) ?? "—";
  }
  return (v as string) ?? "—";
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  if (field.type === "textarea") {
    return (
      <div>
        <Label>{field.label}{field.required && " *"}</Label>
        <Textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} required={field.required} />
      </div>
    );
  }
  if (field.type === "switch") {
    return (
      <div className="flex items-center justify-between rounded-md border p-3">
        <Label>{field.label}</Label>
        <Switch checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        <Label>{field.label}{field.required && " *"}</Label>
        <Select value={(value as string) ?? ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="Tanlang" /></SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }
  return (
    <div>
      <Label>{field.label}{field.required && " *"}</Label>
      <Input
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
        required={field.required}
      />
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}
