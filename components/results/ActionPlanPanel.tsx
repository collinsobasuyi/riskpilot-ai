type Recs = { critical: string[]; high: string[]; medium: string[] };

type Column = {
  label: string;
  days: string;
  items: string[];
  borderColor: string;
  labelColor: string;
  bgColor: string;
};

export function ActionPlanPanel({ recommendations }: { recommendations: Recs }) {
  const { critical, high, medium } = recommendations;

  if (!critical.length && !high.length && !medium.length) return null;

  const columns: Column[] = [
    {
      label: "CRITICAL",
      days: "30 DAYS",
      items: critical,
      borderColor: "border-red-500",
      labelColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "HIGH",
      days: "60 DAYS",
      items: high,
      borderColor: "border-amber-500",
      labelColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "MEDIUM",
      days: "90 DAYS",
      items: medium,
      borderColor: "border-blue-500",
      labelColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {columns.map((col) => (
        <div key={col.label} className={`border-l-4 ${col.borderColor} pl-4`}>
          <p className={`text-sm font-bold uppercase tracking-widest ${col.labelColor}`}>
            {col.days}
          </p>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            {col.label} priority
          </p>
          {col.items.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No actions required</p>
          ) : (
            <div className="space-y-2.5">
              {col.items.map((item) => (
                <div
                  key={item}
                  className={`rounded-sm px-3.5 py-2.5 text-sm text-slate-700 leading-relaxed ${col.bgColor}`}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
