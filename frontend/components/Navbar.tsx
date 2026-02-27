"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Leaf, LayoutDashboard, Search, Vote, Phone, LogOut } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useFarmer } from "@/components/FarmerLogin";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import dynamic from "next/dynamic";

// Load FarmerLogin modal dynamically (client-side only)
const FarmerLoginModal = dynamic(() => import("@/components/FarmerLogin"), { ssr: false });

export default function Navbar() {
    const pathname = usePathname();
    const { t } = useI18n();
    const { isLoggedIn, farmerPhone, farmerAddress, logoutFarmer } = useFarmer();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showFarmerMenu, setShowFarmerMenu] = useState(false);

    const NAV_ITEMS = [
        { href: "/", label: t("nav.home"), icon: Leaf },
        { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
        { href: "/trace", label: t("nav.trace"), icon: Search },
        { href: "/dao", label: t("nav.dao"), icon: Vote },
    ];

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    // Listen for Magic login events from FarmerLogin modal
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.address) setShowLogin(false);
        };
        window.addEventListener("magic-login", handler);
        return () => window.removeEventListener("magic-login", handler);
    }, []);

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 h-16 transition-all duration-500"
                style={{
                    background: scrolled ? "rgba(10,15,13,0.95)" : "rgba(10,15,13,0.4)",
                    backdropFilter: scrolled ? "blur(24px)" : "blur(8px)",
                    borderBottom: scrolled ? "1px solid rgba(34,197,94,0.12)" : "1px solid transparent",
                    boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
                }}>
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.3),rgba(34,197,94,0.1))", border: "1px solid rgba(34,197,94,0.4)", boxShadow: "0 0 16px rgba(34,197,94,0.2)" }}>
                            <Leaf className="w-4 h-4 text-brand-400" />
                        </div>
                        <span className="font-black text-lg gradient-text hidden sm:block">AgriChain</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
                        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                            <Link key={href} href={href}
                                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${pathname === href ? "text-brand-400" : "text-slate-400 hover:text-white"}`}>
                                <span className={`absolute inset-0 rounded-lg transition-all duration-200 ${pathname === href ? "bg-brand-900/40 border border-brand-800/40" : "bg-transparent group-hover:bg-white/5"
                                    }`} />
                                <Icon className="w-3.5 h-3.5 relative z-10" />
                                <span className="relative z-10">{label}</span>
                                {pathname === href && <span className="absolute bottom-0.5 left-4 right-4 h-px bg-brand-500 rounded-full" />}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side: lang + farmer login + wallet */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Language switcher */}
                        <LanguageSwitcher />

                        {/* Farmer login / logout */}
                        {isLoggedIn ? (
                            <div className="relative">
                                <button onClick={() => setShowFarmerMenu(!showFarmerMenu)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                                    <span className="hidden sm:inline">{farmerPhone ? `+91 ${farmerPhone}` : farmerAddress?.slice(0, 8) + "..."}</span>
                                    <span className="sm:hidden">📱</span>
                                </button>
                                {showFarmerMenu && (
                                    <div className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50 min-w-[180px]"
                                        style={{ background: "rgba(17,27,20,0.98)", border: "1px solid rgba(34,197,94,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                                        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                            <p className="text-xs text-slate-500">Logged in as</p>
                                            <p className="text-xs text-white font-mono mt-0.5">{farmerAddress?.slice(0, 18)}...</p>
                                        </div>
                                        <button onClick={() => { logoutFarmer(); setShowFarmerMenu(false); }}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors">
                                            <LogOut className="w-4 h-4" /> {t("nav.logout")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => setShowLogin(true)}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                                style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                                <Phone className="w-3.5 h-3.5" />
                                {t("nav.farmerLogin")}
                            </button>
                        )}

                        {/* WalletConnect */}
                        <w3m-button balance="hide" size="sm" />

                        {/* Mobile menu toggle */}
                        <button onClick={() => setOpen(!open)}
                            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                            style={{ background: "rgba(255,255,255,0.04)" }}>
                            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="md:hidden"
                        style={{ background: "rgba(10,15,13,0.98)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(34,197,94,0.1)" }}>
                        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                            <Link key={href} href={href} onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors
                    ${pathname === href ? "text-brand-400 bg-brand-900/20" : "text-slate-300 hover:text-white hover:bg-white/5"}`}
                                style={{ borderBottom: "1px solid rgba(34,197,94,0.06)" }}>
                                <Icon className="w-4 h-4" />
                                {label}
                                {pathname === href && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
                            </Link>
                        ))}
                        {/* Mobile farmer login */}
                        {!isLoggedIn && (
                            <button onClick={() => { setOpen(false); setShowLogin(true); }}
                                className="flex items-center gap-3 px-5 py-4 w-full text-sm font-medium text-gold-400"
                                style={{ borderBottom: "1px solid rgba(34,197,94,0.06)" }}>
                                <Phone className="w-4 h-4" /> {t("nav.farmerLogin")}
                            </button>
                        )}
                    </div>
                )}
            </header>

            {/* Farmer Login Modal */}
            {showLogin && <FarmerLoginModal onClose={() => setShowLogin(false)} />}
        </>
    );
}
