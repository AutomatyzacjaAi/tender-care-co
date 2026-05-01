import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Printer, Send, Pencil } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { useOffer, type Section, type SectionItem } from "@/context/OfferContext";
import { findVariant, VAT_LABEL } from "@/data/catalog";
import { PLN_DETAILED, formatDateLong, addDaysISO } from "@/lib/format";
import { toast } from "sonner";
import { useEffect } from "react";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Krok 3 — Podsumowanie · Jurek Catering" },
      {
        name: "description",
        content: "Podsumowanie skonfigurowanej oferty cateringowej.",
      },
    ],
  }),
  component: SummaryStep,
});

function SummaryStep() {
  const navigate = useNavigate();
  const { state, totals } = useOffer();

  useEffect(() => {
    if (!state.contact.eventName) navigate({ to: "/" });
  }, [state.contact.eventName, navigate]);

  // Stable order number derived from eventName + startDate (looks formal, no Date.now to avoid hydration mismatch)
  const orderNumber = generateOrderNumber(state.contact.eventName, state.contact.startDate);

  function send() {
    toast.success("Dziękujemy! Skontaktujemy się w ciągu 24 godzin.", {
      description: "Twoje zapytanie zostało wysłane do zespołu Jurek Catering.",
    });
  }

  const hasItems = state.days.some((d) => d.sections.some((s) => s.items.length > 0));

  return (
    <div className="bg-surface min-h-screen">
      <div className="no-print">
        <BrandHeader right={<Stepper />} />
      </div>

      {/* Action bar (no-print) */}
      <div className="no-print border-border-soft bg-surface-elevated/60 border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edytuj ofertę
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Pobierz PDF
            </Button>
            <Button
              size="sm"
              onClick={send}
              className="bg-accent text-accent-foreground hover:bg-accent-muted"
            >
              <Send className="mr-2 h-4 w-4" />
              Wyślij zapytanie
            </Button>
          </div>
        </div>
      </div>

      {/* Document sheet */}
      <main className="mx-auto w-full max-w-[820px] px-4 py-8 sm:px-0 sm:py-12 print:max-w-none print:px-0 print:py-0">
        <article className="bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-32px_rgba(0,0,0,0.18)] print:shadow-none">
          <div className="px-10 py-12 sm:px-14 sm:py-14 print:px-12 print:py-10">
            {/* Document header */}
            <header className="mb-10 flex items-start justify-between gap-6 border-b border-neutral-200 pb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                  Jurek Catering
                </p>
                <h1 className="mt-2 font-serif text-2xl font-medium text-neutral-900">
                  Order #{orderNumber}
                </h1>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                  Status
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-700">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Wstępna oferta
                </p>
              </div>
            </header>

            {/* Customer & Location */}
            <section className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                  Customer details
                </p>
                <div className="space-y-0.5 text-sm leading-relaxed text-neutral-800">
                  <p className="font-medium">{state.contact.fullName || "—"}</p>
                  {state.contact.company && <p>{state.contact.company}</p>}
                  {state.contact.email && <p className="text-neutral-600">{state.contact.email}</p>}
                  {state.contact.phone && <p className="text-neutral-600">{state.contact.phone}</p>}
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-500">
                  Location details
                </p>
                <div className="space-y-0.5 text-sm leading-relaxed text-neutral-800">
                  {state.contact.location ? (
                    state.contact.location.split("\n").map((line, i) => <p key={i}>{line}</p>)
                  ) : (
                    <p className="text-neutral-400">— nie podano —</p>
                  )}
                </div>
              </div>
            </section>

            {/* Order meta */}
            <section className="mb-10">
              <h2 className="mb-4 font-serif text-lg font-medium text-neutral-900">
                Order #{orderNumber} — {state.contact.eventName || "Wydarzenie"}
              </h2>
              <dl className="divide-y divide-neutral-200 border-y border-neutral-200">
                <Row label="Order name" value={state.contact.eventName || "—"} />
                <Row label="Status" value="Wstępna oferta" />
                <Row
                  label="Date"
                  value={state.contact.startDate ? formatDateLong(state.contact.startDate) : "—"}
                />
                <Row
                  label="End date"
                  value={state.contact.endDate ? formatDateLong(state.contact.endDate) : "—"}
                />
                <Row
                  label="Number of guests"
                  value={String(state.contact.defaultGuests ?? 0)}
                />
                <Row label="Payment method" value="Faktura VAT" />
              </dl>
            </section>

            {/* Event planning */}
            <section className="mb-10">
              <h2 className="mb-4 font-serif text-lg font-medium text-neutral-900">
                Event planning
              </h2>
              {state.days.length === 0 && (
                <p className="text-sm text-neutral-500">— brak zaplanowanych dni —</p>
              )}
              <div className="space-y-4">
                {state.days.map((d) => {
                  const iso = d.date
                    ? d.date
                    : state.contact.startDate
                      ? addDaysISO(state.contact.startDate, d.index - 1)
                      : "";
                  const dayLabel = iso
                    ? capitalize(formatDateLong(iso))
                    : `Dzień ${d.index}`;
                  return (
                    <div key={d.index} className="print-break-inside-avoid">
                      <p className="mb-1.5 text-sm font-medium text-neutral-900">
                        {dayLabel}
                      </p>
                      {d.sections.length === 0 ? (
                        <p className="pl-4 text-sm text-neutral-400">— brak sekcji —</p>
                      ) : (
                        <ul className="space-y-1 pl-4 text-sm text-neutral-700">
                          {d.sections.map((sec) => (
                            <li key={sec.id} className="flex gap-3">
                              <span className="w-14 shrink-0 font-mono tabular-nums text-neutral-500">
                                {sec.time || "—"}
                              </span>
                              <span>
                                {sec.name}{" "}
                                <span className="text-neutral-500">· {sec.guests} os.</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Overview table */}
            <section className="mb-10">
              <h2 className="mb-4 font-serif text-lg font-medium text-neutral-900">Overview</h2>
              {!hasItems ? (
                <p className="text-sm text-neutral-500">
                  — brak pozycji w ofercie —
                </p>
              ) : (
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-y border-neutral-300 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                      <th className="w-16 py-2.5 pr-3 text-right">Ilość</th>
                      <th className="py-2.5 pr-3">Pozycja</th>
                      <th className="w-24 py-2.5 pr-3 text-right">Cena jedn.</th>
                      <th className="w-14 py-2.5 pr-3 text-right">VAT</th>
                      <th className="w-28 py-2.5 text-right">Razem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.days.map((d) => {
                      const dayItems = d.sections.flatMap((s) =>
                        s.items.map((it) => ({ section: s, item: it })),
                      );
                      if (dayItems.length === 0) return null;
                      const iso = d.date
                        ? d.date
                        : state.contact.startDate
                          ? addDaysISO(state.contact.startDate, d.index - 1)
                          : "";
                      const dateLabel = iso
                        ? capitalize(formatDateLong(iso))
                        : `Dzień ${d.index}`;
                      return (
                        <DayRows key={d.index} dateLabel={dateLabel} rows={dayItems} />
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>

            {/* Totals */}
            {hasItems && (
              <section className="mb-8 print-break-inside-avoid">
                <div className="flex justify-end">
                  <div className="w-full max-w-sm space-y-2 text-sm">
                    <div className="flex justify-between border-t border-neutral-300 py-2 text-neutral-700">
                      <span>Subtotal (excl. VAT)</span>
                      <span className="tabular-nums">{PLN_DETAILED.format(totals.netto)}</span>
                    </div>
                    <div className="space-y-1 pb-2 text-xs text-neutral-600">
                      <p className="font-mono uppercase tracking-wider text-neutral-500">
                        VAT specification
                      </p>
                      {Object.entries(totals.byVat).map(([rate, v]) => (
                        <div key={rate} className="flex justify-between">
                          <span>
                            {VAT_LABEL[Number(rate)]} od {PLN_DETAILED.format(v.base)}
                          </span>
                          <span className="tabular-nums">{PLN_DETAILED.format(v.tax)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-baseline justify-between border-t-2 border-neutral-900 pt-3">
                      <span className="text-xs font-medium uppercase tracking-wider text-neutral-900">
                        Total (incl. VAT)
                      </span>
                      <span className="font-serif text-xl font-medium text-neutral-900 tabular-nums">
                        {PLN_DETAILED.format(totals.brutto)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="border-t border-neutral-200 pt-5">
              <p className="text-center text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Generated by Jurek Catering · Oferta wstępna · ceny mogą podlegać korekcie.
              </p>
            </footer>
          </div>
        </article>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

function DayRows({
  dateLabel,
  rows,
}: {
  dateLabel: string;
  rows: { section: Section; item: SectionItem }[];
}) {
  return (
    <>
      <tr className="border-b border-neutral-200">
        <td colSpan={5} className="pb-1.5 pt-4 text-sm font-medium text-neutral-900">
          {dateLabel}
        </td>
      </tr>
      {rows.map(({ section, item }) => {
        const f = findVariant(item.variantId);
        if (!f) return null;
        const { variant } = f;
        const selectedMenu = item.menuId
          ? variant.menus.find((m) => m.id === item.menuId)
          : variant.menus[0];
        const showMenuName = (variant.menus.length > 1 || selectedMenu?.name !== "Menu") && selectedMenu;
        const line = variant.pricePerGuest * item.guests;
        const unit = variant.pricingUnit === "per_guest" ? "x" : "x";
        return (
          <tr key={item.id} className="border-b border-neutral-100 align-top">
            <td className="py-2 pr-3 text-right tabular-nums text-neutral-700">
              {item.guests}
              {unit}
            </td>
            <td className="py-2 pr-3 text-neutral-900">
              <span>{variant.name}</span>
              {showMenuName && (
                <span className="ml-1.5 text-neutral-700">
                  — {selectedMenu!.name}
                </span>
              )}
              <span className="ml-2 text-xs text-neutral-500">
                · {section.name}
                {section.time && ` · ${section.time}`}
              </span>
            </td>
            <td className="py-2 pr-3 text-right tabular-nums text-neutral-700">
              {PLN_DETAILED.format(variant.pricePerGuest)}
            </td>
            <td className="py-2 pr-3 text-right text-neutral-600">
              {VAT_LABEL[variant.vatRate]}
            </td>
            <td className="py-2 text-right font-medium tabular-nums text-neutral-900">
              {PLN_DETAILED.format(line)}
            </td>
          </tr>
        );
      })}
    </>
  );
}

function generateOrderNumber(eventName: string, startDate: string): string {
  const seed = `${eventName}|${startDate}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const n = Math.abs(hash) % 9000 + 1000;
  return String(n);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
