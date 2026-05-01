import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, X, Sparkles } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CATALOG, findVariant, type Variant } from "@/data/catalog";
import { useOffer } from "@/context/OfferContext";
import { PLN, formatDateLong, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/configure")({
  head: () => ({
    meta: [
      { title: "Krok 2 — Konfiguracja menu · Jurek Catering" },
      {
        name: "description",
        content: "Wybierz pakiety menu na każdy dzień wydarzenia.",
      },
    ],
  }),
  component: ConfigureStep,
});

function ConfigureStep() {
  const navigate = useNavigate();
  const {
    state,
    syncDaysFromContact,
    addSection,
    removeSection,
    setActiveSection,
    addItem,
    updateItemGuests,
    removeItem,
    totals,
  } = useOffer();

  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATALOG[0].id);
  const activeCategory = useMemo(
    () => CATALOG.find((c) => c.id === activeCategoryId) ?? CATALOG[0],
    [activeCategoryId],
  );
  const [previewVariant, setPreviewVariant] = useState<Variant | null>(null);
  const [pendingVariant, setPendingVariant] = useState<Variant | null>(null);
  const [newSectionFor, setNewSectionFor] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionTime, setNewSectionTime] = useState("");
  const [showCart, setShowCart] = useState(false);

  // Guard: if user lands here without contact data, redirect to step 1
  useEffect(() => {
    if (!state.contact.startDate || !state.contact.endDate) {
      navigate({ to: "/" });
      return;
    }
    if (state.days.length === 0) {
      syncDaysFromContact();
    }
  }, [state.contact.startDate, state.contact.endDate, state.days.length, navigate, syncDaysFromContact]);

  const activeSectionId = state.activeSectionId;

  function handleAddVariant(variant: Variant) {
    if (activeSectionId) {
      addItem(activeSectionId, variant.id);
      toast.success(`Dodano: ${variant.name}`);
    } else {
      setPendingVariant(variant);
    }
  }

  function chooseSection(sectionId: string) {
    if (!pendingVariant) return;
    addItem(sectionId, pendingVariant.id);
    setActiveSection(sectionId);
    toast.success(`Dodano: ${pendingVariant.name}`);
    setPendingVariant(null);
  }

  function commitNewSection(date: string) {
    const name = newSectionName.trim();
    if (!name) return;
    const id = addSection(date, name, newSectionTime || undefined);
    setNewSectionName("");
    setNewSectionTime("");
    setNewSectionFor(null);
    if (pendingVariant) {
      addItem(id, pendingVariant.id);
      toast.success(`Utworzono sekcję i dodano ${pendingVariant.name}`);
      setPendingVariant(null);
    }
  }

  const totalSectionsCount = state.days.reduce((acc, d) => acc + d.sections.length, 0);
  const totalItemsCount = state.days.reduce(
    (acc, d) => acc + d.sections.reduce((a, s) => a + s.items.length, 0),
    0,
  );

  return (
    <div className="bg-surface min-h-screen">
      <BrandHeader right={<Stepper />} />

      <main className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[200px_1fr_360px] lg:gap-8 lg:py-8">
        {/* LEFT — Categories */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-3 px-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Kategorie
          </p>
          {/* Mobile: horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {CATALOG.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors",
                  cat.id === activeCategoryId
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-surface-elevated border-border text-foreground",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {/* Desktop: vertical list */}
          <ul className="hidden flex-col gap-1 lg:flex">
            {CATALOG.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "bg-accent-soft text-accent"
                        : "text-foreground hover:bg-surface-sunken",
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-widest",
                        isActive ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      {cat.symbol}
                    </span>
                    <span className="text-sm font-medium leading-tight">{cat.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* MIDDLE — Variants */}
        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {activeCategory.symbol} · Kategoria
            </p>
            <h2 className="mt-1 font-serif text-3xl font-medium text-foreground sm:text-4xl">
              {activeCategory.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {activeCategory.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {activeCategory.variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                onPreview={() => setPreviewVariant(variant)}
              />
            ))}
          </div>

          {/* Active section banner */}
          {activeSectionId && (
            <div className="bg-accent-soft text-accent border-accent/20 mt-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>
                Pozycje dodawane są do aktywnej sekcji. Możesz ją zmienić w panelu po prawej.
              </span>
            </div>
          )}
        </section>

        {/* RIGHT — Event cart */}
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <EventCart
            onContinue={() => navigate({ to: "/summary" })}
            onAddSection={(date) => setNewSectionFor(date)}
          />
        </aside>
      </main>

      {/* Mobile sticky cart trigger */}
      <div className="bg-surface-elevated/95 border-border-soft fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {totalItemsCount} {totalItemsCount === 1 ? "pozycja" : "pozycji"} ·{" "}
              {totalSectionsCount} {totalSectionsCount === 1 ? "sekcja" : "sekcji"}
            </p>
            <p className="font-serif text-lg font-medium text-foreground">
              {PLN.format(totals.brutto)}
            </p>
          </div>
          <Button onClick={() => setShowCart(true)} className="bg-accent text-accent-foreground hover:bg-accent-muted">
            Twój event ↑
          </Button>
        </div>
      </div>

      {/* Mobile cart drawer */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Twój event</DialogTitle>
          </DialogHeader>
          <EventCart
            onContinue={() => {
              setShowCart(false);
              navigate({ to: "/summary" });
            }}
            onAddSection={(date) => setNewSectionFor(date)}
          />
        </DialogContent>
      </Dialog>

      {/* Variant menu preview dialog */}
      <Dialog open={!!previewVariant} onOpenChange={(o) => !o && setPreviewVariant(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
          {previewVariant && (
            <>
              <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
                <img
                  src={previewVariant.image}
                  alt={previewVariant.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="px-6 pb-2 pt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {activeCategory.name}
                </p>
                <DialogHeader className="mt-1 space-y-1 text-left">
                  <DialogTitle className="font-serif text-2xl font-medium">
                    {previewVariant.name}
                  </DialogTitle>
                </DialogHeader>
                <p className="mt-2 text-sm text-muted-foreground">{previewVariant.tagline}</p>
                <div className="border-border-soft mt-4 flex items-baseline justify-between border-t pt-4">
                  <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Cena
                  </span>
                  <div className="text-right">
                    <span className="font-serif text-2xl font-medium text-foreground">
                      {PLN.format(previewVariant.pricePerGuest)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {previewVariant.pricingUnit === "per_guest" ? "/ osoba" : "/ szt"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Menu — pełny zestaw
                </p>
                <ul className="bg-surface-sunken/60 space-y-2 rounded-lg p-4 text-sm text-foreground">
                  {previewVariant.menu.map((item, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="text-accent mt-0.5">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Menu jest ustalone — klient nie wybiera pozycji indywidualnie.
                </p>
              </div>
              <DialogFooter className="border-border-soft border-t bg-surface-sunken/40 px-6 py-4">
                <Button variant="ghost" onClick={() => setPreviewVariant(null)}>
                  Zamknij
                </Button>
                <Button
                  onClick={() => {
                    const v = previewVariant;
                    setPreviewVariant(null);
                    handleAddVariant(v);
                  }}
                  className="bg-accent text-accent-foreground hover:bg-accent-muted"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Dodaj do sekcji
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Pending variant — choose section dialog */}
      <Dialog open={!!pendingVariant} onOpenChange={(o) => !o && setPendingVariant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Do której sekcji dodać {pendingVariant?.name}?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {state.days.map((d) => (
              <div key={d.date} className="space-y-1.5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {formatDateLong(d.date)}
                </p>
                {d.sections.length === 0 ? (
                  <button
                    onClick={() => setNewSectionFor(d.date)}
                    className="border-border bg-surface-sunken text-muted-foreground hover:bg-accent-soft hover:text-accent w-full rounded-lg border border-dashed px-3 py-3 text-sm transition-colors"
                  >
                    + utwórz pierwszą sekcję dla tego dnia
                  </button>
                ) : (
                  d.sections.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => chooseSection(sec.id)}
                      className="border-border bg-surface-elevated hover:bg-accent-soft flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors"
                    >
                      <span className="font-medium">{sec.name}</span>
                      {sec.time && <span className="text-xs text-muted-foreground">{sec.time}</span>}
                    </button>
                  ))
                )}
                <button
                  onClick={() => setNewSectionFor(d.date)}
                  className="text-accent hover:text-accent-muted text-xs"
                >
                  + dodaj nową sekcję
                </button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* New section dialog */}
      <Dialog open={!!newSectionFor} onOpenChange={(o) => !o && setNewSectionFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Nowa sekcja — {newSectionFor && formatDateLong(newSectionFor)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="secName" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Nazwa sekcji
              </Label>
              <Input
                id="secName"
                placeholder="np. Powitalna kawa, Lunch, Kolacja"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="secTime" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Godzina (opcjonalnie)
              </Label>
              <Input
                id="secTime"
                type="time"
                value={newSectionTime}
                onChange={(e) => setNewSectionTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setNewSectionFor(null);
                setNewSectionName("");
                setNewSectionTime("");
              }}
            >
              Anuluj
            </Button>
            <Button
              disabled={!newSectionName.trim()}
              onClick={() => newSectionFor && commitNewSection(newSectionFor)}
              className="bg-accent text-accent-foreground hover:bg-accent-muted"
            >
              Dodaj sekcję
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function EventCart({
    onContinue,
    onAddSection,
  }: {
    onContinue: () => void;
    onAddSection: (date: string) => void;
  }) {
    return (
      <div className="bg-surface-elevated border-border-soft flex max-h-[calc(100vh-7rem)] flex-col rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-32px_rgba(0,0,0,0.1)]">
        <div className="border-border-soft border-b px-5 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Twój event</p>
          <h3 className="mt-1 font-serif text-xl font-medium text-foreground">
            {state.contact.eventName || "Bez nazwy"}
          </h3>
          {state.contact.location && (
            <p className="mt-0.5 text-xs text-muted-foreground">{state.contact.location}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {state.days.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Najpierw wypełnij daty wydarzenia w kroku 1.
            </p>
          )}
          {state.days.map((d) => (
            <div key={d.date} className="mb-5 last:mb-0">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-foreground">
                {formatDateShort(d.date)}
              </p>
              <div className="space-y-2">
                {d.sections.map((sec) => {
                  const isActive = sec.id === activeSectionId;
                  return (
                    <div
                      key={sec.id}
                      className={cn(
                        "rounded-lg border transition-colors",
                        isActive
                          ? "border-accent bg-accent-soft"
                          : "border-border-soft bg-surface",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 px-3 py-2">
                        <button
                          onClick={() => setActiveSection(isActive ? null : sec.id)}
                          className="flex flex-1 flex-col items-start text-left"
                        >
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isActive ? "text-accent" : "text-foreground",
                            )}
                          >
                            {sec.name}
                          </span>
                          {sec.time && (
                            <span className="text-[11px] text-muted-foreground">{sec.time}</span>
                          )}
                        </button>
                        <button
                          onClick={() => removeSection(sec.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Usuń sekcję"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {sec.items.length > 0 && (
                        <ul className="border-border-soft space-y-1.5 border-t px-3 py-2">
                          {sec.items.map((it) => {
                            const found = findVariant(it.variantId);
                            if (!found) return null;
                            const { variant, category } = found;
                            const lineTotal =
                              variant.pricePerGuest * it.guests * (1 + variant.vatRate);
                            return (
                              <li key={it.id} className="text-xs">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground">{variant.name}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                      {category.name}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeItem(sec.id, it.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                    aria-label="Usuń pozycję"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                <div className="mt-1 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Input
                                      type="number"
                                      min={1}
                                      value={it.guests}
                                      onChange={(e) =>
                                        updateItemGuests(
                                          sec.id,
                                          it.id,
                                          Number(e.target.value) || 1,
                                        )
                                      }
                                      className="h-7 w-16 text-xs"
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                      {variant.pricingUnit === "per_guest" ? "os" : "szt"}
                                    </span>
                                  </div>
                                  <span className="font-medium text-foreground">
                                    {PLN.format(lineTotal)}
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={() => onAddSection(d.date)}
                  className="border-border text-muted-foreground hover:border-accent hover:text-accent flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  dodaj sekcję
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-border-soft bg-surface-sunken/50 border-t px-5 py-4">
          <div className="mb-3 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Netto</span>
              <span>{PLN.format(totals.netto)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT</span>
              <span>{PLN.format(totals.vat)}</span>
            </div>
          </div>
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Razem</span>
            <span className="font-serif text-2xl font-medium text-foreground">
              {PLN.format(totals.brutto)}
            </span>
          </div>
          <Button
            onClick={onContinue}
            disabled={totalItemsCount === 0}
            className="bg-accent text-accent-foreground hover:bg-accent-muted w-full"
          >
            Dalej — podsumowanie →
          </Button>
          <Link
            to="/"
            className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground"
          >
            ← wróć do danych
          </Link>
        </div>
      </div>
    );
  }
}

function VariantCard({ variant, onPreview }: { variant: Variant; onPreview: () => void }) {
  const unitLabel = variant.pricingUnit === "per_guest" ? "/ osoba" : "/ szt";
  return (
    <article
      onClick={onPreview}
      className="bg-surface-elevated border-border-soft group flex cursor-pointer flex-col overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={variant.image}
          alt={variant.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3 rounded-full bg-surface-elevated/95 px-3 py-1 text-[10px] uppercase tracking-widest text-foreground backdrop-blur">
          {variant.menu.length} pozycji w menu
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-xl font-medium text-foreground">{variant.name}</h3>
          <div className="text-right">
            <p className="font-serif text-lg font-medium text-foreground">
              {PLN.format(variant.pricePerGuest)}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {unitLabel}
            </p>
          </div>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{variant.tagline}</p>

        <div className="border-border-soft text-accent group-hover:bg-accent group-hover:text-accent-foreground mt-auto flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors">
          <span>Zobacz menu i dodaj</span>
          <ChevronDown className="h-4 w-4 -rotate-90" />
        </div>
      </div>
    </article>
  );
}
