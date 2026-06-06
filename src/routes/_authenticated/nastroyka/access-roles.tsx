import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/CrudPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { MODULES, type AccessLevel } from "@/lib/access";

export const Route = createFileRoute("/_authenticated/nastroyka/access-roles")({
  head: () => ({ meta: [{ title: "Ruxsatlar" }] }),
  component: AccessRolesPage,
});

interface RoleRow {
  id: string;
  name: string;
  permissions: Record<string, AccessLevel>;
  is_general: boolean;
  is_active: boolean;
}

function AccessRolesPage() {
  const qc = useQueryClient();
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["access_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("access_roles").select("*").order("name");
      if (error) throw error;
      return data as RoleRow[];
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [perms, setPerms] = useState<Record<string, AccessLevel>>({});

  const reset = () => {
    setEditing(null);
    setName("");
    setPassword("");
    setIsActive(true);
    setPerms({});
  };

  const startEdit = (r: RoleRow) => {
    setEditing(r);
    setName(r.name);
    setPassword("");
    setIsActive(r.is_active);
    setPerms(r.permissions ?? {});
    setOpen(true);
  };

  const startNew = () => {
    reset();
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Pozitsiya nomi kerak");
      if (!editing && !password.trim()) throw new Error("Parol kerak");

      if (editing) {
        const { error } = await supabase
          .from("access_roles")
          .update({ name, permissions: perms, is_active: isActive })
          .eq("id", editing.id);
        if (error) throw error;
        if (password.trim()) {
          const { error: pErr } = await supabase.rpc("set_access_role_password", {
            p_id: editing.id,
            p_password: password,
          });
          if (pErr) throw pErr;
        }
      } else {
        // create — insert with placeholder then set password via RPC
        const { data, error } = await supabase
          .from("access_roles")
          .insert({ name, permissions: perms, is_active: isActive, password_hash: "x", is_general: false })
          .select("id")
          .single();
        if (error) throw error;
        const { error: pErr } = await supabase.rpc("set_access_role_password", {
          p_id: data.id,
          p_password: password,
        });
        if (pErr) throw pErr;
      }
    },
    onSuccess: () => {
      toast.success("Saqlandi");
      qc.invalidateQueries({ queryKey: ["access_roles"] });
      setOpen(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (r: RoleRow) => {
      if (r.is_general) throw new Error("General pozitsiyani o'chirib bo'lmaydi");
      const { error } = await supabase.from("access_roles").delete().eq("id", r.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("O'chirildi");
      qc.invalidateQueries({ queryKey: ["access_roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setPerm = (key: string, level: AccessLevel) => {
    setPerms((p) => ({ ...p, [key]: level }));
  };

  return (
    <>
      <PageHeader
        title="Ruxsatlar (Pozitsiyalar)"
        description="Har bir pozitsiya uchun parol va kira oladigan bo'limlarni belgilang"
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pozitsiyalar</CardTitle>
          <Button onClick={startNew} size="sm">
            <Plus className="size-4 mr-1" /> Yangi
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Turi</TableHead>
                  <TableHead>Bo'limlar soni</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => {
                  const count = r.is_general
                    ? MODULES.length
                    : Object.values(r.permissions ?? {}).filter((v) => v && v !== "none").length;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <KeyRound className="size-4 text-muted-foreground" />
                        {r.name}
                      </TableCell>
                      <TableCell>
                        {r.is_general ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">General (to'liq ruxsat)</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Maxsus</span>
                        )}
                      </TableCell>
                      <TableCell>{count} / {MODULES.length}</TableCell>
                      <TableCell>{r.is_active ? "Faol" : "Nofaol"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(r)}>
                          <Pencil className="size-4" />
                        </Button>
                        {!r.is_general && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`"${r.name}" pozitsiyani o'chirasizmi?`)) remove.mutate(r);
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Pozitsiyani tahrirlash" : "Yangi pozitsiya"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pozitsiya nomi</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Buxgalter" />
              </div>
              <div>
                <Label>Parol {editing && <span className="text-xs text-muted-foreground">(yangilash uchun yozing)</span>}</Label>
                <Input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editing ? "O'zgartirmaslik uchun bo'sh qoldiring" : "Parol"}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="active" />
              <Label htmlFor="active">Faol</Label>
            </div>

            {editing?.is_general ? (
              <p className="text-sm text-muted-foreground border rounded-md p-3 bg-muted/30">
                General pozitsiya barcha bo'limlarga to'liq ruxsatga ega. Bo'limlarni o'zgartirib bo'lmaydi.
              </p>
            ) : (
              <div className="border rounded-md">
                <div className="grid grid-cols-12 px-3 py-2 border-b text-xs font-medium text-muted-foreground bg-muted/40">
                  <div className="col-span-6">Bo'lim</div>
                  <div className="col-span-2 text-center">Ko'rish</div>
                  <div className="col-span-2 text-center">Yozish</div>
                  <div className="col-span-2 text-center">Yo'q</div>
                </div>
                {(["Asosiy", "Cash Flow", "Nastroyka"] as const).map((group) => (
                  <div key={group}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/20">{group}</div>
                    {MODULES.filter((m) => m.group === group).map((m) => {
                      const lvl = perms[m.key] ?? "none";
                      return (
                        <div key={m.key} className="grid grid-cols-12 px-3 py-2 border-t items-center text-sm">
                          <div className="col-span-6">{m.label}</div>
                          <div className="col-span-2 flex justify-center">
                            <Checkbox checked={lvl === "view"} onCheckedChange={(c) => setPerm(m.key, c ? "view" : "none")} />
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <Checkbox checked={lvl === "edit"} onCheckedChange={(c) => setPerm(m.key, c ? "edit" : "none")} />
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <Checkbox checked={lvl === "none"} onCheckedChange={(c) => setPerm(m.key, c ? "none" : "view")} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
