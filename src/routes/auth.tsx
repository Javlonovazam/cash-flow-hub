import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAccess } from "@/hooks/use-access";
import type { AccessRole } from "@/lib/access";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Kirish — Novza eshiklari 2016" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { role, setRole } = useAccess();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role) navigate({ to: "/dashboard", replace: true });
  }, [role, navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("verify_access_password", { p_password: password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const row = (Array.isArray(data) ? data[0] : data) as AccessRole | undefined;
    if (!row) {
      toast.error("Parol noto'g'ri");
      return;
    }
    setRole(row);
    toast.success(`Xush kelibsiz, ${row.name}!`);
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-background to-accent/40 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto size-12 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold text-xl mb-3">N</div>
          <h1 className="text-2xl font-semibold tracking-tight">Novza eshiklari 2016</h1>
          <p className="text-sm text-muted-foreground">Kassa va moliyaviy boshqaruv tizimi</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kirish</CardTitle>
            <CardDescription>Parolni kiriting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <Label htmlFor="password">Parol</Label>
                <Input
                  id="password"
                  type="password"
                  autoFocus
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "..." : "Kirish"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
