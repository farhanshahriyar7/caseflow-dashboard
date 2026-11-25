import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/profile")({
  component: ProfilePage,
});
