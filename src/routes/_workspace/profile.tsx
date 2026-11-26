import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/components/case-desk-pages";

export const Route = createFileRoute("/_workspace/profile")({
  head: () => ({
    meta: [
      { title: "Practitioner profile | Case Desk" },
      { name: "description", content: "Update the practitioner and practice details shown throughout the Case Desk workspace." },
      { property: "og:title", content: "Practitioner profile | Case Desk" },
      { property: "og:description", content: "Update the practitioner and practice details shown throughout the Case Desk workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});
