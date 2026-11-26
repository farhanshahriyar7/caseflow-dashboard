import { createFileRoute } from "@tanstack/react-router";

import { NotesPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/notes")({
  head: () => ({
    meta: [
      { title: "Clinical notes | Case Desk" },
      { name: "description", content: "Find patient narratives and symptom summaries in the Case Desk clinical journal." },
      { property: "og:title", content: "Clinical notes | Case Desk" },
      { property: "og:description", content: "Find patient narratives and symptom summaries in the Case Desk clinical journal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotesPage,
});
