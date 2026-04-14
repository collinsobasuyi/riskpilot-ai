import React from "react";

type Props = {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
};

export default function Card({
  title,
  icon,
  children,
  className = "",
  headerRight,
}: Props) {
  return (
    <section
      className={[
        "rounded-2xl border border-zinc-200 bg-white shadow-sm",
        "p-5 sm:p-6",
        className,
      ].join(" ")}
    >
      {(title || headerRight || icon) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 border border-zinc-200">
                {icon}
              </div>
            ) : null}
            {title ? (
              <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            ) : null}
          </div>

          {headerRight ? <div className="shrink-0">{headerRight}</div> : null}
        </div>
      )}

      {children}
    </section>
  );
}