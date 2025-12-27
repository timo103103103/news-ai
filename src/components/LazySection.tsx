import React from "react";

interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function LazySection({
  children,
  className = "",
}: LazySectionProps) {
  return <div className={className}>{children}</div>;
}
