"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type CvData,
  type CvDocument,
  type CvSettings,
  type ListKey,
  type Personal,
  DEFAULT_SETTINGS,
  emptyData,
  newListItem,
  sampleData,
} from "./cv-types";

const STORAGE_KEY = "cv-creator:document:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Merge a possibly-partial saved document onto safe defaults. */
export function normalizeDocument(input: unknown): CvDocument | null {
  if (!isRecord(input)) return null;
  const data = isRecord(input.data) ? input.data : null;
  const settings = isRecord(input.settings) ? input.settings : {};
  if (!data) return null;

  const base = emptyData();
  const personal = isRecord(data.personal) ? data.personal : {};
  const list = (key: ListKey) => (Array.isArray(data[key]) ? (data[key] as never[]) : []);

  return {
    version: 1,
    data: {
      personal: { ...base.personal, ...(personal as Partial<Personal>) },
      experience: list("experience"),
      education: list("education"),
      skills: list("skills"),
      languages: list("languages"),
      projects: list("projects"),
      links: list("links"),
    },
    settings: { ...DEFAULT_SETTINGS, ...(settings as Partial<CvSettings>) },
  };
}

/** Read the saved document, falling back to the sample CV. Client-only. */
function loadInitialDocument(): CvDocument {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const doc = normalizeDocument(JSON.parse(raw));
        if (doc) return doc;
      }
    } catch {
      // Corrupt or unavailable storage: start from the sample.
    }
  }
  return { version: 1, data: sampleData(), settings: DEFAULT_SETTINGS };
}

export function useCvStore() {
  const [initial] = useState(loadInitialDocument);
  const [data, setData] = useState<CvData>(initial.data);
  const [settings, setSettings] = useState<CvSettings>(initial.settings);

  // Persist on change.
  useEffect(() => {
    const doc: CvDocument = { version: 1, data, settings };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // Storage may be full (large photo) or unavailable; keep working in memory.
    }
  }, [data, settings]);

  const updatePersonal = useCallback(<K extends keyof Personal>(key: K, value: Personal[K]) => {
    setData((d) => ({ ...d, personal: { ...d.personal, [key]: value } }));
  }, []);

  const updateSettings = useCallback(<K extends keyof CvSettings>(key: K, value: CvSettings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  const addItem = useCallback((key: ListKey) => {
    setData((d) => ({ ...d, [key]: [...d[key], newListItem(key)] }));
  }, []);

  const updateItem = useCallback(
    <K extends ListKey>(key: K, id: string, patch: Partial<CvData[K][number]>) => {
      setData((d) => ({
        ...d,
        [key]: d[key].map((item) => (item.id === id ? { ...item, ...patch } : item)),
      }));
    },
    [],
  );

  const removeItem = useCallback((key: ListKey, id: string) => {
    setData((d) => ({ ...d, [key]: d[key].filter((item) => item.id !== id) }));
  }, []);

  const moveItem = useCallback((key: ListKey, id: string, direction: -1 | 1) => {
    setData((d) => {
      const list: { id: string }[] = [...d[key]];
      const index = list.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= list.length) return d;
      const [item] = list.splice(index, 1);
      list.splice(target, 0, item);
      return { ...d, [key]: list };
    });
  }, []);

  const loadSample = useCallback(() => setData(sampleData()), []);
  const clearAll = useCallback(() => setData(emptyData()), []);

  const importDocument = useCallback((doc: CvDocument) => {
    setData(doc.data);
    setSettings(doc.settings);
  }, []);

  const exportDocument = useCallback(
    (): CvDocument => ({ version: 1, data, settings }),
    [data, settings],
  );

  return {
    data,
    settings,
    updatePersonal,
    updateSettings,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    loadSample,
    clearAll,
    importDocument,
    exportDocument,
  };
}

export type CvStore = ReturnType<typeof useCvStore>;
