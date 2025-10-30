import type { Metadata } from "next";
import { Prose } from "@lnls/ui";
import { buildMetadata } from "../../src/utils/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Advertise | Late Night Lake Show",
  description: "Partner with LNLS for campaigns across podcasts, video, and editorial."
});

export default function AdvertisePage() {
  return (
    <Prose className="space-y-6">
      <h1>Advertise with LNLS</h1>
      <p>
        Our audience spans die-hard Lakers fans, NBA obsessives, and global hoops culture. Choose from sponsor reads,
        newsletter placements, or bespoke content packages. Email <a href="mailto:ads@latenightlakeshow.com">ads@latenightlakeshow.com</a>.
      </p>
      <ul>
        <li>Podcast host-read ads</li>
        <li>Sponsored YouTube segments</li>
        <li>Newsletter takeovers</li>
        <li>Live event activations</li>
      </ul>
    </Prose>
  );
}
