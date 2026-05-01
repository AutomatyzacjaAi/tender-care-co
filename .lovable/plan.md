
# Kreator oferty cateringowej – frontend (klikalny prototyp)

Inspiracja wizualna: **Saltz** (czysty, jasny, „delikatesowy" UI z dużymi zdjęciami i serif headings).
Kolorystyka: **Jurek Catering** (magenta/burgund + ciepła biel) – marka zachowana, ale wyciszona i użyta z klasą.

## Cel

Zastąpić obecną „surową" ofertę interaktywną Jurek Catering nowym, eleganckim kreatorem. Klient korporacyjny / organizator dużego eventu w kilka minut konfiguruje wielodniowe wydarzenie z gotowymi pakietami menu – bez chaosu obecnego formularza.

**Zakres tej iteracji:** wyłącznie frontend, dane wpisane na sztywno. Brak backendu, panelu admina, realnego zapisu zamówień. Wszystko klikalne, z żywą kalkulacją ceny i ładnym podsumowaniem.

## Hierarchia danych (mock w kodzie)

```
Kategoria (np. „Przerwa kawowa")
  └── Wariant (np. „Standard", „Premium", „VIP")
        ├── cena za osobę
        ├── zdjęcie
        ├── krótki opis
        └── menu (sztywna lista pozycji – tylko podgląd)
```

Klient NIE komponuje menu. Wybiera tylko **wariant + liczbę osób + do której sekcji którego dnia**.

Przykładowe kategorie do prototypu:
Przerwa kawowa · Lunch · Kolacja bankietowa · Bufet · Cocktail · Food truck · Bar / napoje · Dodatki (sprzęt, obsługa)

## Przepływ – 3 kroki u góry

```
[ 1. Dane wydarzenia ]  →  [ 2. Konfiguracja menu ]  →  [ 3. Podsumowanie ]
```

Pasek kroków stale widoczny, można cofać.

### Krok 1 – Dane wydarzenia

Czysta strona, formularz wycentrowany:
- Imię i nazwisko, firma, e-mail, telefon
- Nazwa wydarzenia
- Lokalizacja
- **Daty wydarzenia** – zakres od–do (z tego rodzą się „dni" w kroku 2)
- Szacunkowa liczba gości (domyślna dla nowych sekcji, edytowalna)

CTA: „Dalej → konfiguracja menu".

### Krok 2 – Konfiguracja menu (serce aplikacji)

Układ 3-kolumnowy à la Saltz:

```
┌────────────────┬──────────────────────────────────┬─────────────────────┐
│  KATEGORIE     │  WARIANTY KATEGORII              │  TWÓJ EVENT         │
│  (lewa, ~20%)  │  (środek, ~50%)                  │  (prawa, ~30%)      │
│                │                                  │                     │
│  ☕ Przerwa ●  │  ┌──────────────────────────┐    │  Czw, 29.04         │
│  🍽 Lunch      │  │ [zdjęcie]  STANDARD      │    │   ▸ Sekcja: Lunch ●│
│  🥂 Kolacja    │  │           45 zł / os     │    │     • Lunch Premium │
│  🍕 Food truck │  │ kawa, herbata, ciastka   │    │       150 os · 9000 │
│  🍹 Bar        │  │ [Zobacz menu] [Dodaj +]  │    │   + dodaj sekcję    │
│  🛠 Dodatki   │  └──────────────────────────┘    │                     │
│                │  ┌──────────────────────────┐    │  Pt, 30.04          │
│                │  │ [zdjęcie]  PREMIUM       │    │   + dodaj sekcję    │
│                │  │           75 zł / os     │    │                     │
│                │  │ ...                      │    │  ─────────────────  │
│                │  │ [Zobacz menu] [Dodaj +]  │    │  RAZEM   41 550 zł │
│                │  └──────────────────────────┘    │  [Dalej →]          │
└────────────────┴──────────────────────────────────┴─────────────────────┘
```

**Lewa – Kategorie:** ikona + nazwa, aktywna podświetlona magentą.
**Środek – Warianty:** karty z dużym zdjęciem (jak Saltz), nazwa, cena/os, opis, „Zobacz menu" (rozwija akordeon z pełną listą pozycji – read-only) + „Dodaj do sekcji".
**Prawa – Twój event (sticky):** dni wynikają z dat z kroku 1. W każdym dniu „+ dodaj sekcję" (nazwa + opcjonalna godzina, np. „Lunch 12:00"). Aktywna sekcja podświetlona – tam trafiają dodawane warianty. Inline edycja liczby osób, „×" do usunięcia. Na dole suma netto + VAT + brutto, na żywo.

Logika dodawania: klik „Dodaj +" → jeśli jest aktywna sekcja, dodaje od razu; jeśli nie – popover „Do której sekcji?" z listą + opcja „utwórz nową".

### Krok 3 – Podsumowanie

Elegancki widok inspirowany order overview Catermonkey, ale ładniejszy:
- Nagłówek: nazwa eventu, daty, lokalizacja, klient, liczba gości
- Plan wydarzenia per dzień, per sekcja (z godzinami)
- Tabela: ilość · pozycja · cena/os · suma
- Specyfikacja VAT, kwota netto, VAT, brutto
- CTA: „Wstecz – edytuj" + „Wyślij zapytanie" (toast „Dziękujemy" – brak realnego maila) + „Pobierz PDF" (`window.print()` z dedykowanym print-stylesheet)

## Design – kierunek wizualny

- **Tło:** ciepła kremowa biel (jak Saltz), bardzo subtelny ciepły ton
- **Akcent:** magenta/burgund Jurek Catering – używany do CTA, aktywnych elementów, sumy ceny, kroku aktywnego (nie zalewa interfejsu, gra rolę „premium akcentu")
- **Typografia:** serif do nagłówków (Fraunces), sans-serif do treści (Inter) – z Google Fonts
- **Karty wariantów:** duże zdjęcie u góry, miękkie cienie, zaokrąglenia ~12px, hover lekko unosi
- **Pasek 3 kroków:** ponumerowane okręgi z linią, aktywny w magencie, ukończone z checkmarkiem
- **Mobile:** kategorie zwijają się w poziomy scroll, prawa kolumna „event" w drawer wysuwany z dołu (sticky CTA „Twój event – 41 550 zł ▲")
- **Zdjęcia:** wysokiej jakości stockowe / generowane do `src/assets/`, po jednym na wariant – tylko do prezentacji

## Co NIE wchodzi w tę iterację

- Backend, baza, autoryzacja
- Panel admina do edycji menu
- Realna wysyłka e-maila / zapis zamówień
- Server-side PDF (zostaje `window.print()`)
- Płatności, wielojęzyczność

## Sekcja techniczna

- TanStack Start, file-based routing:
  `routes/index.tsx` (krok 1) · `routes/configure.tsx` (krok 2) · `routes/summary.tsx` (krok 3)
- Stan kreatora w `OfferContext` (React Context) + `localStorage` (nie gubimy danych przy odświeżeniu)
- Typy: `Category`, `Variant` (z `menu: string[]`), `EventDay`, `Section`, `SectionItem`
- Katalog danych: `src/data/catalog.ts` – jeden plik, łatwy do podmiany
- shadcn/ui jako baza, Tailwind v4 z tokenami semantycznymi w `src/styles.css` (`--accent`, `--surface`, `--surface-elevated`, `--border-soft`) – zero hardcoded kolorów w komponentach
- Fonty Google przez `<link>` w `__root.tsx`
- Print-stylesheet dla kroku 3

## Akceptacja

Klient wchodzi na `/`, wypełnia dane (np. 3 dni, 1500 gości), w kroku 2 tworzy 1–2 sekcje per dzień, dodaje warianty z różnych kategorii, widzi żywą sumę po prawej, przechodzi do podsumowania i drukuje do PDF – całość wygląda jak premium produkt, nie jak formularz.
