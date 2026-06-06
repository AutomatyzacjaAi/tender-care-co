import coffeeBreak from "@/assets/coffee-break.jpg";
import lunch from "@/assets/lunch.jpg";
import galaDinner from "@/assets/gala-dinner.jpg";
import buffet from "@/assets/buffet.jpg";
import cocktail from "@/assets/cocktail.jpg";
import foodtruck from "@/assets/foodtruck.jpg";
import bar from "@/assets/bar.jpg";
import extras from "@/assets/extras.jpg";

export type PricingUnit = "per_guest" | "per_unit";

export type MenuOption = {
  id: string;
  name: string; // np. "Standard", "Premium", "VIP"
  items: string[]; // pozycje w menu
};

export type DishSubcategory =
  | "Zupa"
  | "Danie główne"
  | "Dodatek"
  | "Sałatka"
  | "Deser"
  | "Finger food";

export type Variant = {
  id: string;
  name: string; // np. "Wariant 1"
  tagline: string;
  pricePerGuest: number; // PLN
  pricingUnit: PricingUnit;
  vatRate: number;
  image: string;
  menus: MenuOption[]; // wybór menu w danej cenie
  subcategory?: DishSubcategory; // tylko dla menu indywidualnego
};

export type Category = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  variants: Variant[];
};

// ===== Helpers =====
function singleMenu(items: string[]): MenuOption[] {
  return [{ id: "default", name: "Menu", items }];
}

export const CATALOG: Category[] = [
  {
    id: "coffee-break",
    name: "Przerwa kawowa",
    symbol: "01",
    description: "Powitalna kawa, przerwy między sesjami, krótkie spotkania.",
    variants: [
      {
        id: "cb-v1",
        name: "Wariant 1",
        tagline: "Klasyczna przerwa — wybierz jeden z 3 zestawów.",
        pricePerGuest: 35,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: coffeeBreak,
        menus: [
          {
            id: "cb-v1-standard",
            name: "Standard",
            items: [
              "Kawa z ekspresu (świeżo mielona)",
              "Wybór herbat liściastych",
              "Woda mineralna gazowana i niegazowana",
              "Mix świeżych owoców",
              "Drobne ciasteczka maślane",
            ],
          },
          {
            id: "cb-v1-owocowe",
            name: "Owocowe",
            items: [
              "Kawa z ekspresu",
              "Selekcja herbat",
              "Świeżo wyciskane soki (pomarańcza, jabłko)",
              "Talerz świeżych owoców egzotycznych",
              "Smoothie shoty (3 rodzaje)",
            ],
          },
          {
            id: "cb-v1-wytrawne",
            name: "Wytrawne",
            items: [
              "Kawa z ekspresu",
              "Selekcja herbat",
              "Mini bagietki z szynką i serem",
              "Tartinki z hummusem i warzywami",
              "Paluszki serowe i orzechy",
            ],
          },
        ],
      },
      {
        id: "cb-v2",
        name: "Wariant 2",
        tagline: "Rozszerzona przerwa — mini-pâtisserie i wytrawne dodatki.",
        pricePerGuest: 65,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: coffeeBreak,
        menus: [
          {
            id: "cb-v2-premium",
            name: "Premium",
            items: [
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
            id: "cb-v2-francuskie",
            name: "Francuskie",
            items: [
              "Kawa specialty + alternatywy roślinne",
              "Selekcja herbat premium",
              "Macarons (6 smaków)",
              "Mini éclairs i religieuse",
              "Quiche lorraine i mini tarty",
              "Tabliczki czekolady rzemieślniczej",
            ],
          },
          {
            id: "cb-v2-zdrowe",
            name: "Zdrowe",
            items: [
              "Kawa specialty + alternatywy roślinne",
              "Herbaty ziołowe i zielone",
              "Smoothie bowls (3 rodzaje)",
              "Granola z jogurtem i owocami",
              "Energy balls i raw cakes",
              "Świeże owoce sezonowe",
            ],
          },
        ],
      },
      {
        id: "cb-v3",
        name: "Wariant 3",
        tagline: "Pełna stacja barista z autorską selekcją.",
        pricePerGuest: 95,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: coffeeBreak,
        menus: [
          {
            id: "cb-v3-vip",
            name: "VIP",
            items: [
              "Stacja barista z baristą na żywo",
              "Kawa specialty z 3 alternatywnych metod (V60, Aeropress, espresso)",
              "Matcha latte i czekolada na ciepło",
              "Świeże soki i lemoniady autorskie",
              "Autorska kolekcja deserów (6 rodzajów)",
              "Wytrawna stacja śniadaniowa (jajka, awokado, łosoś)",
              "Sezonowe owoce z całego świata",
            ],
          },
          {
            id: "cb-v3-sniadaniowy",
            name: "Śniadaniowy",
            items: [
              "Stacja barista",
              "Świeże soki tłoczone",
              "Stacja jajeczna live (omlety, jajka po benedyktyńsku)",
              "Awokado tosty z łososiem",
              "Granola, jogurty, owoce",
              "Świeże pieczywo i pasty (3 rodzaje)",
            ],
          },
          {
            id: "cb-v3-degustacyjny",
            name: "Degustacyjny",
            items: [
              "Stacja barista (3 metody parzenia)",
              "Degustacja kaw single origin (3 kraje)",
              "Stacja deserów autorskich (8 rodzajów)",
              "Mini tatary i tartare z łososia",
              "Selekcja serów i wędlin dojrzewających",
              "Lemoniady autorskie i wody smakowe",
            ],
          },
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
        menus: singleMenu([
          "Zupa dnia (krem z dyni / rosół)",
          "Pierś z kurczaka grillowana z warzywami sezonowymi",
          "Alternatywa wegetariańska: risotto z grzybami",
          "Sałatka świeża z dressingiem winegret",
          "Deser dnia (ciasto domowe)",
          "Woda, kawa, herbata",
        ]),
      },
      {
        id: "lunch-business",
        name: "Business",
        tagline: "Trzy dania z wyborem i premium dodatkami.",
        pricePerGuest: 110,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: lunch,
        menus: singleMenu([
          "Przystawka: tatar wołowy lub burrata z pomidorami",
          "Zupa: krem z białych warzyw z truflami",
          "Danie główne (do wyboru): polędwica wołowa / dorsz pieczony / gnocchi z dynią",
          "Sezonowe warzywa pieczone i purée ziemniaczane",
          "Deser autorski (panna cotta, mus czekoladowy)",
          "Selekcja kaw specialty i herbat",
          "Wody butelkowane premium",
        ]),
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
        menus: singleMenu([
          "Powitanie: lampka prosecco + kanapeczki",
          "Przystawka: carpaccio wołowe z parmezanem",
          "Zupa: bulion z kołdunami",
          "Danie główne: pierś z kaczki z purée z selera",
          "Deser: tarta cytrynowa z bezą",
          "Woda, kawa, herbata, wino do kolacji",
        ]),
      },
      {
        id: "gala-prestige",
        name: "Prestige",
        tagline: "Pięć dań, sommelier, autorska aranżacja stołu.",
        pricePerGuest: 285,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: galaDinner,
        menus: singleMenu([
          "Aperitif: koktajl powitalny + kanapki autorskie",
          "Amuse-bouche szefa kuchni",
          "Przystawka: foie gras lub łosoś w trzech odsłonach",
          "Zupa: krem z homara",
          "Danie główne (do wyboru): polędwica wołowa Wagyu / halibut z czarnym ryżem",
          "Selekcja serów francuskich",
          "Deser: autorska kompozycja patissera",
          "Pełna karta win z sommelierem",
        ]),
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
        menus: singleMenu([
          "Sekcja zimna: wędliny dojrzewające, sery, pasztety",
          "5 sałatek autorskich",
          "Sekcja ciepła: 3 dania mięsne + 1 rybne + 1 wege",
          "Dodatki: ziemniaki pieczone, kasza, ryż",
          "Pieczywo rzemieślnicze i masła smakowe",
          "Stół deserowy: 6 rodzajów",
          "Bar bezalkoholowy (woda, soki, kawa, herbata)",
        ]),
      },
      {
        id: "buffet-grand",
        name: "Grand",
        tagline: "Rozbudowany bufet z stacjami live cooking.",
        pricePerGuest: 215,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: buffet,
        menus: singleMenu([
          "Stacja serów dojrzewających z miodami i konfiturami",
          "Stacja sushi (uwijane na żywo)",
          "Stacja live: risotto / pasta z sosem trufla",
          "Pieczona polędwica wołowa krojona przy gościu",
          "Pełna sekcja owoców morza",
          "Bufet sałatkowy (8 rodzajów)",
          "Stacja deserów z patisserem",
          "Bar bezalkoholowy premium",
        ]),
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
        menus: singleMenu([
          "6 rodzajów finger food (4 zimne, 2 ciepłe)",
          "Mini-kanapki autorskie",
          "Tartaletki z mascarpone i owocami",
          "Bar bezalkoholowy: woda, soki, lemoniady",
          "Kawa, herbata po recepcji",
        ]),
      },
      {
        id: "cocktail-signature",
        name: "Signature",
        tagline: "Pełna recepcja z 12 rodzajami przekąsek i live stations.",
        pricePerGuest: 175,
        pricingUnit: "per_guest",
        vatRate: 0.08,
        image: cocktail,
        menus: singleMenu([
          "12 rodzajów finger food (8 zimnych, 4 ciepłe)",
          "Stacja sushi i tatarów",
          "Stacja owoców morza (krewetki, kalmary)",
          "Mini desery autorskie (8 rodzajów)",
          "Bar bezalkoholowy premium",
          "Lampka prosecco powitalna",
        ]),
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
        menus: singleMenu([
          "Burger wołowy klasyczny",
          "Burger BBQ z chrupiącą cebulą",
          "Burger wege z buraka i komosy",
          "Frytki belgijskie z dipami",
          "Pełna obsługa truck'a + grafika menu",
        ]),
      },
      {
        id: "ft-wraps",
        name: "Wrap truck",
        tagline: "Autorskie wrapy świeżo robione przy gościu.",
        pricePerGuest: 35,
        pricingUnit: "per_guest",
        vatRate: 0.05,
        image: foodtruck,
        menus: singleMenu([
          "Chicken Caesar wrap",
          "Wrap z pulled chicken i BBQ",
          "Wrap z falafelem (wege)",
          "Wrap z łososiem i serkiem śmietankowym",
          "Pełna obsługa truck'a + grafika menu",
        ]),
      },
      {
        id: "ft-rental",
        name: "Wynajem food trucka (1 dzień)",
        tagline: "Sam pojazd jako element scenografii / dodatkowa stacja.",
        pricePerGuest: 1500,
        pricingUnit: "per_unit",
        vatRate: 0.23,
        image: foodtruck,
        menus: singleMenu([
          "Food truck na 8 godzin",
          "Branding i oklejenie wg projektu",
          "Pełne wyposażenie kuchenne",
          "Generator i podstawowe oświetlenie",
        ]),
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
        menus: singleMenu([
          "Świeże soki tłoczone (3 rodzaje)",
          "Lemoniady autorskie (4 rodzaje)",
          "Wody premium (gazowana / niegazowana)",
          "Kawa specialty na całym evencie",
          "Selekcja herbat liściastych",
        ]),
      },
      {
        id: "bar-cocktail",
        name: "Bar koktajlowy",
        tagline: "Profesjonalny bar z barmanami i pełną kartą koktajli.",
        pricePerGuest: 125,
        pricingUnit: "per_guest",
        vatRate: 0.23,
        image: bar,
        menus: singleMenu([
          "8 koktajli klasycznych w karcie",
          "2 koktajle autorskie szyte pod event",
          "Wybór win (białe, czerwone, prosecco)",
          "Piwa rzemieślnicze",
          "Pełna obsługa 2 barmanów",
          "Bar mobilny + szkło + dekoracje",
        ]),
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
        menus: singleMenu([
          "Kelner w uniformie",
          "8 godzin pracy",
          "Briefing przed eventem",
        ]),
      },
      {
        id: "ex-tableware",
        name: "Zastawa premium (komplet / os)",
        tagline: "Porcelana, szkło i sztućce klasy premium.",
        pricePerGuest: 28,
        pricingUnit: "per_guest",
        vatRate: 0.23,
        image: extras,
        menus: singleMenu([
          "Porcelana premium (talerz, miska, podstawek)",
          "Komplet sztućców (6 elementów)",
          "Szkło: woda, wino, prosecco",
          "Serwetka materiałowa",
        ]),
      },
      {
        id: "ex-furniture",
        name: "Meble bankietowe (komplet / os)",
        tagline: "Krzesło Chiavari + miejsce przy stole z obrusem.",
        pricePerGuest: 35,
        pricingUnit: "per_guest",
        vatRate: 0.23,
        image: extras,
        menus: singleMenu([
          "Krzesło Chiavari (białe / złote)",
          "Stół bankietowy z obrusem",
          "Skirting i dekoracja stołu",
        ]),
      },
    ],
  },
];

// ===== Menu indywidualne — pojedyncze dania jako warianty =====
function dish(
  id: string,
  name: string,
  subcategory: DishSubcategory,
  pricePerGuest: number,
): Variant {
  return {
    id,
    name,
    tagline: subcategory,
    pricePerGuest,
    pricingUnit: "per_guest",
    vatRate: 0.08,
    image: lunch,
    menus: singleMenu([name]),
    subcategory,
  };
}

const INDIVIDUAL_DISHES: Variant[] = [
  // Zupy
  dish("dish-z1", "Krem z dyni z imbirem", "Zupa", 14),
  dish("dish-z2", "Rosół drobiowy z makaronem", "Zupa", 12),
  dish("dish-z3", "Krem z białych warzyw z truflą", "Zupa", 18),
  dish("dish-z4", "Żurek z jajkiem i białą kiełbasą", "Zupa", 15),
  dish("dish-z5", "Krem pomidorowy z bazylią", "Zupa", 13),
  dish("dish-z6", "Krem z brokułów z migdałami", "Zupa", 14),
  dish("dish-z7", "Krem z borowików", "Zupa", 18),
  dish("dish-z8", "Bulion z kołdunami", "Zupa", 16),
  dish("dish-z9", "Krem z buraków z kozim serem", "Zupa", 15),
  dish("dish-z10", "Tom kha gai", "Zupa", 19),
  // Dania główne
  dish("dish-d1", "Pierś z kurczaka grillowana", "Danie główne", 32),
  dish("dish-d2", "Polędwiczki wieprzowe w sosie kurkowym", "Danie główne", 38),
  dish("dish-d3", "Polędwica wołowa sous-vide", "Danie główne", 58),
  dish("dish-d4", "Pierś z kaczki z purée z selera", "Danie główne", 52),
  dish("dish-d5", "Dorsz pieczony z masłem cytrynowym", "Danie główne", 44),
  dish("dish-d6", "Łosoś grillowany ze szpinakiem", "Danie główne", 48),
  dish("dish-d7", "Risotto z borowikami (wege)", "Danie główne", 34),
  dish("dish-d8", "Gnocchi z dynią i szałwią (wege)", "Danie główne", 30),
  dish("dish-d9", "Schab pieczony z jabłkiem", "Danie główne", 28),
  dish("dish-d10", "Pad thai z krewetkami", "Danie główne", 42),
  // Dodatki
  dish("dish-do1", "Ziemniaki opiekane z rozmarynem", "Dodatek", 8),
  dish("dish-do2", "Purée ziemniaczane", "Dodatek", 7),
  dish("dish-do3", "Kasza pęczak z warzywami", "Dodatek", 8),
  dish("dish-do4", "Ryż jaśminowy", "Dodatek", 6),
  dish("dish-do5", "Warzywa pieczone (mix)", "Dodatek", 9),
  dish("dish-do6", "Buraki z kozim serem", "Dodatek", 10),
  dish("dish-do7", "Kluski śląskie", "Dodatek", 8),
  dish("dish-do8", "Frytki belgijskie", "Dodatek", 7),
  // Sałatki
  dish("dish-s1", "Caprese z mozzarellą di bufala", "Sałatka", 16),
  dish("dish-s2", "Caesar z kurczakiem", "Sałatka", 18),
  dish("dish-s3", "Grecka klasyczna", "Sałatka", 14),
  dish("dish-s4", "Z burakami i kozim serem", "Sałatka", 15),
  dish("dish-s5", "Z grillowanym halloumi", "Sałatka", 17),
  // Desery
  dish("dish-de1", "Panna cotta z owocami leśnymi", "Deser", 14),
  dish("dish-de2", "Mus czekoladowy", "Deser", 13),
  dish("dish-de3", "Tarta cytrynowa z bezą", "Deser", 15),
  dish("dish-de4", "Tiramisu", "Deser", 16),
  dish("dish-de5", "Sernik wiedeński", "Deser", 12),
  dish("dish-de6", "Brownie z malinami", "Deser", 12),
  // Finger food
  dish("dish-f1", "Tartinka z łososiem i serkiem", "Finger food", 8),
  dish("dish-f2", "Mini quiche lorraine", "Finger food", 7),
  dish("dish-f3", "Bruschetta pomidorowa", "Finger food", 6),
  dish("dish-f4", "Tatar wołowy w łyżeczce", "Finger food", 12),
  dish("dish-f5", "Krewetki w tempurze", "Finger food", 14),
  dish("dish-f6", "Mini-kanapka z szynką parmeńską", "Finger food", 9),
  dish("dish-f7", "Wrap z kurczakiem mini", "Finger food", 8),
  dish("dish-f8", "Caprese na patyku", "Finger food", 7),
];

CATALOG.push({
  id: "menu-indywidualne",
  name: "Menu indywidualne",
  symbol: "09",
  description:
    "Skomponuj własne menu z bazy pojedynczych dań — zupy, dania główne, dodatki, desery, finger food.",
  variants: INDIVIDUAL_DISHES,
});

export const DISH_SUBCATEGORIES: DishSubcategory[] = [
  "Zupa",
  "Danie główne",
  "Dodatek",
  "Sałatka",
  "Deser",
  "Finger food",
];

export function getIndividualDishes(): Variant[] {
  return INDIVIDUAL_DISHES;
}

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

export function findMenu(
  variantId: string,
  menuId?: string,
): MenuOption | null {
  const found = findVariant(variantId);
  if (!found) return null;
  if (!menuId) return found.variant.menus[0] ?? null;
  return found.variant.menus.find((m) => m.id === menuId) ?? null;
}
