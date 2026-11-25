import { createFileRoute } from "@tanstack/react-router";

import { CasesPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/cases")({
  component: CasesPage,
});
