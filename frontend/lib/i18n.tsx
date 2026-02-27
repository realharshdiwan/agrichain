"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import kn from "@/locales/kn.json";

export type Lang = "en" | "hi" | "kn";

const TRANSLATIONS: Record<Lang, typeof en> = { en, hi, kn };

const LANG_LABELS: Record<Lang, string> = {
    en: "EN",
    hi: "हिं",
    kn: "ಕನ್",
};

interface I18nCtx {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: string) => string;
    langLabel: string;
    langs: { code: Lang; label: string; nativeName: string }[];
}

const I18nContext = createContext<I18nCtx>({
    lang: "en",
    setLang: () => { },
    t: (k) => k,
    langLabel: "EN",
    langs: [],
});

export const LANG_OPTIONS: { code: Lang; label: string; nativeName: string }[] = [
    { code: "en", label: "English", nativeName: "English" },
    { code: "hi", label: "Hindi", nativeName: "हिन्दी" },
    { code: "kn", label: "Kannada", nativeName: "ಕನ್ನಡ" },
];

export function I18nProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>("en");

    useEffect(() => {
        const saved = localStorage.getItem("agrichain-lang") as Lang | null;
        if (saved && TRANSLATIONS[saved]) setLangState(saved);
    }, []);

    const setLang = (l: Lang) => {
        setLangState(l);
        localStorage.setItem("agrichain-lang", l);
    };

    // Dot-notation key resolver: "dashboard.form.cropType" → value
    const t = (key: string): string => {
        const parts = key.split(".");
        let cursor: Record<string, unknown> = TRANSLATIONS[lang] as Record<string, unknown>;
        for (const part of parts) {
            if (cursor && typeof cursor === "object" && part in cursor) {
                cursor = cursor[part] as Record<string, unknown>;
            } else {
                // Fallback to English
                let fb: Record<string, unknown> = TRANSLATIONS.en as Record<string, unknown>;
                for (const p of parts) {
                    fb = (fb?.[p] as Record<string, unknown>) ?? {};
                }
                return typeof fb === "string" ? fb : key;
            }
        }
        return typeof cursor === "string" ? cursor : key;
    };

    return (
        <I18nContext.Provider value={{ lang, setLang, t, langLabel: LANG_LABELS[lang], langs: LANG_OPTIONS }}>
            {children}
        </I18nContext.Provider>
    );
}

export const useI18n = () => useContext(I18nContext);
