import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, PageHeader } from "@/components/CrudPage";

export const Route = createFileRoute("/_authenticated/nastroyka/contragents")({
  head: () => ({ meta: [{ title: "Kontragentlar" }] }),
  component: () => (
    <>
      <PageHeader title="Kontragentlar" />
      <CrudPage title="Kontragentlar" table="contragents" orderBy={{ column: "name", ascending: true }}
        fields={[
          { key: "name", label: "Nomi", required: true },
          { key: "phone", label: "Telefon" },
          { key: "address", label: "Manzil" },
          { key: "note", label: "Izoh", type: "textarea", showInTable: false },
        ]}
      />
    </>
  ),
});
