import clsx from "clsx";

export type TagBadgeProps = {
  label: string;
  variant?: "solid" | "outline";
};

export const TagBadge = ({ label, variant = "solid" }: TagBadgeProps) => (
  <span
    className={clsx(
      "rounded-full px-3 py-1 text-xs uppercase tracking-wide",
      variant === "solid"
        ? "bg-neonPurple/20 text-neonPurple"
        : "border border-neonPurple/60 text-neonPurple"
    )}
  >
    {label}
  </span>
);
