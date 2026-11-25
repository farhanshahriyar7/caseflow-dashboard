import { createFileRoute } from "@tanstack/react-router";

import { NotesPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/notes")({
  component: NotesPage,
});
