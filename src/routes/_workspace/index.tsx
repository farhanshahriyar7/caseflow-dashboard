import { createFileRoute } from "@tanstack/react-router";

import { OverviewPage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/")({
  head: () => ({
    meta: [
      { title: "Overview | Case Desk" },
      { name: "description", content: "A concise view of patient cases, clinic activity, and upcoming follow-ups in Case Desk." },
      { property: "og:title", content: "Overview | Case Desk" },
      { property: "og:description", content: "A concise view of patient cases, clinic activity, and upcoming follow-ups in Case Desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OverviewPage,
});
