import type { Metadata } from "next";
import { Prose } from "@lnls/ui";
import { buildMetadata } from "../../src/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About | Late Night Lake Show",
  description: "Meet the crew and learn how LNLS covers the Lakers around the clock."
});

export default function AboutPage() {
  return (
    <Prose className="space-y-6">
      <h1>About Late Night Lake Show</h1>
      <p>
        Late Night Lake Show is a community-first Lakers media collective building the next generation of fan-first
        storytelling. Phase-1 introduces a modern newsroom powered by AI-assisted workflows, a connected Sanity Studio,
        and rich Supabase data integrations.
      </p>
      <p>
        Every article, video, and podcast episode is reviewed by our editorial team before publishing. AI-generated
        suggestions appear only inside our tools and are clearly labeled.
      </p>
    </Prose>
  );
}
