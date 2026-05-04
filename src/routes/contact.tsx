import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, User2, Building2, Phone, Briefcase, FileText, Users, ArrowRight } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOffer, type ClientType } from "@/context/OfferContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Krok 1 — Dane kontaktowe · Jurek Catering" },
      {
        name: "description",
        content: "Podaj dane kontaktowe — wybierz typ klienta (osoba prywatna, firma lub organizacja) i przekaż dane kontaktowe.",
      },
      { property: "og:title", content: "Dane kontaktowe — krok 1 · Jurek Catering" },
      { property: "og:description", content: "Krok 1 z 3 konfiguratora oferty cateringowej." },
    ],
  }),
  component: ContactStep,
});

const PROVIDERS = [
  "Jurek Catering Sp. z o.o.",
  "Jurek Catering Events",
];

const CLIENT_TYPES: { value: ClientType; label: string; description: string }[] = [
  { value: "private", label: "Osoba prywatna", description: "Zamówienie na potrzeby prywatne." },
  { value: "company", label: "Firma", description: "Zamówienie firmowe — wymagany NIP." },
  { value: "organization", label: "Organizacja", description: "Fundacja, stowarzyszenie, instytucja — wymagany NIP." },
];

function Field({
  icon: Icon,
  label,
  htmlFor,
  children,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label
        htmlFor={htmlFor}
        className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>
      {children}
    </div>
  );
}

function ContactStep() {
  const { state, setContact } = useOffer();
  const [c, setC] = useState(state.contact);
  const navigate = useNavigate();

  const requiresNip = c.clientType === "company" || c.clientType === "organization";
  const requiresOrgName = requiresNip;

  const valid =
    c.provider.trim() &&
    c.fullName.trim() &&
    c.email.trim() &&
    (!requiresOrgName || c.company.trim()) &&
    (!requiresNip || c.nip.trim());

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setContact({ ...c, defaultGuests: c.defaultGuests || 100 });
    navigate({ to: "/" });
  }

  return (
    <div className="bg-surface min-h-screen">
      <BrandHeader right={<Stepper />} />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-accent">Krok 1 z 3</p>
          <h1 className="font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
            Dane kontaktowe
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Wybierz, od kogo pochodzi oferta, oraz podaj dane kontaktowe klienta. Plan wydarzenia
            (dni i godziny) ustalisz w kolejnym kroku.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-surface-elevated border-border-soft rounded-2xl border p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(0,0,0,0.08)] sm:p-10"
        >
          {/* Od kogo (provider) */}
          <Field icon={Briefcase} label="Od kogo (oferent)" htmlFor="provider">
            <select
              id="provider"
              value={c.provider}
              onChange={(e) => setC({ ...c, provider: e.target.value })}
              className="border-border bg-surface flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              required
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <div className="border-border-soft my-6 border-t" />

          {/* Typ klienta */}
          <div className="mb-6">
            <Label className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Typ klienta
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {CLIENT_TYPES.map((t) => {
                const active = c.clientType === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setC({ ...c, clientType: t.value })}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-colors",
                      active
                        ? "border-accent bg-accent-soft"
                        : "border-border bg-surface hover:bg-surface-sunken",
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-medium",
                        active ? "text-accent" : "text-foreground",
                      )}
                    >
                      {t.label}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-[11px] leading-snug">
                      {t.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field icon={User2} label="Imię i nazwisko" htmlFor="fullName">
              <Input
                id="fullName"
                value={c.fullName}
                onChange={(e) => setC({ ...c, fullName: e.target.value })}
                placeholder="Anna Kowalska"
                required
              />
            </Field>

            {requiresOrgName && (
              <Field
                icon={Building2}
                label={c.clientType === "organization" ? "Nazwa organizacji" : "Nazwa firmy"}
                htmlFor="company"
              >
                <Input
                  id="company"
                  value={c.company}
                  onChange={(e) => setC({ ...c, company: e.target.value })}
                  placeholder={c.clientType === "organization" ? "Fundacja Przykład" : "Acme Sp. z o.o."}
                  required
                />
              </Field>
            )}

            {requiresNip && (
              <Field icon={FileText} label="NIP" htmlFor="nip">
                <Input
                  id="nip"
                  value={c.nip}
                  onChange={(e) => setC({ ...c, nip: e.target.value })}
                  placeholder="123-456-78-90"
                  required
                />
              </Field>
            )}

            <Field icon={Mail} label="E-mail" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={c.email}
                onChange={(e) => setC({ ...c, email: e.target.value })}
                placeholder="anna@firma.pl"
                required
              />
            </Field>
            <Field icon={Phone} label="Telefon" htmlFor="phone">
              <Input
                id="phone"
                value={c.phone}
                onChange={(e) => setC({ ...c, phone: e.target.value })}
                placeholder="+48 600 000 000"
              />
            </Field>

            <Field icon={MapPin} label="Lokalizacja wydarzenia" htmlFor="location" className="sm:col-span-2">
              <Input
                id="location"
                value={c.location}
                onChange={(e) => setC({ ...c, location: e.target.value })}
                placeholder="np. Hotel Bristol, Warszawa"
              />
            </Field>

            <Field icon={FileText} label="Nazwa wydarzenia (opcjonalnie)" htmlFor="eventName" className="sm:col-span-2">
              <Input
                id="eventName"
                value={c.eventName}
                onChange={(e) => setC({ ...c, eventName: e.target.value })}
                placeholder="np. Konferencja Roczna 2026"
              />
            </Field>
          </div>

          <div className="mt-10 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
            <Button
              type="submit"
              size="lg"
              disabled={!valid}
              className="w-full bg-accent text-accent-foreground hover:bg-accent-muted sm:w-auto"
            >
              Dalej — konfiguracja menu
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Twoje dane są zapisywane lokalnie w przeglądarce — możesz wrócić do edycji w każdej chwili.
        </p>
      </main>
    </div>
  );
}
