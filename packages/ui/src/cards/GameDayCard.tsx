export type GameDayCardProps = {
  opponent: string;
  date: string;
  venue?: string;
  status?: string;
  tv?: string;
  radio?: string;
};

export const GameDayCard = ({ opponent, date, venue, status, tv, radio }: GameDayCardProps) => {
  return (
    <section className="rounded-2xl border border-slateBase/60 bg-charcoal/80 p-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase text-metaGray">Game Day</p>
        <h3 className="font-headline text-3xl text-offWhite">Lakers vs. {opponent}</h3>
        <p className="text-offWhite/80">{new Date(date).toLocaleString()}</p>
        {venue ? <p className="text-offWhite/60">{venue}</p> : null}
        <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-offWhite/80 md:grid-cols-3">
          {status ? <span>Status: {status}</span> : null}
          {tv ? <span>TV: {tv}</span> : null}
          {radio ? <span>Radio: {radio}</span> : null}
        </div>
      </div>
    </section>
  );
};
