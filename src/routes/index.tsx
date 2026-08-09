import { createFileRoute } from "@tanstack/react-router";
import { PhoneShell } from "@/app/ResQNow";
import { ResQProvider } from "@/hooks/useResQ";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResQNow — Community. Response. Save Lives." },
      {
        name: "description",
        content:
          "ResQNow detects road accidents, escalates through three 30-second alarms and connects victims with nearby helpers, hospitals and police.",
      },
      { property: "og:title", content: "ResQNow — Community. Response. Save Lives." },
      {
        property: "og:description",
        content:
          "Emergency response prototype: accident detection, escalating alarms, AI severity analysis, helper dispatch and hospital handover.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ResQProvider>
      <PhoneShell />
    </ResQProvider>
  );
}
