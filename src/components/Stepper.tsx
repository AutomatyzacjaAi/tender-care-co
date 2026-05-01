import { Link, useRouterState } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Dane wydarzenia", path: "/" },
  { id: 2, label: "Konfiguracja menu", path: "/configure" },
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
      <ol className="flex items-center justify-center gap-2 sm:gap-6">
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;
          const Wrapper = isDone ? Link : "div";
          return (
            <li key={step.id} className="flex items-center gap-2 sm:gap-4">
              <Wrapper
                {...(isDone ? { to: step.path } : {})}
                className={cn(
                  "flex items-center gap-3 rounded-full px-2 py-1 transition-colors",
                  isDone && "hover:bg-accent-soft cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                    isActive && "bg-accent text-accent-foreground border-accent",
                    isDone && "bg-accent-soft text-accent border-accent/30",
                    !isActive && !isDone && "border-border text-muted-foreground bg-transparent",
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : step.id}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-medium tracking-tight sm:inline",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </Wrapper>
              {idx < steps.length - 1 && (
                <span
                  className={cn(
                    "h-px w-6 sm:w-16 transition-colors",
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
