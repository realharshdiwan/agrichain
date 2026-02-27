"use client";

import React, { useState, useRef, useEffect } from "react";
import { useI18n, LANG_OPTIONS, type Lang } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
    const { lang, setLang, langLabel } = useI18n();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    color: "#4ade80",
                }}
                title="Change language"
            >
                <Globe className="w-3.5 h-3.5" />
                <span>{langLabel}</span>
            </button>

            {open && (
                <div
                    className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50 min-w-[140px] animate-fade-in"
                    style={{
                        background: "rgba(17,27,20,0.98)",
                        backdropFilter: "blur(16px)",
                        border: "1px solid rgba(34,197,94,0.15)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    }}
                >
                    {LANG_OPTIONS.map(({ code, label, nativeName }) => (
                        <button
                            key={code}
                            onClick={() => { setLang(code as Lang); setOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-brand-900/30"
                            style={{
                                color: lang === code ? "#4ade80" : "#94a3b8",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                fontWeight: lang === code ? 600 : 400,
                            }}
                        >
                            <span>{nativeName}</span>
                            <span className="text-xs opacity-60 ml-3">{label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
