import React from "react";

type Props = {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
  subtle?: boolean;
};

export default function Card({ title, icon, children, className = "", headerRight, subtle }: Props) {
  const surface = subtle ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200";

  return (
    <section className={["rounded-sm border shadow-none", surface, "p-5 sm:p-6", className].join(" ")}>
      {(title || headerRight || icon) && (
        <div className="mb-4 flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className="shrink-0 text-blue-700">{icon}</div>
            )}
            {title && (
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">{title}</h2>
            )}
          </div>
          {headerRight && <div className="shrink-0">{headerRight}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
