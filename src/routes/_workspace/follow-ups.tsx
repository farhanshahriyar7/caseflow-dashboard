import { createFileRoute } from "@tanstack/react-router";

import { FollowUpsPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/follow-ups")({
  head: () => ({
    meta: [
      { title: "Follow-ups | Case Desk" },
      { name: "description", content: "Review scheduled and overdue patient follow-ups in Case Desk." },
      { property: "og:title", content: "Follow-ups | Case Desk" },
      { property: "og:description", content: "Review scheduled and overdue patient follow-ups in Case Desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FollowUpsPage,
});
