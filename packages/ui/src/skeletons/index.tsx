import clsx from "clsx";

type SkeletonProps = {
  className?: string;
};

const pulse = "animate-pulse bg-slateBase/60";

export const SkeletonBlock = ({ className }: SkeletonProps) => (
  <div className={clsx("rounded-xl", pulse, className)} />
);

export const SkeletonList = ({ count = 3, className }: SkeletonProps & { count?: number }) => (
  <div className={clsx("flex flex-col gap-4", className)}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="space-y-3">
        <div className="h-6 w-1/3 rounded-full bg-slateBase/80" />
        <div className="h-4 w-2/3 rounded-full bg-slateBase/70" />
      </div>
    ))}
  </div>
);
