import { Link } from "@tanstack/react-router";

export function BrandHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-border-soft bg-surface/80 supports-[backdrop-filter]:bg-surface/60 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-serif text-xl font-semibold tracking-tight text-foreground">
            Jurek
          </span>
          <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Catering
          </span>
        </Link>
        <div className="flex items-center gap-4">{right}</div>
      </div>
    </header>
  );
}
