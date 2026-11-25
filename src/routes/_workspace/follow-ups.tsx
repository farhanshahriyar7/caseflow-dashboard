import { createFileRoute } from "@tanstack/react-router";

import { FollowUpsPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/follow-ups")({
  component: FollowUpsPage,
});
