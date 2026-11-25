import { createFileRoute } from "@tanstack/react-router";

import { SettingsPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/settings")({
  component: SettingsPage,
});
