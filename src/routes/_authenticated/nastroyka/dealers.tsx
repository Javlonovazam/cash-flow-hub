import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, PageHeader } from "@/components/CrudPage";

export const Route = createFileRoute("/_authenticated/nastroyka/dealers")({
  head: () => ({ meta: [{ title: "Dilerlar" }] }),
  component: () => (
    <>
      <PageHeader title="Dilerlar" />
      <CrudPage title="Dilerlar" table="dealers" orderBy={{ column: "full_name", ascending: true }}
        fields={[
          { key: "full_name", label: "F.I.O.", required: true },
          { key: "phone", label: "Telefon" },
          { key: "region", label: "Hudud" },
          { key: "note", label: "Izoh", type: "textarea", showInTable: false },
        ]}
      />
    </>
  ),
});
