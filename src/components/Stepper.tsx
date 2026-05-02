import { Link, useRouterState } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Konfiguracja menu", path: "/" },
  { id: 2, label: "Dane kontaktowe", path: "/contact" },
  { id: 3, label: "Podsumowanie", path: "/summary" },
] as const;

export function Stepper() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.path === pathname),
  );

  return (
    <nav aria-label="Kroki kreatora" className="w-full">
      <ol className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          const content = (
            <span className="flex items-center gap-2 sm:gap-3">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  isActive && "bg-accent text-accent-foreground border-accent",
                  isDone && "bg-accent-soft text-accent border-accent/30",
                  !isActive && !isDone && "border-border text-muted-foreground bg-transparent",
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium tracking-tight sm:inline",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </span>
          );
          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-3">
              <Link
                to={step.path}
                className="hover:bg-accent-soft rounded-full px-1.5 py-1 transition-colors"
              >
                {content}
              </Link>
              {idx < steps.length - 1 && (
                <span
                  className={cn(
                    "h-px w-5 sm:w-10 transition-colors",
                    idx < currentIndex ? "bg-accent/40" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
