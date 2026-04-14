// components/layout/Container.tsx

import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({ children, className = "" }: Props) {
  return (
    <div
      className={[
        "mx-auto w-full max-w-6xl px-5", // width + horizontal padding only
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}