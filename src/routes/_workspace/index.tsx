import { createFileRoute } from "@tanstack/react-router";

import { OverviewPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/")({
  component: OverviewPage,
});
