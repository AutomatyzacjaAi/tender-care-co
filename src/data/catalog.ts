import coffeeBreak from "@/assets/coffee-break.jpg";
import lunch from "@/assets/lunch.jpg";
import galaDinner from "@/assets/gala-dinner.jpg";
import buffet from "@/assets/buffet.jpg";
import cocktail from "@/assets/cocktail.jpg";
import foodtruck from "@/assets/foodtruck.jpg";
import bar from "@/assets/bar.jpg";
import extras from "@/assets/extras.jpg";

export type PricingUnit = "per_guest" | "per_unit";

export type Variant = {
  id: string;
  name: string;
  tagline: string;
  pricePerGuest: number; // PLN; if pricingUnit = per_unit, treated as unit price
  pricingUnit: PricingUnit;
  vatRate: number; // 0.05, 0.08, 0.23
  image: string;
  menu: string[]; // sztywne pozycje, podgląd
};

export type Category = {
  id: string;
  name: string;
  symbol: string; // krótka „litera/emoji" dla lewej kolumny
  description: string;
  variants: Variant[];
};

export const CATALOG: Category[] = [
  {
    id: "coffee-break",
    name: "Przerwa kawowa",
    symbol: "01",
    description: "Powitalna kawa, przerwy między sesjami, krótkie spotkania.",
    variants: [
      {
        id: "cb-standard",
        name: "Standard",
        tagline: "Klasyczna przerwa z kawą i ciastkami.",
        pricePerGuest: 35,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: coffeeBreak,
        menu: [
          "Kawa z ekspresu (świeżo mielona)",
          "Wybór herbat liściastych",
          "Woda mineralna gazowana i niegazowana",
          "Mix świeżych owoców",
          "Drobne ciasteczka maślane",
        ],
      },
      {
        id: "cb-premium",
        name: "Premium",
        tagline: "Rozszerzona przerwa z mini-pâtisserie i wytrawnymi przekąskami.",
        pricePerGuest: 65,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: coffeeBreak,
        menu: [
          "Kawa specialty + alternatywy roślinne",
          "Selekcja herbat premium",
          "Świeże soki tłoczone",
          "Mini croissanty (klasyczne, czekoladowe, migdałowe)",
          "Tartaletki owocowe i mini éclairs",
          "Wytrawne mini-kanapki z łososiem i serem",
          "Sezonowe owoce w eleganckiej prezentacji",
        ],
      },
      {
        id: "cb-vip",
        name: "VIP",
        tagline: "Pełna stacja barista z autorską selekcją słodkości.",
        pricePerGuest: 95,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: coffeeBreak,
        menu: [
          "Stacja barista z baristą na żywo",
          "Kawa specialty z 3 alternatywnych metod (V60, Aeropress, espresso)",
          "Matcha latte i czekolada na ciepło",
          "Świeże soki i lemoniady autorskie",
          "Autorska kolekcja deserów (6 rodzajów)",
          "Wytrawna stacja śniadaniowa (jajka, awokado, łosoś)",
          "Sezonowe owoce z całego świata",
        ],
      },
    ],
  },
  {
    id: "lunch",
    name: "Lunch",
    symbol: "02",
    description: "Obiad w trakcie konferencji, eventu firmowego lub szkolenia.",
    variants: [
      {
        id: "lunch-standard",
        name: "Standard",
        tagline: "Lunch zestawowy: zupa, danie główne, deser.",
        pricePerGuest: 75,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: lunch,
        menu: [
          "Zupa dnia (krem z dyni / rosół)",
          "Pierś z kurczaka grillowana z warzywami sezonowymi",
          "Alternatywa wegetariańska: risotto z grzybami",
          "Sałatka świeża z dressingiem winegret",
          "Deser dnia (ciasto domowe)",
          "Woda, kawa, herbata",
        ],
      },
      {
        id: "lunch-business",
        name: "Business",
        tagline: "Trzy dania z wyborem i premium dodatkami.",
        pricePerGuest: 110,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: lunch,
        menu: [
          "Przystawka: tatar wołowy lub burrata z pomidorami",
          "Zupa: krem z białych warzyw z truflami",
          "Danie główne (do wyboru): polędwica wołowa / dorsz pieczony / gnocchi z dynią",
          "Sezonowe warzywa pieczone i purée ziemniaczane",
          "Deser autorski (panna cotta, mus czekoladowy)",
          "Selekcja kaw specialty i herbat",
          "Wody butelkowane premium",
        ],
      },
    ],
  },
  {
    id: "gala-dinner",
    name: "Kolacja bankietowa",
    symbol: "03",
    description: "Wieczorna kolacja na konferencji, gali, integracji.",
    variants: [
      {
        id: "gala-classic",
        name: "Classic",
        tagline: "Trzydaniowa kolacja serwowana w eleganckim setcie.",
        pricePerGuest: 165,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: galaDinner,
        menu: [
          "Powitanie: lampka prosecco + kanapeczki",
          "Przystawka: carpaccio wołowe z parmezanem",
          "Zupa: bulion z kołdunami",
          "Danie główne: pierś z kaczki z purée z selera",
          "Deser: tarta cytrynowa z bezą",
          "Woda, kawa, herbata, wino do kolacji",
        ],
      },
      {
        id: "gala-prestige",
        name: "Prestige",
        tagline: "Pięć dań, sommelier, autorska aranżacja stołu.",
        pricePerGuest: 285,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: galaDinner,
        menu: [
          "Aperitif: koktajl powitalny + kanapki autorskie",
          "Amuse-bouche szefa kuchni",
          "Przystawka: foie gras lub łosoś w trzech odsłonach",
          "Zupa: krem z homara",
          "Danie główne (do wyboru): polędwica wołowa Wagyu / halibut z czarnym ryżem",
          "Selekcja serów francuskich",
          "Deser: autorska kompozycja patissera",
          "Pełna karta win z sommelierem",
        ],
      },
    ],
  },
  {
    id: "buffet",
    name: "Bufet",
    symbol: "04",
    description: "Bufet na dłuższe wydarzenia, dla większej elastyczności gości.",
    variants: [
      {
        id: "buffet-classic",
        name: "Classic",
        tagline: "Klasyczny bufet ciepło-zimny.",
        pricePerGuest: 145,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: buffet,
        menu: [
          "Sekcja zimna: wędliny dojrzewające, sery, pasztety",
          "5 sałatek autorskich",
          "Sekcja ciepła: 3 dania mięsne + 1 rybne + 1 wege",
          "Dodatki: ziemniaki pieczone, kasza, ryż",
          "Pieczywo rzemieślnicze i masła smakowe",
          "Stół deserowy: 6 rodzajów",
          "Bar bezalkoholowy (woda, soki, kawa, herbata)",
        ],
      },
      {
        id: "buffet-grand",
        name: "Grand",
        tagline: "Rozbudowany bufet z stacjami live cooking.",
        pricePerGuest: 215,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: buffet,
        menu: [
          "Stacja serów dojrzewających z miodami i konfiturami",
          "Stacja sushi (uwijane na żywo)",
          "Stacja live: risotto / pasta z sosem trufla",
          "Pieczona polędwica wołowa krojona przy gościu",
          "Pełna sekcja owoców morza",
          "Bufet sałatkowy (8 rodzajów)",
          "Stacja deserów z patisserem",
          "Bar bezalkoholowy premium",
        ],
      },
    ],
  },
  {
    id: "cocktail",
    name: "Cocktail",
    symbol: "05",
    description: "Recepcja stojąca, finger food, eleganckie spotkanie.",
    variants: [
      {
        id: "cocktail-light",
        name: "Light",
        tagline: "Krótka recepcja z 6 rodzajami przekąsek.",
        pricePerGuest: 85,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: cocktail,
        menu: [
          "6 rodzajów finger food (4 zimne, 2 ciepłe)",
          "Mini-kanapki autorskie",
          "Tartaletki z mascarpone i owocami",
          "Bar bezalkoholowy: woda, soki, lemoniady",
          "Kawa, herbata po recepcji",
        ],
      },
      {
        id: "cocktail-signature",
        name: "Signature",
        tagline: "Pełna recepcja z 12 rodzajami przekąsek i live stations.",
        pricePerGuest: 175,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: cocktail,
        menu: [
          "12 rodzajów finger food (8 zimnych, 4 ciepłe)",
          "Stacja sushi i tatarów",
          "Stacja owoców morza (krewetki, kalmary)",
          "Mini desery autorskie (8 rodzajów)",
          "Bar bezalkoholowy premium",
          "Lampka prosecco powitalna",
        ],
      },
    ],
  },
  {
    id: "foodtruck",
    name: "Food truck",
    symbol: "06",
    description: "Strefa food truck na festiwal, integrację, event plenerowy.",
    variants: [
      {
        id: "ft-burger",
        name: "Burger truck",
        tagline: "Autorskie burgery wołowe i wege na żywo.",
        pricePerGuest: 45,
        pricingUnit: "per_guest",
        vatRate: 0.05,
        image: foodtruck,
        menu: [
          "Burger wołowy klasyczny",
          "Burger BBQ z chrupiącą cebulą",
          "Burger wege z buraka i komosy",
          "Frytki belgijskie z dipami",
          "Pełna obsługa truck'a + grafika menu",
        ],
      },
      {
        id: "ft-wraps",
        name: "Wrap truck",
        tagline: "Autorskie wrapy świeżo robione przy gościu.",
        pricePerGuest: 35,
        pricingUnit: "per_guest",
        vatRate: 0.05,
        image: foodtruck,
        menu: [
          "Chicken Caesar wrap",
          "Wrap z pulled chicken i BBQ",
          "Wrap z falafelem (wege)",
          "Wrap z łososiem i serkiem śmietankowym",
          "Pełna obsługa truck'a + grafika menu",
        ],
      },
      {
        id: "ft-rental",
        name: "Wynajem food trucka (1 dzień)",
        tagline: "Sam pojazd jako element scenografii / dodatkowa stacja.",
        pricePerGuest: 1500,
        pricingUnit: "per_unit",
        vatRate: 0.23,
        image: foodtruck,
        menu: [
          "Food truck na 8 godzin",
          "Branding i oklejenie wg projektu",
          "Pełne wyposażenie kuchenne",
          "Generator i podstawowe oświetlenie",
        ],
      },
    ],
  },
  {
    id: "bar",
    name: "Bar / napoje",
    symbol: "07",
    description: "Bar bezalkoholowy lub pełna obsługa barmańska.",
    variants: [
      {
        id: "bar-soft",
        name: "Bar bezalkoholowy",
        tagline: "Pełna karta soft drinks na cały event.",
        pricePerGuest: 45,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: bar,
        menu: [
          "Świeże soki tłoczone (3 rodzaje)",
          "Lemoniady autorskie (4 rodzaje)",
          "Wody premium (gazowana / niegazowana)",
          "Kawa specialty na całym evencie",
          "Selekcja herbat liściastych",
        ],
      },
      {
        id: "bar-cocktail",
        name: "Bar koktajlowy",
        tagline: "Profesjonalny bar z barmanami i pełną kartą koktajli.",
        pricePerGuest: 125,
        pricingUnit: "per_guest",
        vatRate: 0.23,
        image: bar,
        menu: [
          "8 koktajli klasycznych w karcie",
          "2 koktajle autorskie szyte pod event",
          "Wybór win (białe, czerwone, prosecco)",
          "Piwa rzemieślnicze",
          "Pełna obsługa 2 barmanów",
          "Bar mobilny + szkło + dekoracje",
        ],
      },
    ],
  },
  {
    id: "extras",
    name: "Dodatki",
    symbol: "08",
    description: "Sprzęt, obsługa, scenografia, transport.",
    variants: [
      {
        id: "ex-staff",
        name: "Pakiet kelnerski (1 osoba / 8h)",
        tagline: "Doświadczony kelner w eleganckim uniformie.",
        pricePerGuest: 480,
        pricingUnit: "per_unit",
        vatRate: 0.23,
        image: extras,
        menu: [
          "Kelner w uniformie",
          "8 godzin pracy",
          "Briefing przed eventem",
        ],
      },
      {
        id: "ex-tableware",
        name: "Zastawa premium (komplet / os)",
        tagline: "Porcelana, szkło i sztućce klasy premium.",
        pricePerGuest: 28,
        pricingUnit: "per_guest",
        vatRate: 0.23,
        image: extras,
        menu: [
          "Porcelana premium (talerz, miska, podstawek)",
          "Komplet sztućców (6 elementów)",
          "Szkło: woda, wino, prosecco",
          "Serwetka materiałowa",
        ],
      },
      {
        id: "ex-furniture",
        name: "Meble bankietowe (komplet / os)",
        tagline: "Krzesło Chiavari + miejsce przy stole z obrusem.",
        pricePerGuest: 35,
        pricingUnit: "per_guest",
        vatRate: 0.23,
        image: extras,
        menu: [
          "Krzesło Chiavari (białe / złote)",
          "Stół bankietowy z obrusem",
          "Skirting i dekoracja stołu",
        ],
      },
    ],
  },
];

export const VAT_LABEL: Record<number, string> = {
  0.05: "5%",
  0.08: "8%",
  0.23: "23%",
};

export function findVariant(variantId: string): { variant: Variant; category: Category } | null {
  for (const c of CATALOG) {
    const v = c.variants.find((x) => x.id === variantId);
    if (v) return { variant: v, category: c };
  }
  return null;
}
