import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
}

export function Card({ children, glass = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${
        glass
          ? "bg-white/70 backdrop-blur-md border border-white/40 shadow-premium"
          : "bg-white border border-slate-100/80 shadow-premium"
      } p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
