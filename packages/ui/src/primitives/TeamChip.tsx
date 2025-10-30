export type TeamChipProps = {
  name: string;
  abbreviation?: string;
  colors?: string[];
};

export const TeamChip = ({ name, abbreviation, colors = [] }: TeamChipProps) => {
  const gradient = colors.length >= 2 ? `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` : colors[0];
  return (
    <span
      className="flex items-center gap-2 rounded-full border border-slateBase/60 px-3 py-1 text-xs uppercase tracking-wide text-offWhite"
      style={gradient ? { background: `${gradient}15`, borderColor: gradient ?? undefined } : undefined}
    >
      <span className="font-semibold text-offWhite">{abbreviation ?? name}</span>
      <span className="text-offWhite/70">{name}</span>
    </span>
  );
};
