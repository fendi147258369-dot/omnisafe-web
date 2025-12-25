type TagPillsProps = {
  tags: string[];
  emptyLabel?: string;
};

export function TagPills({ tags, emptyLabel = "-" }: TagPillsProps) {
  if (!tags.length) {
    return <span className="text-xs text-slate-400">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
