"use client";

import React, { useState, createContext, useContext, useEffect, ReactNode } from "react";
import { Phone, Loader2, CheckCircle2, X, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/* ── Farmer context ──────────────────────────────────────────────────── */
interface FarmerCtx {
    farmerAddress: string | null;
    farmerPhone: string | null;
    magicProvider: unknown | null;
    logoutFarmer: () => void;
    isLoggedIn: boolean;
}

const FarmerContext = createContext<FarmerCtx>({
    farmerAddress: null, farmerPhone: null,
    magicProvider: null, logoutFarmer: () => { }, isLoggedIn: false,
});

export const useFarmer = () => useContext(FarmerContext);

/* ── Provider ─────────────────────────────────────────────────────────── */
export function FarmerProvider({ children }: { children: ReactNode }) {
    const [farmerAddress, setFarmerAddress] = useState<string | null>(null);
    const [farmerPhone, setFarmerPhone] = useState<string | null>(null);
    const [magicProvider, setMagicProvider] = useState<unknown | null>(null);

    // Restore existing Magic session on mount
    useEffect(() => {
        (async () => {
            try {
                const { isMagicLoggedIn, getMagicUser, getMagicProvider } = await import("@/lib/magic");
                if (await isMagicLoggedIn()) {
                    const user = await getMagicUser();
                    setFarmerAddress(user.publicAddress ?? null);
                    setFarmerPhone(user.phoneNumber ?? null);
                    setMagicProvider(getMagicProvider());
                }
            } catch { /* not logged in */ }
        })();
    }, []);

    // Listen for successful login from the modal
    useEffect(() => {
        const handler = (e: Event) => {
            const { address, phone, provider } = (e as CustomEvent).detail ?? {};
            if (address) {
                setFarmerAddress(address);
                setFarmerPhone(phone ?? null);
                setMagicProvider(provider);
            }
        };
        window.addEventListener("magic-login", handler);
        return () => window.removeEventListener("magic-login", handler);
    }, []);

    const logoutFarmer = async () => {
        try {
            const { logoutMagic } = await import("@/lib/magic");
            await logoutMagic();
        } catch { }
        setFarmerAddress(null); setFarmerPhone(null); setMagicProvider(null);
    };

    return (
        <FarmerContext.Provider value={{ farmerAddress, farmerPhone, magicProvider, logoutFarmer, isLoggedIn: !!farmerAddress }}>
            {children}
        </FarmerContext.Provider>
    );
}

/* ── Login Modal ──────────────────────────────────────────────────────── */
interface Props { onClose: () => void; }

type Step = "phone" | "waiting" | "success" | "error";

export default function FarmerLogin({ onClose }: Props) {
    const { t } = useI18n();
    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("");
    const [errMsg, setErrMsg] = useState("");

    const handleLogin = async () => {
        if (phone.length < 10) { setErrMsg("Enter a valid 10-digit mobile number"); return; }
        setErrMsg(""); setStep("waiting");

        try {
            const { loginWithPhone, getMagicUser, getMagicProvider } = await import("@/lib/magic");

            // Magic's loginWithSmsOtp (v33) shows its OWN iframe for OTP entry.
            // We just await the result — no custom OTP UI needed.
            await loginWithPhone(phone);

            const user = await getMagicUser();
            const provider = getMagicProvider();

            window.dispatchEvent(new CustomEvent("magic-login", {
                detail: { address: user.publicAddress, phone, provider }
            }));

            setStep("success");
            setTimeout(onClose, 1600);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Login failed. Check if SMS is enabled in your Magic dashboard.";
            setErrMsg(msg);
            setStep("error");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
            <div className="glass-card w-full max-w-sm p-6 relative animate-slide-up">

                {/* Close */}
                <button onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/5">
                    <X className="w-4 h-4" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
                        <Phone className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{t("login.title")}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{t("login.subtitle")}</p>
                    </div>
                </div>

                {/* Gasless badge */}
                <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    <span className="text-xs text-brand-400">⚡ {t("badges.gasless")}</span>
                    <span className="text-xs text-slate-500 ml-1">— No gas fees ever</span>
                </div>

                {/* Step: Phone input */}
                {(step === "phone" || step === "error") && (
                    <div className="space-y-3">
                        <label className="field-label">📱 Mobile Number</label>
                        <div className="flex gap-2">
                            <div className="flex items-center px-3 rounded-xl text-sm text-slate-400 font-mono flex-shrink-0"
                                style={{ background: "rgba(17,27,20,0.8)", border: "1px solid rgba(34,197,94,0.15)" }}>
                                +91
                            </div>
                            <input
                                className="input-field flex-1"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="9876543210"
                                value={phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value.replace(/\D/g, ""))}
                                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleLogin()}
                            />
                        </div>
                        {errMsg && (
                            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-900/20 border border-red-800/40">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-400">{errMsg}</p>
                            </div>
                        )}
                        <button onClick={handleLogin} className="btn-primary w-full justify-center py-3">
                            {t("login.sendOtp")}
                        </button>
                        <p className="text-xs text-center text-slate-600 mt-2">{t("login.disclaimer")}</p>
                    </div>
                )}

                {/* Step: Waiting — Magic handles OTP in its own iframe popup */}
                {step === "waiting" && (
                    <div className="text-center py-6 space-y-3">
                        <Loader2 className="w-10 h-10 text-brand-400 mx-auto animate-spin" />
                        <p className="font-semibold text-white">OTP sent to +91 {phone}</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Enter the OTP in the popup window from Magic. <br />
                            Don't close this tab.
                        </p>
                        <button onClick={() => setStep("phone")} className="btn-ghost text-xs">
                            ← Change number
                        </button>
                    </div>
                )}

                {/* Step: Success */}
                {step === "success" && (
                    <div className="text-center py-4 space-y-2">
                        <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto" />
                        <p className="font-bold text-white text-lg">{t("login.success")}</p>
                        <p className="text-xs text-slate-400">Wallet created. No seed phrase needed.</p>
                    </div>
                )}

                {/* Divider */}
                <div className="mt-5 pt-4 flex items-center gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <span className="text-xs text-slate-600">{t("login.orUseWallet")}</span>
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>
            </div>
        </div>
    );
}
