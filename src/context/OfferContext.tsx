import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { findVariant } from "@/data/catalog";

export type ClientType = "private" | "company" | "organization";

export type ContactInfo = {
  clientType: ClientType;
  provider: string; // od kogo (nasza firma)
  fullName: string;
  company: string;
  nip: string;
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
  menuId?: string;
  guests: number;
};

export type Section = {
  id: string;
  name: string;
  time: string; // godzina od HH:MM
  endTime: string; // godzina do HH:MM
  guests: number;
  items: SectionItem[];
};

export type EventDay = {
  index: number; // 1-based ordinal: Dzień 1, Dzień 2…
  date?: string; // YYYY-MM-DD, opcjonalna konkretna data dnia
  sections: Section[];
};

export type OfferState = {
  contact: ContactInfo;
  days: EventDay[];
  activeSectionId: string | null;
};

const EMPTY_CONTACT: ContactInfo = {
  clientType: "company",
  provider: "Jurek Catering Sp. z o.o.",
  fullName: "",
  company: "",
  nip: "",
  email: "",
  phone: "",
  eventName: "",
  location: "",
  startDate: "",
  endDate: "",
  defaultGuests: 100,
};

const STORAGE_KEY = "jurek_offer_v2";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

type Ctx = {
  state: OfferState;
  setContact: (c: ContactInfo) => void;
  ensureDefaultDay: () => void;
  addDay: () => number;
  removeDay: (index: number) => void;
  setDayDate: (index: number, date: string) => void;
  addSection: (dayIndex: number, name: string, guests: number, time?: string, endTime?: string) => string;
  renameSection: (sectionId: string, name: string, time?: string, endTime?: string) => void;
  updateSectionGuests: (sectionId: string, guests: number) => void;
  removeSection: (sectionId: string) => void;
  setActiveSection: (sectionId: string | null) => void;
  addItem: (sectionId: string, variantId: string, menuId?: string, guests?: number) => void;
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
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OfferState>;
      return {
        contact: { ...EMPTY_CONTACT, ...(parsed.contact ?? {}) },
        days: parsed.days ?? [],
        activeSectionId: parsed.activeSectionId ?? null,
      };
    }
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

  const ensureDefaultDay = useCallback(() => {
    setState((s) => {
      if (s.days.length > 0) return s;
      return { ...s, days: [{ index: 1, sections: [] }] };
    });
  }, []);

  const addDay = useCallback(() => {
    let newIndex = 1;
    setState((s) => {
      newIndex = s.days.length === 0 ? 1 : Math.max(...s.days.map((d) => d.index)) + 1;
      return { ...s, days: [...s.days, { index: newIndex, sections: [] }] };
    });
    return newIndex;
  }, []);

  const setDayDate = useCallback((index: number, date: string) => {
    setState((s) => ({
      ...s,
      days: s.days.map((d) => (d.index === index ? { ...d, date } : d)),
    }));
  }, []);

  const removeDay = useCallback((index: number) => {
    setState((s) => {
      const filtered = s.days.filter((d) => d.index !== index);
      // re-number to keep contiguous 1..N
      const reIndexed = filtered.map((d, i) => ({ ...d, index: i + 1 }));
      const removedIds = new Set(
        s.days.find((d) => d.index === index)?.sections.map((sec) => sec.id) ?? [],
      );
      return {
        ...s,
        days: reIndexed,
        activeSectionId:
          s.activeSectionId && removedIds.has(s.activeSectionId) ? null : s.activeSectionId,
      };
    });
  }, []);

  const addSection = useCallback((dayIndex: number, name: string, guests: number, time?: string, endTime?: string) => {
    const id = uid();
    setState((s) => {
      const days = s.days.map((d) =>
        d.index === dayIndex
          ? { ...d, sections: [...d.sections, { id, name, time: time ?? "", endTime: endTime ?? "", guests, items: [] }] }
          : d,
      );
      return { ...s, days, activeSectionId: id };
    });
    return id;
  }, []);

  const renameSection = useCallback((sectionId: string, name: string, time?: string, endTime?: string) => {
    setState((s) => ({
      ...s,
      days: s.days.map((d) => ({
        ...d,
        sections: d.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, name, time: time ?? sec.time, endTime: endTime ?? sec.endTime } : sec,
        ),
      })),
    }));
  }, []);

  const updateSectionGuests = useCallback((sectionId: string, guests: number) => {
    setState((s) => ({
      ...s,
      days: s.days.map((d) => ({
        ...d,
        sections: d.sections.map((sec) =>
          sec.id === sectionId
            ? {
                ...sec,
                guests: Math.max(1, guests),
                items: sec.items.map((it) => ({ ...it, guests: Math.max(1, guests) })),
              }
            : sec,
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

  const addItem = useCallback(
    (sectionId: string, variantId: string, menuId?: string, guests?: number) => {
      setState((s) => {
        const itemId = uid();
        let sectionGuests = s.contact.defaultGuests ?? 100;
        for (const d of s.days) {
          const sec = d.sections.find((x) => x.id === sectionId);
          if (sec) {
            sectionGuests = sec.guests;
            break;
          }
        }
        const g = guests ?? sectionGuests;
        return {
          ...s,
          days: s.days.map((d) => ({
            ...d,
            sections: d.sections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    items: [...sec.items, { id: itemId, variantId, menuId, guests: g }],
                  }
                : sec,
            ),
          })),
        };
      });
    },
    [],
  );

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
          const lineNet = variant.pricePerGuest * it.guests;
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
    ensureDefaultDay,
    addDay,
    removeDay,
    setDayDate,
    addSection,
    renameSection,
    updateSectionGuests,
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
