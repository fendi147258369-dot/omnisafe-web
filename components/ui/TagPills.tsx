import clsx from "clsx";

type TagPillsProps = {
  tags: string[];
  emptyLabel?: string;
  className?: string;
  pillClassName?: string;
};

export function TagPills({ tags, emptyLabel = "-", className, pillClassName }: TagPillsProps) {
  if (!tags.length) {
    return <span className="text-xs text-slate-400">{emptyLabel}</span>;
  }

  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {tags.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className={clsx(
            "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700",
            pillClassName
          )}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
