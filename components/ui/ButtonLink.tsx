import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export default function ButtonLink({ href, children, variant = "primary", className = "" }: Props) {
  const base = "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-150 rounded-sm";

  const styles =
    variant === "primary"
      ? "bg-blue-700 text-white hover:bg-blue-800 shadow-sm"
      : variant === "secondary"
      ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400"
      : "text-blue-700 hover:text-blue-800 underline underline-offset-4";

  return (
    <Link href={href} className={[base, styles, className].join(" ")}>
      {children}
    </Link>
  );
}
