## Cel

Przebudować layout kart menu (`VariantCard` i `MenuCard` w `src/routes/index.tsx`), żeby miały spójną, czytelną strukturę zgodną z opisem.

## Nowa struktura karty

```
┌────────────────────────────────┐
│ Nazwa (np. Classic)            │
│ cena netto / os                │
│ cena brutto / os               │
├────────────────────────────────┤  ← divider
│ Opis (tagline)                 │
├────────────────────────────────┤  ← divider
│ W zestawie:                    │
│ · pozycja 1                    │
│ · pozycja 2                    │
│ · pozycja 3                    │
│ · pozycja 4                    │
│ · pozycja 5                    │
│ Zobacz więcej (jeśli > 5)      │
├────────────────────────────────┤
│ [Szczegóły]   [Dodaj]          │
└────────────────────────────────┘
```

## Szczegóły implementacji

1. **Ceny netto/brutto** — `variant.pricePerGuest` to cena netto, VAT z `variant.vatRate` (najczęściej 0.08). Brutto = `pricePerGuest * (1 + vatRate)`. Wyświetlamy obie linie w nagłówku karty (zamiast jednej ceny po prawej) — np.:
   - `12 zł netto / os`
   - `13 zł brutto / os`
2. **Dividery** — `border-t border-border-soft` między sekcjami: header ↔ opis ↔ "W zestawie" ↔ przyciski.
3. **W zestawie** — pokazujemy max 5 pierwszych pozycji. Jeśli `items.length > 5`, pod listą przycisk-link `Zobacz więcej (+N)` który otwiera ten sam dialog co `Szczegóły` (`onPreview`). Po kliknięciu "Zobacz mniej" zwija z powrotem (stan lokalny w karcie) — albo prościej: zawsze otwiera `onPreview()`. Wybieram drugą opcję (mniej stanu, spójne z istniejącym podglądem szczegółów).
4. **Przyciski na dole** — bez zmian funkcjonalnych: `Szczegóły` (outline) + `Dodaj` (accent) z ikoną `Plus`.
5. Zastosować zmiany w **obu** komponentach: `VariantCard` (linie 734–793) i `MenuCard` (linie 898–957), żeby wyglądały identycznie.

## Pliki do zmiany

- `src/routes/index.tsx` — przepisanie zawartości `VariantCard` i `MenuCard`. Bez zmian w `OfferContext`, danych czy logice dodawania.

## Poza zakresem

- Brak zmian w katalogu (`src/data/catalog.ts`).
- Brak zmian w dialogu dodawania / podglądu — `onPreview` i `onAdd` działają jak dotychczas.
- Brak zmian w nagłówkach stron / koszyku.
