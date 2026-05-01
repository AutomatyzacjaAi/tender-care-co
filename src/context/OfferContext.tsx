import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findVariant } from "@/data/catalog";
import { eachDayBetween } from "@/lib/format";

export type ContactInfo = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  eventName: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  defaultGuests: number;
};

export type SectionItem = {
  id: string;
  variantId: string;
  guests: number;
};

export type Section = {
  id: string;
  name: string;
  time: string; // optional HH:MM
  items: SectionItem[];
};

export type EventDay = {
  date: string; // YYYY-MM-DD
  sections: Section[];
};

export type OfferState = {
  contact: ContactInfo;
  days: EventDay[];
  activeSectionId: string | null;
};

const EMPTY_CONTACT: ContactInfo = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  eventName: "",
  location: "",
  startDate: "",
  endDate: "",
  defaultGuests: 100,
};

const STORAGE_KEY = "jurek_offer_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

type Ctx = {
  state: OfferState;
  setContact: (c: ContactInfo) => void;
  syncDaysFromContact: () => void;
  addSection: (date: string, name: string, time?: string) => string;
  renameSection: (sectionId: string, name: string, time?: string) => void;
  removeSection: (sectionId: string) => void;
  setActiveSection: (sectionId: string | null) => void;
  addItem: (sectionId: string, variantId: string, guests?: number) => void;
  updateItemGuests: (sectionId: string, itemId: string, guests: number) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  reset: () => void;
  totals: {
    netto: number;
    vat: number;
    brutto: number;
    byVat: Record<string, { base: number; tax: number }>;
  };
};

const OfferCtx = createContext<Ctx | null>(null);

function loadInitial(): OfferState {
  if (typeof window === "undefined") {
    return { contact: EMPTY_CONTACT, days: [], activeSectionId: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OfferState;
  } catch {
    // ignore
  }
  return { contact: EMPTY_CONTACT, days: [], activeSectionId: null };
}

export function OfferProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OfferState>(() => loadInitial());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const setContact = useCallback((contact: ContactInfo) => {
    setState((s) => ({ ...s, contact }));
  }, []);

  const syncDaysFromContact = useCallback(() => {
    setState((s) => {
      const dates = eachDayBetween(s.contact.startDate, s.contact.endDate);
      const existing = new Map(s.days.map((d) => [d.date, d]));
      const days: EventDay[] = dates.map((date) => existing.get(date) ?? { date, sections: [] });
      return { ...s, days };
    });
  }, []);

  const addSection = useCallback((date: string, name: string, time?: string) => {
    const id = uid();
    setState((s) => {
      const days = s.days.map((d) =>
        d.date === date
          ? { ...d, sections: [...d.sections, { id, name, time: time ?? "", items: [] }] }
          : d,
      );
      return { ...s, days, activeSectionId: id };
    });
    return id;
  }, []);

  const renameSection = useCallback((sectionId: string, name: string, time?: string) => {
    setState((s) => ({
      ...s,
      days: s.days.map((d) => ({
        ...d,
        sections: d.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, name, time: time ?? sec.time } : sec,
        ),
      })),
    }));
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setState((s) => ({
      ...s,
      activeSectionId: s.activeSectionId === sectionId ? null : s.activeSectionId,
      days: s.days.map((d) => ({
        ...d,
        sections: d.sections.filter((sec) => sec.id !== sectionId),
      })),
    }));
  }, []);

  const setActiveSection = useCallback((sectionId: string | null) => {
    setState((s) => ({ ...s, activeSectionId: sectionId }));
  }, []);

  const addItem = useCallback((sectionId: string, variantId: string, guests?: number) => {
    setState((s) => {
      const itemId = uid();
      const g = guests ?? s.contact.defaultGuests ?? 100;
      return {
        ...s,
        days: s.days.map((d) => ({
          ...d,
          sections: d.sections.map((sec) =>
            sec.id === sectionId
              ? { ...sec, items: [...sec.items, { id: itemId, variantId, guests: g }] }
              : sec,
          ),
        })),
      };
    });
  }, []);

  const updateItemGuests = useCallback((sectionId: string, itemId: string, guests: number) => {
    setState((s) => ({
      ...s,
      days: s.days.map((d) => ({
        ...d,
        sections: d.sections.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                items: sec.items.map((it) =>
                  it.id === itemId ? { ...it, guests: Math.max(1, guests) } : it,
                ),
              }
            : sec,
        ),
      })),
    }));
  }, []);

  const removeItem = useCallback((sectionId: string, itemId: string) => {
    setState((s) => ({
      ...s,
      days: s.days.map((d) => ({
        ...d,
        sections: d.sections.map((sec) =>
          sec.id === sectionId
            ? { ...sec, items: sec.items.filter((it) => it.id !== itemId) }
            : sec,
        ),
      })),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({ contact: EMPTY_CONTACT, days: [], activeSectionId: null });
  }, []);

  const totals = useMemo(() => {
    const byVat: Record<string, { base: number; tax: number }> = {};
    let netto = 0;
    let vat = 0;
    for (const d of state.days) {
      for (const sec of d.sections) {
        for (const it of sec.items) {
          const found = findVariant(it.variantId);
          if (!found) continue;
          const { variant } = found;
          const lineNet =
            variant.pricingUnit === "per_guest"
              ? variant.pricePerGuest * it.guests
              : variant.pricePerGuest * it.guests; // for per_unit, "guests" stores quantity
          const lineVat = lineNet * variant.vatRate;
          netto += lineNet;
          vat += lineVat;
          const key = String(variant.vatRate);
          if (!byVat[key]) byVat[key] = { base: 0, tax: 0 };
          byVat[key].base += lineNet;
          byVat[key].tax += lineVat;
        }
      }
    }
    return { netto, vat, brutto: netto + vat, byVat };
  }, [state.days]);

  const value: Ctx = {
    state,
    setContact,
    syncDaysFromContact,
    addSection,
    renameSection,
    removeSection,
    setActiveSection,
    addItem,
    updateItemGuests,
    removeItem,
    reset,
    totals,
  };

  return <OfferCtx.Provider value={value}>{children}</OfferCtx.Provider>;
}

export function useOffer() {
  const v = useContext(OfferCtx);
  if (!v) throw new Error("useOffer must be used inside <OfferProvider>");
  return v;
}
