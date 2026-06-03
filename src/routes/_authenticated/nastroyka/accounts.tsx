import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, PageHeader } from "@/components/CrudPage";

export const Route = createFileRoute("/_authenticated/nastroyka/accounts")({
  head: () => ({ meta: [{ title: "Hisob raqamlar" }] }),
  component: () => (
    <>
      <PageHeader title="Hisob raqamlar" description="Naqd, USD, Bank, Plastik va boshqa hisoblar" />
      <CrudPage
        title="Hisob raqamlar"
        table="accounts"
        orderBy={{ column: "name", ascending: true }}
        fields={[
          { key: "name", label: "Nomi", required: true },
          { key: "currency", label: "Valyuta", type: "select", required: true, options: [{ value: "UZS", label: "UZS" }, { value: "USD", label: "USD" }], defaultValue: "UZS" },
          { key: "is_active", label: "Faol", type: "switch", defaultValue: true },
        ]}
      />
    </>
  ),
});
