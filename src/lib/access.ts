export type AccessLevel = "none" | "view" | "edit";

export interface AccessRole {
  id: string;
  name: string;
  permissions: Record<string, AccessLevel>;
  is_general: boolean;
}

export interface ModuleDef {
  key: string;
  label: string;
  group: "Asosiy" | "Nastroyka";
}

export const MODULES: ModuleDef[] = [
  { key: "dashboard", label: "Dashboard", group: "Asosiy" },
  { key: "operatsiyalar", label: "Kassa operatsiyalari", group: "Asosiy" },
  { key: "nastroyka.accounts", label: "Hisob raqamlar", group: "Nastroyka" },
  { key: "nastroyka.sources", label: "Manbalar", group: "Nastroyka" },
  { key: "nastroyka.charge_types", label: "Nachisleniya", group: "Nastroyka" },
  { key: "nastroyka.exchange_rates", label: "Valyuta kursi", group: "Nastroyka" },
  { key: "nastroyka.contragents", label: "Kontragentlar", group: "Nastroyka" },
  { key: "nastroyka.employees", label: "Xodimlar", group: "Nastroyka" },
  { key: "nastroyka.dealers", label: "Dilerlar", group: "Nastroyka" },
  { key: "nastroyka.products", label: "Mahsulotlar", group: "Nastroyka" },
  { key: "nastroyka.unit_types", label: "Hajm turlari", group: "Nastroyka" },
  { key: "nastroyka.access_roles", label: "Ruxsatlar (Pozitsiyalar)", group: "Nastroyka" },
];

const STORAGE_KEY = "novza_access_role";

export function loadAccess(): AccessRole | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AccessRole;
  } catch {
    return null;
  }
}

export function saveAccess(role: AccessRole) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(role));
}

export function clearAccess() {
  localStorage.removeItem(STORAGE_KEY);
}

export function canAccess(role: AccessRole | null, moduleKey: string, level: "view" | "edit" = "view"): boolean {
  if (!role) return false;
  if (role.is_general) return true;
  const lvl = role.permissions?.[moduleKey] ?? "none";
  if (level === "view") return lvl === "view" || lvl === "edit";
  return lvl === "edit";
}
