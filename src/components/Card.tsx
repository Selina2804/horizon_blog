// src/components/Card.tsx
import { cn } from "../lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm p-4 transition hover:shadow-md hover:border-gray-300",
        className
      )}
    >
      {children}
    </div>
  );
}
