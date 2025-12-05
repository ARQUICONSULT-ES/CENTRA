import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
        hover && "transition-all hover:border-gray-300 hover:shadow-md dark:hover:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
}
