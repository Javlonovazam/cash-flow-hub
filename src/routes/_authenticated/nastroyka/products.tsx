import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CrudPage, PageHeader, type FieldDef } from "@/components/CrudPage";

export const Route = createFileRoute("/_authenticated/nastroyka/products")({
  head: () => ({ meta: [{ title: "Mahsulotlar" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: units = [] } = useQuery({
    queryKey: ["unit_types_opts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("unit_types").select("id,name").order("name");
      if (error) throw error;
      return data;
    },
  });
  const unitOpts = units.map((u) => ({ value: u.id, label: u.name }));
  const fields: FieldDef[] = [
    { key: "name", label: "Mahsulot nomi", required: true },
    { key: "code", label: "Kod" },
    { key: "unit_type_id", label: "O'lchov birligi", type: "select", options: unitOpts, render: (v) => unitOpts.find((o) => o.value === v)?.label ?? "—" },
    { key: "note", label: "Izoh", type: "textarea", showInTable: false },
  ];
  return (
    <>
      <PageHeader title="Mahsulotlar" />
      <CrudPage title="Mahsulotlar" table="products" orderBy={{ column: "name", ascending: true }} fields={fields} />
    </>
  );
}
