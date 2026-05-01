import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Printer, Send, Pencil } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { useOffer } from "@/context/OfferContext";
import { findVariant, VAT_LABEL } from "@/data/catalog";
import { PLN_DETAILED, formatDateLong } from "@/lib/format";
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

  const totalItems = state.days.reduce(
    (acc, d) => acc + d.sections.reduce((a, s) => a + s.items.length, 0),
    0,
  );

  function send() {
    toast.success("Dziękujemy! Skontaktujemy się w ciągu 24 godzin.", {
      description: "Twoje zapytanie zostało wysłane do zespołu Jurek Catering.",
    });
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="no-print">
        <BrandHeader right={<Stepper />} />
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-12 print:max-w-none print:px-0 print:py-0">
        {/* Header */}
        <header className="mb-8 print-break-inside-avoid">
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-accent">Oferta cateringowa</p>
          <h1 className="font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
            {state.contact.eventName || "Twoje wydarzenie"}
          </h1>
          {state.contact.location && (
            <p className="mt-2 text-base text-muted-foreground">{state.contact.location}</p>
          )}
        </header>

        {/* Meta grid */}
        <section className="bg-surface-elevated border-border-soft mb-10 grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border p-6 sm:grid-cols-4 print-break-inside-avoid">
          <Meta label="Klient" value={state.contact.fullName} />
          <Meta label="Firma" value={state.contact.company || "—"} />
          <Meta label="E-mail" value={state.contact.email} />
          <Meta label="Telefon" value={state.contact.phone || "—"} />
          <Meta label="Termin od" value={state.contact.startDate ? formatDateLong(state.contact.startDate) : "—"} />
          <Meta label="Termin do" value={state.contact.endDate ? formatDateLong(state.contact.endDate) : "—"} />
          <Meta label="Liczba gości (szac.)" value={String(state.contact.defaultGuests)} />
          <Meta label="Pozycje w ofercie" value={String(totalItems)} />
        </section>

        {/* Plan wydarzenia */}
        <section className="mb-10">
          <h2 className="mb-5 font-serif text-2xl font-medium text-foreground">Plan wydarzenia</h2>
          {state.days.map((d) => (
            <div key={d.date} className="mb-6 print-break-inside-avoid">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-accent">
                {formatDateLong(d.date)}
              </p>
              {d.sections.length === 0 && (
                <p className="text-sm text-muted-foreground">— brak sekcji dla tego dnia —</p>
              )}
              <div className="space-y-3">
                {d.sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="bg-surface-elevated border-border-soft rounded-xl border p-5"
                  >
                    <div className="mb-3 flex items-baseline justify-between">
                      <h3 className="font-serif text-lg font-medium text-foreground">{sec.name}</h3>
                      {sec.time && (
                        <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          {sec.time}
                        </span>
                      )}
                    </div>
                    {sec.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">— pusta sekcja —</p>
                    ) : (
                      <ul className="border-border-soft divide-y">
                        {sec.items.map((it) => {
                          const f = findVariant(it.variantId);
                          if (!f) return null;
                          const { variant, category } = f;
                          const line = variant.pricePerGuest * it.guests;
                          return (
                            <li key={it.id} className="grid grid-cols-12 gap-2 py-2 text-sm">
                              <span className="col-span-1 text-muted-foreground">
                                {it.guests}×
                              </span>
                              <div className="col-span-6">
                                <p className="font-medium text-foreground">
                                  {category.name} — {variant.name}
                                </p>
                              </div>
                              <span className="col-span-2 text-right text-muted-foreground">
                                {PLN_DETAILED.format(variant.pricePerGuest)}
                              </span>
                              <span className="col-span-1 text-right text-xs text-muted-foreground">
                                {VAT_LABEL[variant.vatRate]}
                              </span>
                              <span className="col-span-2 text-right font-medium text-foreground">
                                {PLN_DETAILED.format(line)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Totals */}
        <section className="bg-surface-elevated border-border-soft mb-8 rounded-2xl border p-6 print-break-inside-avoid">
          <h2 className="mb-5 font-serif text-xl font-medium text-foreground">Podsumowanie</h2>
          <div className="mb-4 space-y-2 text-sm">
            {Object.entries(totals.byVat).map(([rate, v]) => (
              <div key={rate} className="flex justify-between text-muted-foreground">
                <span>
                  VAT {VAT_LABEL[Number(rate)]} od {PLN_DETAILED.format(v.base)}
                </span>
                <span>{PLN_DETAILED.format(v.tax)}</span>
              </div>
            ))}
          </div>
          <div className="border-border-soft space-y-1.5 border-t pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Suma netto</span>
              <span>{PLN_DETAILED.format(totals.netto)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>VAT razem</span>
              <span>{PLN_DETAILED.format(totals.vat)}</span>
            </div>
            <div className="border-border-soft mt-3 flex items-baseline justify-between border-t pt-3">
              <span className="text-xs uppercase tracking-[0.18em] text-foreground">
                Razem brutto
              </span>
              <span className="font-serif text-3xl font-medium text-accent">
                {PLN_DETAILED.format(totals.brutto)}
              </span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="no-print flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
          <Link to="/configure">
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Wstecz — edytuj
            </Button>
          </Link>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />
              Pobierz PDF
            </Button>
            <Button onClick={send} className="bg-accent text-accent-foreground hover:bg-accent-muted">
              <Send className="mr-2 h-4 w-4" />
              Wyślij zapytanie
            </Button>
          </div>
        </div>

        <p className="no-print mt-8 text-center text-xs text-muted-foreground">
          Oferta wstępna · ceny mogą podlegać korekcie po szczegółowej rozmowie.
        </p>
      </main>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
