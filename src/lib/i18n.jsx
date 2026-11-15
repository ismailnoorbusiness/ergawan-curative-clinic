import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en } from "@/lib/translations/en";
import { fa } from "@/lib/translations/fa";
import { ps } from "@/lib/translations/ps";

const STORAGE_KEY = "ergawan.language";
const dictionaries = { en, fa, ps };

export const LANGUAGES = [
  { code: "en", label: "EN", name: "English", dir: "ltr" },
  { code: "fa", label: "دری", name: "Dari", dir: "rtl" },
  { code: "ps", label: "پښتو", name: "Pashto", dir: "rtl" },
];

const resolve = (source, path) =>
  path.split(".").reduce((node, key) => (node == null ? undefined : node[key]), source);

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && dictionaries[saved]) setLang(saved);
    } catch {
      /* storage unavailable — stay on English */
    }
  }, []);

  useEffect(() => {
    const dir = lang === "en" ? "ltr" : "rtl";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  // Returns the exact value at `path` (string, array or object); falls back to English.
  const t = useCallback(
    (path) => {
      const value = resolve(dictionaries[lang], path);
      return value === undefined ? resolve(dictionaries.en, path) ?? path : value;
    },
    [lang],
  );

  const value = useMemo(
    () => ({
      lang,
      dir: lang === "en" ? "ltr" : "rtl",
      isRtl: lang !== "en",
      setLang,
      t,
      /** Picks a localized field from a record: pick(service, "name") → name_fa || name */
      pick: (record, field) => (record ? record[`${field}_${lang}`] || record[field] || "" : ""),
    }),
    [lang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n must be used inside LanguageProvider");
  return context;
}

export const LANGUAGE_OPTIONS = LANGUAGES;