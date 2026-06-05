import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loadAccess, saveAccess, clearAccess, type AccessRole } from "@/lib/access";

interface Ctx {
  role: AccessRole | null;
  setRole: (r: AccessRole | null) => void;
  loading: boolean;
}

const AccessCtx = createContext<Ctx>({ role: null, setRole: () => {}, loading: true });

export function AccessProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AccessRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRoleState(loadAccess());
    setLoading(false);
  }, []);

  const setRole = (r: AccessRole | null) => {
    if (r) saveAccess(r);
    else clearAccess();
    setRoleState(r);
  };

  return <AccessCtx.Provider value={{ role, setRole, loading }}>{children}</AccessCtx.Provider>;
}

export function useAccess() {
  return useContext(AccessCtx);
}
