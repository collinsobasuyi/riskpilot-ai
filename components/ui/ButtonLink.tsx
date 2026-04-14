import Link from "next/link";
import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition";
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50";

  return (
    <Link href={href} className={[base, styles, className].join(" ")}>
      {children}
    </Link>
  );
}