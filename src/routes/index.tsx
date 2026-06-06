import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, ChevronDown, Clock, Plus, Search, ShoppingCart, Trash2, Users, X } from "lucide-react";
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
import { CATALOG, DISH_SUBCATEGORIES, findVariant, getIndividualDishes, type DishSubcategory, type Variant } from "@/data/catalog";
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
    addItem,
    removeItem,
    removeSection,
    totals,
  } = useOffer();
  const [summaryOpen, setSummaryOpen] = useState(true);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATALOG[0].id);
  const activeCategory = useMemo(
    () => CATALOG.find((c) => c.id === activeCategoryId) ?? CATALOG[0],
    [activeCategoryId],
  );
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>("coffee-break");
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);

  const activeVariant = useMemo(() => {
    if (!activeVariantId) return null;
    for (const cat of CATALOG) {
      const v = cat.variants.find((x) => x.id === activeVariantId);
      if (v) return { category: cat, variant: v };
    }
    return null;
  }, [activeVariantId]);

  // Add-to-day dialog (zastępuje wcześniejsze tworzenie sekcji)
  const [pendingAdd, setPendingAdd] = useState<{ variant: Variant; menuId?: string } | null>(null);
  const [addDayIndex, setAddDayIndex] = useState<number>(1);
  const [addGuests, setAddGuests] = useState<number>(state.contact.defaultGuests || 100);
  const [addTime, setAddTime] = useState<string>("");
  const [addEndTime, setAddEndTime] = useState<string>("");

  // Menu indywidualne — lokalny koszyk dań i osobny dialog
  const [customDishIds, setCustomDishIds] = useState<string[]>([]);
  const [customAddOpen, setCustomAddOpen] = useState<boolean>(false);

  // Avoid SSR/CSR mismatch — days come from localStorage
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

  function openAdd(variant: Variant, menuId?: string) {
    setPendingAdd({ variant, menuId });
    const firstDay = state.days[0]?.index ?? 1;
    setAddDayIndex(firstDay);
    setAddGuests(state.contact.defaultGuests || 100);
    setAddTime("");
    setAddEndTime("");
  }

  function commitAdd() {
    if (!pendingAdd) return;
    if (!addTime || !addEndTime) {
      toast.error("Uzupełnij godziny rozpoczęcia i zakończenia.");
      return;
    }
    if (addGuests < 1) {
      toast.error("Liczba osób musi być większa od 0.");
      return;
    }
    const { variant, menuId } = pendingAdd;
    const menuName = menuId ? variant.menus.find((m) => m.id === menuId)?.name : undefined;
    const sectionName = menuName ? `${variant.name} · ${menuName}` : variant.name;
    const sectionId = addSection(addDayIndex, sectionName, addGuests, addTime, addEndTime);
    addItem(sectionId, variant.id, menuId, addGuests);
    toast.success(`Dodano: ${sectionName} → Dzień ${addDayIndex}`);
    setPendingAdd(null);
  }

  function handleAddVariant(variant: Variant, menuId?: string) {
    openAdd(variant, menuId);
  }

  const totalItemsCount = state.days.reduce(
    (acc, d) => acc + d.sections.reduce((a, s) => a + s.items.length, 0),
    0,
  );

  return (
    <div
      className="bg-surface min-h-screen"
      style={{ paddingBottom: summaryOpen ? "calc(60px + 40vh)" : "80px" }}
    >
      <BrandHeader
        center={<Stepper />}
        right={
          <button
            type="button"
            onClick={() => setSummaryOpen((o) => !o)}
            disabled={!mounted}
            aria-label="Zobacz wybory"
            aria-expanded={summaryOpen}
            className={cn(
              "flex items-center gap-3 rounded-full border px-4 py-1.5 transition-colors",
              "border-border-soft bg-surface text-foreground hover:bg-surface-sunken",
              !mounted && "cursor-not-allowed opacity-40",
            )}
            title={summaryOpen ? "Ukryj wybory" : "Zobacz wybory"}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden text-sm font-medium sm:inline">
              {summaryOpen ? "Ukryj wybory" : "Zobacz wybory"}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                summaryOpen && "rotate-180",
              )}
            />
            <span className="border-border-soft hidden h-6 border-l sm:block" />
            <span className="text-left leading-tight">
              <span className="block text-[10px] text-muted-foreground">
                {mounted ? totalItemsCount : 0}{" "}
                {(mounted ? totalItemsCount : 0) === 1 ? "pozycja" : "pozycji"}
              </span>
              <span className="font-serif text-base font-medium text-foreground">
                {PLN.format(mounted ? totals.brutto : 0)}
              </span>
            </span>
          </button>
        }
      />

      {/* TOP BAR — Days */}
      {mounted && (
        <DaysBar
          onAddDay={() => {
            const idx = addDay();
            toast.success(`Dodano Dzień ${idx}`);
          }}
          onRemoveDay={(idx) => {
            if (state.days.length <= 1) {
              toast.error("Musi pozostać co najmniej jeden dzień.");
              return;
            }
            if (confirm(`Usunąć Dzień ${idx} wraz z wszystkimi pozycjami?`)) {
              removeDay(idx);
            }
          }}
          onDateChange={setDayDate}
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
          {/* Hint */}
          {mounted && state.days.length > 0 && (
            <div className="border-border bg-surface-sunken/40 mb-5 rounded-xl border border-dashed px-4 py-3 text-xs text-muted-foreground sm:text-[13px]">
              Wybierz pozycję z menu i kliknij <span className="text-foreground font-medium">Dodaj</span> — w okienku ustalisz godziny, liczbę osób i dzień, do którego ma trafić.
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
                      onPreview={() => handleAddVariant(activeVariant.variant, menu.id)}
                      onAdd={() => handleAddVariant(activeVariant.variant, menu.id)}
                      canAdd={mounted}
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
                    onPreview={() => handleAddVariant(variant)}
                    onAdd={() => handleAddVariant(variant)}
                    canAdd={mounted}
                  />
                ))}
              </div>
            </>
          )}
        </section>

      </main>

      {/* Docked summary panel — zawsze dostępny, otwiera się nad dolnym paskiem */}
      {summaryOpen && mounted && (
        <div
          className="bg-surface-elevated border-border-soft fixed bottom-[60px] left-0 right-0 z-30 border-t shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)]"
          style={{ maxHeight: "40vh" }}
        >
          <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col px-4 sm:px-6">
            <div className="flex items-center justify-between gap-3 border-b border-border-soft py-2.5">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <p className="font-serif text-base font-medium text-foreground">
                  Twoje wybory
                </p>
                <span className="text-muted-foreground text-xs">
                  · {totalItemsCount} {totalItemsCount === 1 ? "pozycja" : "pozycji"} ·{" "}
                  <span className="text-foreground font-medium">
                    {PLN.format(totals.brutto)}
                  </span>{" "}
                  brutto
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSummaryOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
                aria-label="Zwiń wybory"
                title="Zwiń"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3" style={{ maxHeight: "calc(40vh - 48px)" }}>
              {state.days.every((d) => d.sections.every((s) => s.items.length === 0)) ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  Nie dodano jeszcze żadnych pozycji. Dodaj coś z menu po lewej — pojawi się tutaj od razu.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {state.days.map((day) => {
                    const dayHasItems = day.sections.some((s) => s.items.length > 0);
                    if (!dayHasItems) return null;
                    return (
                      <div key={day.index}>
                        <p className="mb-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          Dzień {day.index}
                          {day.date && (
                            <span className="ml-2 normal-case tracking-normal">
                              · {formatDateShort(day.date)}
                            </span>
                          )}
                        </p>
                        <div className="space-y-2">
                          {day.sections.map((sec) => {
                            if (sec.items.length === 0) return null;
                            return (
                              <div
                                key={sec.id}
                                className="border-border-soft bg-surface-sunken/40 rounded-lg border p-2.5"
                              >
                                <div className="mb-1 flex items-baseline justify-between gap-2">
                                  <p className="text-foreground truncate font-serif text-sm">
                                    {sec.name}
                                    {(sec.time || sec.endTime) && (
                                      <span className="text-muted-foreground ml-1.5 text-[11px] font-normal">
                                        · {sec.time || "—"}
                                        {sec.endTime && ` – ${sec.endTime}`}
                                      </span>
                                    )}
                                  </p>
                                  <span className="text-muted-foreground shrink-0 text-[11px]">
                                    {sec.guests} os.
                                  </span>
                                </div>
                                <ul className="space-y-1">
                                  {sec.items.map((it) => {
                                    const found = findVariant(it.variantId);
                                    if (!found) return null;
                                    const menuName = it.menuId
                                      ? found.variant.menus.find((m) => m.id === it.menuId)?.name
                                      : undefined;
                                    const lineBrutto =
                                      found.variant.pricePerGuest *
                                      it.guests *
                                      (1 + found.variant.vatRate);
                                    return (
                                      <li
                                        key={it.id}
                                        className="flex items-start justify-between gap-2 text-xs"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <p className="text-foreground truncate">
                                            {found.variant.name}
                                            {menuName && (
                                              <span className="text-muted-foreground">
                                                {" "}
                                                · {menuName}
                                              </span>
                                            )}
                                          </p>
                                          <p className="text-muted-foreground text-[10px]">
                                            {PLN.format(lineBrutto)} brutto
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            removeItem(sec.id, it.id);
                                            toast.success(`Usunięto: ${found.variant.name}`);
                                          }}
                                          className="text-muted-foreground hover:text-destructive shrink-0 rounded-md p-1 transition-colors"
                                          aria-label={`Usuń ${found.variant.name}`}
                                          title="Usuń pozycję"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
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
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky bottom bar — continue */}
      <div className="bg-surface-elevated/95 border-border-soft fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur">
        <div className="mx-auto flex h-[60px] w-full max-w-[1400px] items-center justify-end gap-3 px-4 sm:px-6">
          <Button
            onClick={() => navigate({ to: "/summary" })}
            disabled={!mounted || totalItemsCount === 0}
            className="bg-accent text-accent-foreground hover:bg-accent-muted"
          >
            Dalej — podsumowanie →
          </Button>
        </div>
      </div>

      {/* Unified preview + add-to-day dialog */}
      <Dialog open={!!pendingAdd} onOpenChange={(o) => !o && setPendingAdd(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
          {pendingAdd && (() => {
            const variant = pendingAdd.variant;
            const menu = pendingAdd.menuId
              ? variant.menus.find((m) => m.id === pendingAdd.menuId)
              : variant.menus[0];
            return (
              <>
                <div className="relative aspect-[16/7] w-full overflow-hidden bg-muted">
                  <img
                    src={variant.image}
                    alt={variant.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-6 pb-2 pt-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {activeCategory.name}
                  </p>
                  <DialogHeader className="mt-1 space-y-1 text-left">
                    <DialogTitle className="font-serif text-2xl font-medium">
                      {variant.name}
                      {pendingAdd.menuId && menu && (
                        <span className="text-muted-foreground text-base font-normal">
                          {" · "}
                          {menu.name}
                        </span>
                      )}
                    </DialogTitle>
                  </DialogHeader>
                  <p className="mt-2 text-sm text-muted-foreground">{variant.tagline}</p>
                  <div className="border-border-soft mt-4 flex items-baseline justify-between border-t pt-4">
                    <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Cena
                    </span>
                    <div className="text-right">
                      <span className="font-serif text-2xl font-medium text-foreground">
                        {PLN.format(variant.pricePerGuest)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {variant.pricingUnit === "per_guest" ? "/ osoba" : "/ szt"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Menu — pełny zestaw
                  </p>
                  <ul className="bg-surface-sunken/60 space-y-2 rounded-lg p-4 text-sm text-foreground">
                    {(menu?.items ?? []).map((item, i) => (
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
                <div className="border-border-soft border-t bg-surface-sunken/40 px-6 py-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    Szczegóły dodania
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="addTime" className="mb-1.5 flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          <Clock className="h-3 w-3" /> Od *
                        </Label>
                        <Input
                          id="addTime"
                          type="time"
                          value={addTime}
                          onChange={(e) => setAddTime(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div>
                        <Label htmlFor="addEndTime" className="mb-1.5 flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          <Clock className="h-3 w-3" /> Do *
                        </Label>
                        <Input
                          id="addEndTime"
                          type="time"
                          value={addEndTime}
                          onChange={(e) => setAddEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="addGuests" className="mb-1.5 flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        <Users className="h-3 w-3" /> Liczba osób *
                      </Label>
                      <Input
                        id="addGuests"
                        type="number"
                        min={1}
                        value={addGuests}
                        onChange={(e) => setAddGuests(Math.max(1, Number(e.target.value) || 1))}
                      />
                    </div>
                    {state.days.length > 1 && (
                      <div>
                        <Label htmlFor="addDay" className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          Dzień
                        </Label>
                        <select
                          id="addDay"
                          value={addDayIndex}
                          onChange={(e) => setAddDayIndex(Number(e.target.value))}
                          className="border-input bg-surface h-10 w-full rounded-md border px-3 text-sm"
                        >
                          {state.days.map((d) => (
                            <option key={d.index} value={d.index}>
                              Dzień {d.index}
                              {d.date ? ` · ${formatDateShort(d.date)}` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter className="border-border-soft flex-col gap-2 border-t bg-surface-sunken/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                  <Button variant="ghost" onClick={() => setPendingAdd(null)}>
                    Zamknij
                  </Button>
                  <Button
                    disabled={!addTime || !addEndTime || addGuests < 1}
                    onClick={commitAdd}
                    className="bg-accent text-accent-foreground hover:bg-accent-muted"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Dodaj do Dnia {addDayIndex}
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );
}

function DaysBar({
  onAddDay,
  onRemoveDay,
  onDateChange,
}: {
  onAddDay: () => void;
  onRemoveDay: (dayIndex: number) => void;
  onDateChange: (dayIndex: number, date: string) => void;
}) {
  const { state } = useOffer();

  return (
    <div className="bg-surface-elevated/80 border-border-soft sticky top-16 z-30 border-b backdrop-blur">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-muted-foreground mr-2 text-xs uppercase tracking-[0.18em]">
            Plan wydarzenia
          </p>
          {state.days.map((d) => (
            <div
              key={d.index}
              className="border-border bg-surface flex shrink-0 items-center gap-2 rounded-full border px-3 py-1"
            >
              <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
                Dzień {d.index}
              </span>
              <input
                type="date"
                value={d.date ?? ""}
                onChange={(e) => onDateChange(d.index, e.target.value)}
                className={cn(
                  "h-6 rounded-full border px-2 text-xs font-medium tabular-nums transition-colors",
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
          ))}
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
  const items = variant.menus[0]?.items ?? [];
  return (
    <MenuItemCard
      title={variant.name}
      netto={variant.pricePerGuest}
      vatRate={variant.vatRate}
      unit={variant.pricingUnit}
      description={variant.tagline}
      items={items}
      onPreview={onPreview}
      onAdd={onAdd}
      canAdd={canAdd}
    />
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
  return (
    <MenuItemCard
      title={menu.name}
      netto={variant.pricePerGuest}
      vatRate={variant.vatRate}
      unit={variant.pricingUnit}
      description={variant.tagline}
      items={menu.items}
      onPreview={onPreview}
      onAdd={onAdd}
      canAdd={canAdd}
    />
  );
}

function MenuItemCard({
  title,
  netto,
  vatRate,
  unit,
  description,
  items,
  onPreview,
  onAdd,
  canAdd,
}: {
  title: string;
  netto: number;
  vatRate: number;
  unit: "per_guest" | "per_unit";
  description?: string;
  items: string[];
  onPreview: () => void;
  onAdd: () => void;
  canAdd: boolean;
}) {
  const unitLabel = unit === "per_guest" ? "/ os" : "/ szt";
  const brutto = netto * (1 + vatRate);
  const visible = items.slice(0, 5);
  const remaining = Math.max(0, items.length - visible.length);
  return (
    <article className="bg-surface-elevated border-border-soft group flex flex-col overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)]">
      {/* Header: nazwa + ceny netto/brutto */}
      <div className="px-4 py-3">
        <h3 className="font-serif text-lg font-medium leading-tight text-foreground">
          {title}
        </h3>
        <div className="mt-1.5 space-y-0.5">
          <p className="text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{PLN.format(netto)}</span>{" "}
            netto {unitLabel}
          </p>
          <p className="text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{PLN.format(brutto)}</span>{" "}
            brutto {unitLabel}
          </p>
        </div>
      </div>

      {/* Divider + opis */}
      {description ? (
        <div className="border-border-soft border-t px-4 py-3">
          <p className="text-xs italic text-muted-foreground">{description}</p>
        </div>
      ) : null}

      {/* Divider + W zestawie */}
      <div className="border-border-soft flex flex-1 flex-col border-t px-4 py-3">
        <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          W zestawie
        </p>
        <ul className="space-y-1 text-[13px] leading-snug text-foreground">
          {visible.map((item, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="text-accent mt-0.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {remaining > 0 ? (
          <button
            type="button"
            onClick={onPreview}
            className="text-accent hover:text-accent-muted mt-2 self-start text-xs font-medium underline-offset-2 hover:underline"
          >
            Zobacz więcej (+{remaining})
          </button>
        ) : null}
      </div>

      {/* Divider + przyciski */}
      <div className="border-border-soft flex gap-2 border-t px-4 py-3">
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
    </article>
  );
}
