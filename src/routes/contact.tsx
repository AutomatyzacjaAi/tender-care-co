import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Mail, MapPin, User2, Building2, Phone, Users } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOffer } from "@/context/OfferContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Krok 1 — Dane wydarzenia · Jurek Catering" },
      {
        name: "description",
        content: "Powiedz nam o swoim evencie: termin, miejsce, liczba gości.",
      },
    ],
  }),
  component: ContactStep,
});

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
  const { state, setContact, syncDaysFromContact } = useOffer();
  const [c, setC] = useState(state.contact);
  const navigate = useNavigate();

  const valid =
    c.fullName.trim() &&
    c.email.trim() &&
    c.eventName.trim() &&
    c.startDate &&
    c.endDate &&
    c.endDate >= c.startDate &&
    c.defaultGuests > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setContact(c);
    // sync after state update — defer one tick
    setTimeout(() => {
      syncDaysFromContact();
      navigate({ to: "/configure" });
    }, 0);
  }

  return (
    <div className="bg-surface min-h-screen">
      <BrandHeader right={<Stepper />} />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-8 sm:py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-accent">Krok 1 z 3</p>
          <h1 className="font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl">
            Opowiedz nam o swoim wydarzeniu
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Kilka podstawowych informacji o evencie. W następnym kroku skonfigurujesz menu na każdy
            dzień.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-surface-elevated border-border-soft rounded-2xl border p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_-24px_rgba(0,0,0,0.08)] sm:p-10"
        >
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
            <Field icon={Building2} label="Firma" htmlFor="company">
              <Input
                id="company"
                value={c.company}
                onChange={(e) => setC({ ...c, company: e.target.value })}
                placeholder="Acme Sp. z o.o."
              />
            </Field>
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

            <div className="border-border-soft sm:col-span-2 my-2 border-t" />

            <Field icon={CalendarDays} label="Nazwa wydarzenia" htmlFor="eventName" className="sm:col-span-2">
              <Input
                id="eventName"
                value={c.eventName}
                onChange={(e) => setC({ ...c, eventName: e.target.value })}
                placeholder="np. Konferencja Roczna 2026"
                required
              />
            </Field>
            <Field icon={MapPin} label="Lokalizacja" htmlFor="location" className="sm:col-span-2">
              <Input
                id="location"
                value={c.location}
                onChange={(e) => setC({ ...c, location: e.target.value })}
                placeholder="np. Hotel Bristol, Warszawa"
              />
            </Field>

            <Field icon={CalendarDays} label="Data od" htmlFor="startDate">
              <Input
                id="startDate"
                type="date"
                value={c.startDate}
                onChange={(e) => setC({ ...c, startDate: e.target.value })}
                required
              />
            </Field>
            <Field icon={CalendarDays} label="Data do" htmlFor="endDate">
              <Input
                id="endDate"
                type="date"
                value={c.endDate}
                min={c.startDate || undefined}
                onChange={(e) => setC({ ...c, endDate: e.target.value })}
                required
              />
            </Field>
            <Field icon={Users} label="Szacunkowa liczba gości" htmlFor="guests" className="sm:col-span-2">
              <Input
                id="guests"
                type="number"
                min={1}
                value={c.defaultGuests}
                onChange={(e) => setC({ ...c, defaultGuests: Number(e.target.value) || 0 })}
                required
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Wartość domyślna dla nowych pozycji menu — zawsze możesz ją zmienić indywidualnie.
              </p>
            </Field>
          </div>

          <div className="mt-10 flex flex-col-reverse items-center justify-between gap-3 sm:flex-row">
            <Link
              to="/"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              ← Powrót na stronę
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={!valid}
              className="w-full bg-accent text-accent-foreground hover:bg-accent-muted sm:w-auto"
            >
              Dalej — konfiguracja menu →
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
