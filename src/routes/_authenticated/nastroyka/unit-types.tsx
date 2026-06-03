import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, PageHeader } from "@/components/CrudPage";

export const Route = createFileRoute("/_authenticated/nastroyka/unit-types")({
  head: () => ({ meta: [{ title: "Hajm turlari" }] }),
  component: () => (
    <>
      <PageHeader title="Hajm turlari" description="O'lchov birliklari" />
      <CrudPage title="Hajm turlari" table="unit_types" orderBy={{ column: "name", ascending: true }}
        fields={[{ key: "name", label: "Nomi", required: true }]}
      />
    </>
  ),
});
