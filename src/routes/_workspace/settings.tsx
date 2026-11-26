import { createFileRoute } from "@tanstack/react-router";

import { SettingsPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/settings")({
  head: () => ({
    meta: [
      { title: "Workspace settings | Case Desk" },
      { name: "description", content: "Choose the language used across the Case Desk dashboard and case form." },
      { property: "og:title", content: "Workspace settings | Case Desk" },
      { property: "og:description", content: "Choose the language used across the Case Desk dashboard and case form." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});
