export function BadgeList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-slate-500">暂无特别提示。</p>;
  return (
    <ul className="grid gap-1 text-sm text-slate-900">
      {items.map((item, idx) => (
        <li
          key={idx}
          className="rounded border border-amber-500/40 bg-amber-50 px-3 py-2 leading-6 text-amber-800"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
