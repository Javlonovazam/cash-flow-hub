import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, PageHeader } from "@/components/CrudPage";

export const Route = createFileRoute("/_authenticated/nastroyka/sources")({
  head: () => ({ meta: [{ title: "Manbalar" }] }),
  component: () => (
    <>
      <PageHeader title="Manbalar" description="Kirim/chiqim manbalari" />
      <CrudPage title="Manbalar" table="sources" orderBy={{ column: "name", ascending: true }}
        fields={[{ key: "name", label: "Nomi", required: true }]}
      />
    </>
  ),
});
