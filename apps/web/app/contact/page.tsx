import type { Metadata } from "next";
import { Prose, SubscribeForm } from "@lnls/ui";
import { buildMetadata } from "../../src/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact | Late Night Lake Show",
  description: "Partner with the LNLS crew, pitch a story, or get in touch."
});

export default function ContactPage() {
  return (
    <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
      <Prose className="space-y-6">
        <h1>Contact the Crew</h1>
        <p>Email us at <a href="mailto:contact@latenightlakeshow.com">contact@latenightlakeshow.com</a>.</p>
        <p>
          For press inquiries, sponsorships, or contributor pitches, drop us a line and our editors will respond within
          two business days.
        </p>
      </Prose>
      <SubscribeForm actionUrl="/api/subscribe" />
    </div>
  );
}
