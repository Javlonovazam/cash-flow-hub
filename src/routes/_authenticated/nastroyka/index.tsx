import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/nastroyka/")({
  beforeLoad: () => { throw redirect({ to: "/nastroyka/accounts" }); },
});
