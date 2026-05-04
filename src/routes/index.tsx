import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Check, ChevronDown, ChevronUp, Plus, Trash2, Users } from "lucide-react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CATALOG, findVariant, type Variant } from "@/data/catalog";
import { useOffer } from "@/context/OfferContext";
import { PLN, formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krok 1 — Konfiguracja menu · Jurek Catering" },
      {
        name: "description",
        content: "Skonfiguruj menu cateringowe dla swojego wydarzenia: dodaj dni, sekcje (przerwy, lunch, kolacje) i wybierz warianty menu.",
      },
      { property: "og:title", content: "Konfigurator oferty cateringowej · Jurek Catering" },
      { property: "og:description", content: "Stwórz w 3 krokach ofertę cateringową dopasowaną do Twojego wydarzenia." },
    ],
  }),
  component: ConfigureStep,
});


function ConfigureStep() {
  const navigate = useNavigate();
  const {
    state,
    ensureDefaultDay,
    addDay,
    removeDay,
    setDayDate,
    addSection,
    removeSection,
    updateSectionGuests,
    setActiveSection,
    addItem,
    removeItem,
    totals,
  } = useOffer();
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATALOG[0].id);
  const activeCategory = useMemo(
    () => CATALOG.find((c) => c.id === activeCategoryId) ?? CATALOG[0],
    [activeCategoryId],
  );
  const [previewVariant, setPreviewVariant] = useState<Variant | null>(null);
  // Sidebar tree state (e-commerce style) — pilot: Przerwa kawowa
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>("coffee-break");
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [previewMenu, setPreviewMenu] = useState<{ variant: Variant; menuId: string } | null>(null);

  const activeVariant = useMemo(() => {
    if (!activeVariantId) return null;
    for (const cat of CATALOG) {
      const v = cat.variants.find((x) => x.id === activeVariantId);
      if (v) return { category: cat, variant: v };
    }
    return null;
  }, [activeVariantId]);

  // New section dialog
  const [newSectionFor, setNewSectionFor] = useState<number | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionTime, setNewSectionTime] = useState("");
  const [newSectionEndTime, setNewSectionEndTime] = useState("");
  const [newSectionGuests, setNewSectionGuests] = useState<number>(
    state.contact.defaultGuests || 100,
  );

  // Avoid SSR/CSR mismatch — days/sections come from localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    ensureDefaultDay();
  }, [ensureDefaultDay]);

  // Krok 1 (dane kontaktowe) musi być uzupełniony — wracamy do niego, jeśli brak imienia/e-maila.
  useEffect(() => {
    if (!mounted) return;
    if (!state.contact.fullName.trim() || !state.contact.email.trim()) {
      navigate({ to: "/contact" });
    }
  }, [mounted, state.contact.fullName, state.contact.email, navigate]);

  const activeSectionId = state.activeSectionId;
  const activeSection = useMemo(() => {
    for (const d of state.days) {
      const sec = d.sections.find((s) => s.id === activeSectionId);
      if (sec) return { section: sec, dayIndex: d.index };
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

  function openNewSection(dayIndex: number) {
    setNewSectionFor(dayIndex);
    setNewSectionName("");
    setNewSectionTime("");
    setNewSectionEndTime("");
    setNewSectionGuests(state.contact.defaultGuests || 100);
  }

  function commitNewSection() {
    if (newSectionFor === null) return;
    const name = newSectionName.trim();
    if (!name) return;
    addSection(
      newSectionFor,
      name,
      newSectionGuests,
      newSectionTime || undefined,
      newSectionEndTime || undefined,
    );
    toast.success(`Sekcja "${name}" utworzona — wybierz teraz menu.`);
    setNewSectionFor(null);
    setNewSectionName("");
    setNewSectionTime("");
    setNewSectionEndTime("");
  }

  function handleAddVariant(variant: Variant, menuId?: string) {
    if (!activeSectionId) {
      toast.error("Najpierw utwórz lub wybierz sekcję na górze strony.");
      return;
    }
    addItem(activeSectionId, variant.id, menuId);
    const menuName = menuId ? variant.menus.find((m) => m.id === menuId)?.name : undefined;
    toast.success(`Dodano: ${variant.name}${menuName ? ` · ${menuName}` : ""}`);
  }

  const totalSectionsCount = state.days.reduce((acc, d) => acc + d.sections.length, 0);
  const totalItemsCount = state.days.reduce(
    (acc, d) => acc + d.sections.reduce((a, s) => a + s.items.length, 0),
    0,
  );

  return (
    <div className="bg-surface min-h-screen pb-20">
      <BrandHeader right={<Stepper />} />

      {/* TOP BAR — Days & Sections */}
      {mounted && (
        <SectionsTopBar
          onAddSection={openNewSection}
          onAddDay={() => {
            const idx = addDay();
            toast.success(`Dodano Dzień ${idx}`);
          }}
          onRemoveDay={(idx) => {
            if (state.days.length <= 1) {
              toast.error("Musi pozostać co najmniej jeden dzień.");
              return;
            }
            if (confirm(`Usunąć Dzień ${idx} wraz z wszystkimi sekcjami?`)) {
              removeDay(idx);
            }
          }}
          onDateChange={setDayDate}
          activeSectionId={activeSectionId}
          onSelect={(id) => setActiveSection(id)}
          onRemove={removeSection}
          onGuestsChange={updateSectionGuests}
        />
      )}

      <main className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_1fr] lg:gap-10 lg:py-8">
        {/* LEFT — Categories tree */}
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
          {/* Desktop: vertical tree (kategoria → wariant → menu) */}
          <ul className="hidden flex-col gap-0.5 lg:flex">
            {CATALOG.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              const isTreeCategory = cat.id === "coffee-break"; // pilot
              const isExpanded = isTreeCategory && expandedCategoryId === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setActiveCategoryId(cat.id);
                      if (isTreeCategory) {
                        setExpandedCategoryId((prev) => (prev === cat.id ? null : cat.id));
                      } else {
                        setActiveVariantId(null);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "bg-accent-soft text-accent"
                        : "text-foreground hover:bg-surface-sunken",
                    )}
                  >
                    {isTreeCategory ? (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-transform",
                          isExpanded ? "rotate-0" : "-rotate-90",
                          isActive ? "text-accent" : "text-muted-foreground",
                        )}
                      />
                    ) : (
                      <span className="w-3.5" />
                    )}
                    <span
                      className={cn(
                        "font-mono text-[10px] tracking-widest",
                        isActive ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      {cat.symbol}
                    </span>
                    <span className="flex-1 text-sm font-medium leading-tight">{cat.name}</span>
                  </button>

                  {/* Warianty pod kategorią (drzewo) */}
                  {isTreeCategory && isExpanded && (
                    <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-border-soft pl-2">
                      {cat.variants.map((variant) => {
                        const variantActive = activeVariantId === variant.id;
                        const unitLabel = variant.pricingUnit === "per_guest" ? "/ os" : "/ szt";
                        return (
                          <li key={variant.id}>
                            <button
                              onClick={() => {
                                setActiveCategoryId(cat.id);
                                setActiveVariantId(variant.id);
                              }}
                              className={cn(
                                "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                                variantActive
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground hover:bg-surface-sunken/60",
                              )}
                            >
                              <span className="flex-1 truncate font-medium">{variant.name}</span>
                              <span
                                className={cn(
                                  "tabular-nums",
                                  variantActive
                                    ? "text-accent-foreground/90"
                                    : "text-muted-foreground",
                                )}
                              >
                                {PLN.format(variant.pricePerGuest)}
                                <span className="ml-0.5 text-[9px]">{unitLabel}</span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* MIDDLE — Variants */}
        <section>
          {/* Active section context strip */}
          {mounted && activeSection ? (
            <div className="border-accent/30 bg-accent-soft/60 mb-5 flex flex-col gap-1 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Wybierasz menu dla
                </p>
                <p className="text-accent font-serif text-lg font-medium">
                  {activeSection.section.name}
                  {(activeSection.section.time || activeSection.section.endTime) && (
                    <span className="text-muted-foreground ml-2 text-sm font-normal">
                      · {activeSection.section.time || "—"}
                      {activeSection.section.endTime && ` – ${activeSection.section.endTime}`}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{activeSection.section.guests} os.</span>
                <span className="text-border mx-1">·</span>
                <span>Dzień {activeSection.dayIndex}</span>
              </div>
            </div>
          ) : (
            <div className="border-border bg-surface-sunken/60 mb-5 rounded-xl border border-dashed px-4 py-4 text-sm text-muted-foreground">
              Najpierw utwórz sekcję na górze strony — np. „Lunch, 13:00, 80 os.” — a potem dodawaj do niej pozycje z menu.
            </div>
          )}

          {activeCategory.id === "coffee-break" ? (
            <>
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {activeCategory.symbol} · Kategoria
                  {activeVariant && activeVariant.category.id === "coffee-break" && (
                    <> · {activeVariant.variant.name}</>
                  )}
                </p>
                <h2 className="mt-1 font-serif text-3xl font-medium text-foreground sm:text-4xl">
                  {activeVariant && activeVariant.category.id === "coffee-break"
                    ? `${activeCategory.name} — ${activeVariant.variant.name}`
                    : activeCategory.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {activeVariant && activeVariant.category.id === "coffee-break"
                    ? activeVariant.variant.tagline
                    : activeCategory.description}
                </p>
                {activeVariant && activeVariant.category.id === "coffee-break" && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    Cena{" "}
                    <span className="text-foreground font-medium">
                      {PLN.format(activeVariant.variant.pricePerGuest)}
                    </span>{" "}
                    / osoba — wybierz jedno z {activeVariant.variant.menus.length} menu poniżej.
                  </p>
                )}
              </div>

              {activeVariant && activeVariant.category.id === "coffee-break" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {activeVariant.variant.menus.map((menu) => (
                    <MenuCard
                      key={menu.id}
                      variant={activeVariant.variant}
                      menu={menu}
                      onPreview={() =>
                        setPreviewMenu({ variant: activeVariant.variant, menuId: menu.id })
                      }
                      onAdd={() => handleAddVariant(activeVariant.variant, menu.id)}
                      canAdd={mounted && !!activeSection}
                    />
                  ))}
                </div>
              ) : (
                <div className="border-border bg-surface-sunken/40 rounded-2xl border border-dashed px-6 py-10 text-center">
                  <p className="text-foreground font-serif text-lg">
                    Wybierz wariant z lewego panelu
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Każdy wariant zawiera 3 menu do wyboru w danej cenie.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeCategory.variants.map((variant) => (
                  <VariantCard
                    key={variant.id}
                    variant={variant}
                    onPreview={() => setPreviewVariant(variant)}
                    onAdd={() => handleAddVariant(variant)}
                    canAdd={mounted && !!activeSection}
                  />
                ))}
              </div>
            </>
          )}
        </section>

      </main>

      {/* Sticky bottom bar — total + continue */}
      <div className="bg-surface-elevated/95 border-border-soft fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSummaryOpen(true)}
              disabled={!mounted || totalItemsCount === 0}
              aria-label="Zobacz wybory"
              className={cn(
                "flex h-10 items-center gap-2 rounded-full border px-4 transition-colors",
                "border-border-soft bg-surface text-foreground hover:bg-surface-sunken",
                (!mounted || totalItemsCount === 0) && "cursor-not-allowed opacity-40",
              )}
              title="Zobacz wybory"
            >
              <ChevronUp className="h-4 w-4" />
              <span className="text-sm font-medium">Zobacz wybory</span>
            </button>
            <div>
              <p className="text-xs text-muted-foreground">
                {mounted ? totalItemsCount : 0}{" "}
                {(mounted ? totalItemsCount : 0) === 1 ? "pozycja" : "pozycji"} ·{" "}
                {mounted ? totalSectionsCount : 0}{" "}
                {(mounted ? totalSectionsCount : 0) === 1 ? "sekcja" : "sekcji"}
              </p>
              <p className="font-serif text-lg font-medium text-foreground">
                {PLN.format(mounted ? totals.brutto : 0)}{" "}
                <span className="text-muted-foreground text-xs font-normal">brutto</span>
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate({ to: "/summary" })}
            disabled={!mounted || totalItemsCount === 0}
            className="bg-accent text-accent-foreground hover:bg-accent-muted"
          >
            Dalej — podsumowanie →
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
                  {(previewVariant.menus[0]?.items ?? []).map((item, i) => (
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
              Nowa sekcja — Dzień {newSectionFor}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="secName" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Nazwa kategorii
              </Label>
              <Input
                id="secName"
                placeholder="np. Przerwa kawowa, Lunch, Kolacja"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="secTime" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Od
                </Label>
                <Input
                  id="secTime"
                  type="time"
                  value={newSectionTime}
                  onChange={(e) => setNewSectionTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="secEndTime" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Do
                </Label>
                <Input
                  id="secEndTime"
                  type="time"
                  value={newSectionEndTime}
                  onChange={(e) => setNewSectionEndTime(e.target.value)}
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

      {/* Summary side sheet — przegląd dodanych pozycji */}
      <Sheet open={summaryOpen} onOpenChange={setSummaryOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle className="font-serif text-2xl">Twoje wybory</SheetTitle>
            <SheetDescription>
              Podgląd wszystkich pozycji dodanych do oferty. Możesz usunąć każdą z nich tutaj, bez wracania do kategorii.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {state.days.every((d) => d.sections.every((s) => s.items.length === 0)) ? (
              <p className="text-muted-foreground text-sm">
                Nie dodano jeszcze żadnych pozycji.
              </p>
            ) : (
              state.days.map((day) => {
                const dayHasItems = day.sections.some((s) => s.items.length > 0);
                if (!dayHasItems) return null;
                return (
                  <div key={day.index}>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Dzień {day.index}
                      {day.date && (
                        <span className="ml-2 normal-case tracking-normal">· {formatDateShort(day.date)}</span>
                      )}
                    </p>
                    <div className="mt-2 space-y-3">
                      {day.sections.map((sec) => {
                        if (sec.items.length === 0) return null;
                        return (
                          <div
                            key={sec.id}
                            className="border-border-soft bg-surface-sunken/40 rounded-lg border p-3"
                          >
                            <div className="mb-2 flex items-baseline justify-between gap-2">
                              <p className="text-foreground font-serif text-base">
                                {sec.name}
                                {(sec.time || sec.endTime) && (
                                  <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                                    · {sec.time || "—"}
                                    {sec.endTime && ` – ${sec.endTime}`}
                                  </span>
                                )}
                              </p>
                              <span className="text-muted-foreground text-[11px]">
                                {sec.guests} os.
                              </span>
                            </div>
                            <ul className="space-y-1.5">
                              {sec.items.map((it) => {
                                const found = findVariant(it.variantId);
                                if (!found) return null;
                                const menuName = it.menuId
                                  ? found.variant.menus.find((m) => m.id === it.menuId)?.name
                                  : undefined;
                                const lineNet = found.variant.pricePerGuest * it.guests;
                                const lineBrutto = lineNet * (1 + found.variant.vatRate);
                                return (
                                  <li
                                    key={it.id}
                                    className="flex items-start justify-between gap-2 text-sm"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="text-foreground truncate">
                                        {found.variant.name}
                                        {menuName && (
                                          <span className="text-muted-foreground"> · {menuName}</span>
                                        )}
                                      </p>
                                      <p className="text-muted-foreground text-[11px]">
                                        {found.category.name} · {PLN.format(lineBrutto)}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        removeItem(sec.id, it.id);
                                        toast.success(`Usunięto: ${found.variant.name}`);
                                      }}
                                      className="text-muted-foreground hover:text-destructive shrink-0 rounded-md p-1.5 transition-colors"
                                      aria-label={`Usuń ${found.variant.name}`}
                                      title="Usuń pozycję"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-border-soft mt-8 border-t pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-xs uppercase tracking-[0.14em]">
                Razem brutto
              </span>
              <span className="font-serif text-xl font-medium text-foreground">
                {PLN.format(totals.brutto)}
              </span>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SectionsTopBar({
  onAddSection,
  onAddDay,
  onRemoveDay,
  onDateChange,
  activeSectionId,
  onSelect,
  onRemove,
  onGuestsChange,
}: {
  onAddSection: (dayIndex: number) => void;
  onAddDay: () => void;
  onRemoveDay: (dayIndex: number) => void;
  onDateChange: (dayIndex: number, date: string) => void;
  activeSectionId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onGuestsChange: (id: string, guests: number) => void;
}) {
  const { state } = useOffer();

  return (
    <div className="bg-surface-elevated/80 border-border-soft sticky top-16 z-30 border-b backdrop-blur">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6">
        <div className="mb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Plan wydarzenia
          </p>
        </div>
        <p className="text-muted-foreground mb-3 w-full text-xs leading-relaxed sm:text-[13px]">
          Najpierw dodaj dzień i wybierz datę, a następnie dodawaj kategorie do tego dnia (np. <span className="text-foreground font-medium">Przerwa kawowa, 11:00</span>, Lunch, Kolacja). Do jednego dnia możesz dodać wiele kategorii.
        </p>
        <div className="-mx-4 flex flex-col gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {state.days.map((d) => (
            <div key={d.index} className="flex flex-wrap items-center gap-2">
              <div className="flex shrink-0 items-center gap-2 pr-2">
                <span className="text-muted-foreground inline-flex h-7 items-center font-mono text-[10px] uppercase tracking-widest">
                  Dzień {d.index}
                </span>
                <input
                  type="date"
                  value={d.date ?? ""}
                  onChange={(e) => onDateChange(d.index, e.target.value)}
                  className={cn(
                    "h-7 rounded-full border px-2.5 text-xs font-medium tabular-nums transition-colors",
                    d.date
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : "border-dashed border-border bg-surface-sunken text-muted-foreground hover:border-accent/40",
                  )}
                  aria-label={`Data dla Dnia ${d.index}`}
                />
                {state.days.length > 1 && (
                  <button
                    onClick={() => onRemoveDay(d.index)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Usuń Dzień ${d.index}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
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
                      {(sec.time || sec.endTime) && (
                        <span
                          className={cn(
                            "text-[10px]",
                            isActive ? "text-accent-foreground/80" : "text-muted-foreground",
                          )}
                        >
                          {sec.time || "—"}
                          {sec.endTime && `–${sec.endTime}`}
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
                        onChange={(e) => onGuestsChange(sec.id, Number(e.target.value) || 1)}
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
                onClick={() => onAddSection(d.index)}
                className="border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground flex shrink-0 items-center gap-1 rounded-full border border-dashed px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <Plus className="h-3 w-3" />
                dodaj kategorię
              </button>
            </div>
          ))}
          <div className="flex">
            <button
              onClick={onAddDay}
              className="border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-xs font-medium transition-colors"
            >
              <CalendarPlus className="h-3 w-3" />
              dodaj dzień
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VariantCard({
  variant,
  onPreview,
  onAdd,
  canAdd,
}: {
  variant: Variant;
  onPreview: () => void;
  onAdd: () => void;
  canAdd: boolean;
}) {
  const unitLabel = variant.pricingUnit === "per_guest" ? "/ osoba" : "/ szt";
  return (
    <article className="bg-surface-elevated border-border-soft group flex flex-col overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)]">
      <div className="border-border-soft flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <h3 className="font-serif text-lg font-medium leading-tight text-foreground">
          {variant.name}
        </h3>
        <div className="text-right shrink-0">
          <p className="font-serif text-base font-medium text-foreground">
            {PLN.format(variant.pricePerGuest)}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {unitLabel}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 py-3">
        <p className="mb-2 text-xs text-muted-foreground italic">{variant.tagline}</p>
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          W menu ({variant.menus[0]?.items.length ?? 0})
        </p>
        <ul className="mb-3 space-y-1 text-[13px] leading-snug text-foreground">
          {(variant.menus[0]?.items ?? []).map((item, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-accent mt-0.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex gap-2 pt-2">
          <button
            onClick={onPreview}
            className="border-border-soft text-muted-foreground hover:text-foreground hover:bg-surface-sunken flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
          >
            Szczegóły
          </button>
          <button
            onClick={onAdd}
            disabled={!canAdd}
            className="bg-accent text-accent-foreground hover:bg-accent-muted flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Dodaj
          </button>
        </div>
      </div>
    </article>
  );
}

function VariantAccordionRow({
  variant,
  index,
  onAdd,
  canAdd,
}: {
  variant: Variant;
  index: number;
  onAdd: (menuId: string) => void;
  canAdd: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const unitLabel = variant.pricingUnit === "per_guest" ? "/ osoba" : "/ szt";
  return (
    <div className="bg-surface-elevated">
      {/* Wariant — nagłówek z ceną */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="hover:bg-surface-sunken/40 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors sm:px-5 sm:py-4"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
        <span className="text-muted-foreground hidden font-mono text-[10px] tracking-widest sm:inline">
          0{index}
        </span>
        <div className="flex-1">
          <p className="font-serif text-base font-medium text-foreground sm:text-lg">
            {variant.name}
          </p>
          <p className="text-muted-foreground text-xs italic">{variant.tagline}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-serif text-base font-medium text-foreground sm:text-lg">
            {PLN.format(variant.pricePerGuest)}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {unitLabel}
          </p>
        </div>
      </button>

      {/* Lista menu w wariancie */}
      {open && (
        <div className="bg-surface-sunken/30 border-border-soft divide-border-soft divide-y border-t">
          {variant.menus.map((menu) => {
            const menuOpen = openMenuId === menu.id;
            return (
              <div key={menu.id}>
                <div className="flex items-center gap-3 px-4 py-2.5 sm:px-8">
                  <button
                    onClick={() => setOpenMenuId(menuOpen ? null : menu.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                    aria-expanded={menuOpen}
                  >
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
                        menuOpen && "rotate-180",
                      )}
                    />
                    <span className="text-foreground text-sm font-medium">
                      {menu.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      · {menu.items.length} pozycji
                    </span>
                  </button>
                  <button
                    onClick={() => onAdd(menu.id)}
                    disabled={!canAdd}
                    className="bg-accent text-accent-foreground hover:bg-accent-muted flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-3 w-3" />
                    Dodaj
                  </button>
                </div>
                {menuOpen && (
                  <div className="bg-surface px-4 pb-4 pt-1 sm:px-8">
                    <ul className="grid gap-1.5 text-sm leading-snug text-foreground sm:grid-cols-2">
                      {menu.items.map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-accent mt-0.5">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MenuCard({
  variant,
  menu,
  onPreview,
  onAdd,
  canAdd,
}: {
  variant: Variant;
  menu: { id: string; name: string; items: string[] };
  onPreview: () => void;
  onAdd: () => void;
  canAdd: boolean;
}) {
  const unitLabel = variant.pricingUnit === "per_guest" ? "/ osoba" : "/ szt";
  return (
    <article className="bg-surface-elevated border-border-soft group flex flex-col overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)]">
      <div className="border-border-soft flex items-baseline justify-between gap-3 border-b px-4 py-3">
        <h3 className="font-serif text-lg font-medium leading-tight text-foreground">
          {menu.name}
        </h3>
        <div className="text-right shrink-0">
          <p className="font-serif text-base font-medium text-foreground">
            {PLN.format(variant.pricePerGuest)}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {unitLabel}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 py-3">
        <p className="mb-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          W menu ({menu.items.length})
        </p>
        <ul className="mb-3 space-y-1 text-[13px] leading-snug text-foreground">
          {menu.items.map((item, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-accent mt-0.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex gap-2 pt-2">
          <button
            onClick={onPreview}
            className="border-border-soft text-muted-foreground hover:text-foreground hover:bg-surface-sunken flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
          >
            Szczegóły
          </button>
          <button
            onClick={onAdd}
            disabled={!canAdd}
            className="bg-accent text-accent-foreground hover:bg-accent-muted flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Dodaj
          </button>
        </div>
      </div>
    </article>
  );
}
