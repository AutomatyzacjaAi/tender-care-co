import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Check, Plus, Trash2, Users, X } from "lucide-react";
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
import { PLN, formatDateShort } from "@/lib/format";
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

const SECTION_PRESETS = [
  { name: "Powitalna kawa", time: "09:00" },
  { name: "Przerwa kawowa", time: "11:00" },
  { name: "Lunch", time: "13:00" },
  { name: "Przerwa popołudniowa", time: "15:30" },
  { name: "Kolacja", time: "19:00" },
  { name: "Cocktail / wieczór", time: "21:00" },
];

function ConfigureStep() {
  const navigate = useNavigate();
  const {
    state,
    syncDaysFromContact,
    addSection,
    removeSection,
    updateSectionGuests,
    setActiveSection,
    addItem,
    removeItem,
    totals,
  } = useOffer();

  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATALOG[0].id);
  const activeCategory = useMemo(
    () => CATALOG.find((c) => c.id === activeCategoryId) ?? CATALOG[0],
    [activeCategoryId],
  );
  const [previewVariant, setPreviewVariant] = useState<Variant | null>(null);

  // New section dialog
  const [newSectionFor, setNewSectionFor] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionTime, setNewSectionTime] = useState("");
  const [newSectionGuests, setNewSectionGuests] = useState<number>(
    state.contact.defaultGuests || 100,
  );

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
  const activeSection = useMemo(() => {
    for (const d of state.days) {
      const sec = d.sections.find((s) => s.id === activeSectionId);
      if (sec) return { section: sec, date: d.date };
    }
    return null;
  }, [state.days, activeSectionId]);

  // Auto-select first section if none active
  useEffect(() => {
    if (!activeSectionId) {
      const first = state.days.flatMap((d) => d.sections)[0];
      if (first) setActiveSection(first.id);
    }
  }, [activeSectionId, state.days, setActiveSection]);

  function openNewSection(date: string) {
    setNewSectionFor(date);
    setNewSectionName("");
    setNewSectionTime("");
    setNewSectionGuests(state.contact.defaultGuests || 100);
  }

  function commitNewSection() {
    if (!newSectionFor) return;
    const name = newSectionName.trim();
    if (!name) return;
    addSection(newSectionFor, name, newSectionGuests, newSectionTime || undefined);
    toast.success(`Sekcja "${name}" utworzona — wybierz teraz menu.`);
    setNewSectionFor(null);
    setNewSectionName("");
    setNewSectionTime("");
  }

  function handleAddVariant(variant: Variant) {
    if (!activeSectionId) {
      toast.error("Najpierw utwórz lub wybierz sekcję na górze strony.");
      return;
    }
    addItem(activeSectionId, variant.id);
    toast.success(`Dodano: ${variant.name}`);
  }

  const totalSectionsCount = state.days.reduce((acc, d) => acc + d.sections.length, 0);
  const totalItemsCount = state.days.reduce(
    (acc, d) => acc + d.sections.reduce((a, s) => a + s.items.length, 0),
    0,
  );

  return (
    <div className="bg-surface min-h-screen pb-20 lg:pb-0">
      <BrandHeader right={<Stepper />} />

      {/* TOP BAR — Days & Sections */}
      <SectionsTopBar
        onAddSection={openNewSection}
        activeSectionId={activeSectionId}
        onSelect={(id) => setActiveSection(id)}
        onRemove={removeSection}
        onGuestsChange={updateSectionGuests}
      />

      <main className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:gap-10 lg:py-8">
        {/* LEFT — Categories */}
        <aside className="lg:sticky lg:top-[calc(theme(spacing.20)+theme(spacing.32))] lg:self-start">
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
          {/* Active section context strip */}
          {activeSection ? (
            <div className="border-accent/30 bg-accent-soft/60 mb-5 flex flex-col gap-1 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Wybierasz menu dla
                </p>
                <p className="text-accent font-serif text-lg font-medium">
                  {activeSection.section.name}
                  {activeSection.section.time && (
                    <span className="text-muted-foreground ml-2 text-sm font-normal">
                      · {activeSection.section.time}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{activeSection.section.guests} os.</span>
                <span className="text-border mx-1">·</span>
                <span>{formatDateShort(activeSection.date)}</span>
              </div>
            </div>
          ) : (
            <div className="border-border bg-surface-sunken/60 mb-5 rounded-xl border border-dashed px-4 py-4 text-sm text-muted-foreground">
              Najpierw utwórz sekcję na górze strony — np. „Lunch, 13:00, 80 os.” — a potem dodawaj do niej pozycje z menu.
            </div>
          )}

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
        </section>

      </main>

      {/* Sticky bottom bar — total + continue */}
      <div className="bg-surface-elevated/95 border-border-soft fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs text-muted-foreground">
              {totalItemsCount} {totalItemsCount === 1 ? "pozycja" : "pozycji"} ·{" "}
              {totalSectionsCount} {totalSectionsCount === 1 ? "sekcja" : "sekcji"}
            </p>
            <p className="font-serif text-lg font-medium text-foreground">
              {PLN.format(totals.brutto)} <span className="text-muted-foreground text-xs font-normal">brutto</span>
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/summary" })}
            disabled={totalItemsCount === 0}
            className="bg-accent text-accent-foreground hover:bg-accent-muted"
          >
            Podsumowanie →
          </Button>
        </div>
      </div>

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
              <DialogFooter className="border-border-soft flex-col gap-2 border-t bg-surface-sunken/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                {activeSection ? (
                  <p className="text-xs text-muted-foreground">
                    Trafi do <span className="text-foreground font-medium">{activeSection.section.name}</span>{" "}
                    · {activeSection.section.guests} os.
                  </p>
                ) : (
                  <p className="text-destructive text-xs">
                    Brak aktywnej sekcji — utwórz ją na górze.
                  </p>
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setPreviewVariant(null)}>
                    Zamknij
                  </Button>
                  <Button
                    disabled={!activeSection}
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
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New section dialog */}
      <Dialog open={!!newSectionFor} onOpenChange={(o) => !o && setNewSectionFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Nowa sekcja — {newSectionFor && formatDateShort(newSectionFor)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Szybki wybór
              </Label>
              <div className="flex flex-wrap gap-2">
                {SECTION_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setNewSectionName(p.name);
                      setNewSectionTime(p.time);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors",
                      newSectionName === p.name
                        ? "bg-accent text-accent-foreground border-accent"
                        : "border-border bg-surface-sunken text-foreground hover:bg-accent-soft",
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="secName" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Nazwa sekcji
                </Label>
                <Input
                  id="secName"
                  placeholder="np. Lunch"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="secTime" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Godzina
                </Label>
                <Input
                  id="secTime"
                  type="time"
                  value={newSectionTime}
                  onChange={(e) => setNewSectionTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secGuests" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Liczba osób
              </Label>
              <Input
                id="secGuests"
                type="number"
                min={1}
                value={newSectionGuests}
                onChange={(e) => setNewSectionGuests(Math.max(1, Number(e.target.value) || 1))}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Tyle porcji policzymy z każdej pozycji menu dodanej do tej sekcji.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setNewSectionFor(null)}
            >
              Anuluj
            </Button>
            <Button
              disabled={!newSectionName.trim() || newSectionGuests < 1}
              onClick={commitNewSection}
              className="bg-accent text-accent-foreground hover:bg-accent-muted"
            >
              Utwórz sekcję
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function SummaryCart({
    onContinue,
    totalItemsCount,
    onRemoveItem,
  }: {
    onContinue: () => void;
    totalItemsCount: number;
    onRemoveItem: (sectionId: string, itemId: string) => void;
  }) {
    return (
      <div className="bg-surface-elevated border-border-soft flex max-h-[calc(100vh-12rem)] flex-col rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-32px_rgba(0,0,0,0.1)]">
        <div className="border-border-soft border-b px-5 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Podsumowanie
          </p>
          <h3 className="mt-1 font-serif text-xl font-medium text-foreground">
            {state.contact.eventName || "Twój event"}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {totalItemsCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              Brak pozycji. Utwórz sekcję i dodaj menu z lewej strony.
            </p>
          ) : (
            state.days.map((d) => {
              if (d.sections.every((s) => s.items.length === 0)) return null;
              return (
                <div key={d.date} className="mb-4 last:mb-0">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-foreground">
                    {formatDateShort(d.date)}
                  </p>
                  {d.sections.map((sec) => {
                    if (sec.items.length === 0) return null;
                    return (
                      <div key={sec.id} className="mb-3">
                        <p className="text-xs font-medium text-foreground">
                          {sec.name}{" "}
                          <span className="text-muted-foreground font-normal">
                            · {sec.guests} os.
                          </span>
                        </p>
                        <ul className="mt-1 space-y-1">
                          {sec.items.map((it) => {
                            const found = findVariant(it.variantId);
                            if (!found) return null;
                            const { variant } = found;
                            const lineTotal =
                              variant.pricePerGuest * it.guests * (1 + variant.vatRate);
                            return (
                              <li
                                key={it.id}
                                className="flex items-center justify-between gap-2 text-xs"
                              >
                                <span className="text-foreground truncate">
                                  {variant.name}
                                </span>
                                <div className="flex shrink-0 items-center gap-1.5">
                                  <span className="text-muted-foreground tabular-nums">
                                    {PLN.format(lineTotal)}
                                  </span>
                                  <button
                                    onClick={() => onRemoveItem(sec.id, it.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                    aria-label="Usuń"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="border-border-soft bg-surface-sunken/50 border-t px-5 py-4">
          <div className="mb-3 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Netto</span>
              <span className="tabular-nums">{PLN.format(totals.netto)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT</span>
              <span className="tabular-nums">{PLN.format(totals.vat)}</span>
            </div>
          </div>
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Razem</span>
            <span className="font-serif text-2xl font-medium text-foreground tabular-nums">
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

function SectionsTopBar({
  onAddSection,
  activeSectionId,
  onSelect,
  onRemove,
  onGuestsChange,
}: {
  onAddSection: (date: string) => void;
  activeSectionId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onGuestsChange: (id: string, guests: number) => void;
}) {
  const { state } = useOffer();

  return (
    <div className="bg-surface-elevated/80 border-border-soft sticky top-16 z-30 border-b backdrop-blur">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Sekcje wydarzenia
          </p>
          <p className="text-[11px] text-muted-foreground">
            Wybierz sekcję, do której dodajesz menu z dołu
          </p>
        </div>
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {state.days.map((d, idx) => (
            <div key={d.date} className="flex shrink-0 flex-col gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Dzień {idx + 1}
                </span>
                <span className="text-foreground text-xs font-medium">
                  {formatDateShort(d.date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {d.sections.length === 0 && (
                  <span className="text-muted-foreground text-xs italic">brak sekcji</span>
                )}
                {d.sections.map((sec) => {
                  const isActive = sec.id === activeSectionId;
                  return (
                    <div
                      key={sec.id}
                      className={cn(
                        "group flex shrink-0 items-stretch overflow-hidden rounded-full border transition-colors",
                        isActive
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-surface text-foreground hover:border-accent/50",
                      )}
                    >
                      <button
                        onClick={() => onSelect(sec.id)}
                        className="flex items-center gap-1.5 py-1.5 pl-3 pr-2 text-xs font-medium"
                      >
                        {isActive && <Check className="h-3 w-3" />}
                        <span>{sec.name}</span>
                        {sec.time && (
                          <span
                            className={cn(
                              "text-[10px]",
                              isActive ? "text-accent-foreground/80" : "text-muted-foreground",
                            )}
                          >
                            {sec.time}
                          </span>
                        )}
                      </button>
                      <div
                        className={cn(
                          "flex items-center gap-0.5 border-l px-1.5",
                          isActive ? "border-accent-foreground/20" : "border-border",
                        )}
                      >
                        <Users
                          className={cn(
                            "h-3 w-3",
                            isActive ? "text-accent-foreground/80" : "text-muted-foreground",
                          )}
                        />
                        <input
                          type="number"
                          min={1}
                          value={sec.guests}
                          onChange={(e) =>
                            onGuestsChange(sec.id, Number(e.target.value) || 1)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "w-10 bg-transparent text-center text-xs tabular-nums focus:outline-none",
                            isActive ? "text-accent-foreground" : "text-foreground",
                          )}
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Usunąć sekcję "${sec.name}"?`)) onRemove(sec.id);
                        }}
                        className={cn(
                          "border-l px-2 transition-colors",
                          isActive
                            ? "border-accent-foreground/20 text-accent-foreground/70 hover:text-accent-foreground"
                            : "border-border text-muted-foreground hover:text-destructive",
                        )}
                        aria-label="Usuń sekcję"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => onAddSection(d.date)}
                  className="border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground flex shrink-0 items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  dodaj sekcję
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <CalendarPlus className="h-3 w-3" />
          Aby dodać kolejny dzień, zmień zakres dat w kroku 1.
        </p>
      </div>
    </div>
  );
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
          <Plus className="h-4 w-4" />
        </div>
      </div>
    </article>
  );
}
