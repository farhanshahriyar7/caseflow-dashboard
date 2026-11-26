import { createFileRoute } from "@tanstack/react-router";

import { CasesPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/cases")({
  head: () => ({
    meta: [
      { title: "Patient cases | Case Desk" },
      { name: "description", content: "Browse, search, and manage patient case records in Case Desk." },
      { property: "og:title", content: "Patient cases | Case Desk" },
      { property: "og:description", content: "Browse, search, and manage patient case records in Case Desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CasesPage,
});
