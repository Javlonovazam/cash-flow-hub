import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, PageHeader } from "@/components/CrudPage";

export const Route = createFileRoute("/_authenticated/nastroyka/charge-types")({
  head: () => ({ meta: [{ title: "Nachisleniya" }] }),
  component: () => (
    <>
      <PageHeader title="Nachisleniya turlari" description="Avans, ish haqi, bonus, jarima, qarz" />
      <CrudPage title="Nachisleniya" table="charge_types" orderBy={{ column: "name", ascending: true }}
        fields={[{ key: "name", label: "Nomi", required: true }]}
      />
    </>
  ),
});
