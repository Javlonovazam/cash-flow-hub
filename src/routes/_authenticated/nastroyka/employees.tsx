import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, PageHeader } from "@/components/CrudPage";

export const Route = createFileRoute("/_authenticated/nastroyka/employees")({
  head: () => ({ meta: [{ title: "Xodimlar" }] }),
  component: () => (
    <>
      <PageHeader title="Xodimlar" />
      <CrudPage title="Xodimlar" table="employees" orderBy={{ column: "full_name", ascending: true }}
        fields={[
          { key: "full_name", label: "F.I.O.", required: true },
          { key: "phone", label: "Telefon" },
          { key: "position", label: "Lavozim" },
          { key: "department", label: "Bo'lim" },
          { key: "is_active", label: "Faol", type: "switch", defaultValue: true },
        ]}
      />
    </>
  ),
});
