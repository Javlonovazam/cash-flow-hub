import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, PageHeader } from "@/components/CrudPage";
import { fmtMoney } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/nastroyka/exchange-rates")({
  head: () => ({ meta: [{ title: "Valyuta kurslari" }] }),
  component: () => (
    <>
      <PageHeader title="Valyuta kurslari" description="USD/UZS kunlik kurs" />
      <CrudPage title="Kurslar" table="exchange_rates" orderBy={{ column: "rate_date", ascending: false }}
        fields={[
          { key: "rate_date", label: "Sana", type: "date", required: true },
          { key: "usd_rate", label: "1 USD = (UZS)", type: "number", required: true, render: (v) => fmtMoney(v as number, "UZS") },
        ]}
      />
    </>
  ),
});
