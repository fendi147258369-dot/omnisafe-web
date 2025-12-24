import { ReactNode } from "react";

export function Section({
  title,
  description,
  children,
  className = "",
  titleAlign = "left",
  id,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleAlign?: "left" | "center";
  id?: string;
}) {
  const headerAlignClass = titleAlign === "center" ? "text-center" : "text-left";
  return (
    <section
      id={id}
      className={`mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm ${className}`}
    >
      <div className={`mb-3 ${headerAlignClass}`}>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="text-xs text-slate-500 leading-6">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
