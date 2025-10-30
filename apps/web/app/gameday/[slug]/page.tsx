import type { Metadata } from "next";
import { GameDayCard } from "@lnls/ui";
import { buildMetadata } from "../../../src/utils/metadata";

type GameDayStub = {
  opponent: string;
  gameDateTime: string;
  venue: string;
  status: string;
  tv?: string;
  radio?: string;
};

const getGameDay = async (slug: string): Promise<GameDayStub> => {
  // Placeholder: extend with Sanity query once dataset is populated
  return {
    opponent: slug.replace(/-/g, " ").toUpperCase(),
    gameDateTime: new Date().toISOString(),
    venue: "Crypto.com Arena",
    status: "Preview"
  };
};

export const generateMetadata = async ({ params }: { params: { slug: string } }): Promise<Metadata> => {
  const gameDay = await getGameDay(params.slug);
  if (!gameDay) {
    return buildMetadata({
      title: "Game Day | Late Night Lake Show",
      description: "Previews, breakdowns, and live updates for Lakers game day."
    });
  }

  return buildMetadata({
    title: `${gameDay.opponent} Preview | Late Night Lake Show`,
    description: `Lakers vs ${gameDay.opponent} on ${gameDay.gameDateTime}`
  });
};

export default async function GameDayPage({ params }: { params: { slug: string } }) {
  const gameDay = await getGameDay(params.slug);
  return (
    <div className="space-y-6">
      <GameDayCard
        opponent={gameDay.opponent}
        date={gameDay.gameDateTime}
        venue={gameDay.venue}
        status={gameDay.status}
        tv={gameDay.tv}
        radio={gameDay.radio}
      />
      <div className="rounded-2xl border border-slateBase/40 bg-charcoal/80 p-6 text-offWhite/70">
        <p>Extended game analysis is coming soon.</p>
      </div>
    </div>
  );
}
