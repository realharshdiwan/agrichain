"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import {
    ArrowRight, Play, Search, Shield, Cpu, QrCode, Vote,
    Cloud, Leaf, ChevronRight, CheckCircle2, Zap,
    TrendingUp, Package, Truck, ShoppingBag,
} from "lucide-react";

// Load particle network client-side only (uses canvas API)
const ParticleNetwork = dynamic(() => import("@/components/ParticleNetwork"), { ssr: false });

/* ── Data ────────────────────────────────────────────────────────────── */
const FEATURES = [
    { icon: Shield, emoji: "🔗", title: "Immutable Audit Trail", color: "brand", desc: "Every step recorded on Polygon blockchain forever. Tamper-proof, transparent history from farm to shelf." },
    { icon: Cpu, emoji: "🤖", title: "AI Spoilage Prediction", color: "gold", desc: "ML model predicts risk from temperature, humidity & transit data. Get shelf life estimates instantly." },
    { icon: QrCode, emoji: "📱", title: "QR Traceability", color: "teal", desc: "Consumers scan a simple QR code to see the complete farm-to-fork journey of their purchase." },
    { icon: Vote, emoji: "🗳️", title: "DAO Governance", color: "purple", desc: "NFT holders vote on supply chain standards and policies. Decentralized, community-driven decisions." },
    { icon: Cloud, emoji: "🌿", title: "IPFS Decentralised Storage", color: "brand", desc: "Batch metadata and certifications stored on IPFS via Pinata. No central point of failure." },
    { icon: TrendingUp, emoji: "♻️", title: "Carbon Footprint Tracking", color: "gold", desc: "Monitor environmental impact per batch. Sustainable supply chains, measurable outcomes." },
];

const STEPS = [
    { num: "01", icon: Leaf, title: "Farmer Mints NFT Batch", desc: "Farmer logs crop details — type, origin, quantity, moisture, grade — and mints an ERC-721 NFT on Polygon." },
    { num: "02", icon: Truck, title: "Stakeholders Update On-Chain", desc: "Processors, cold-storage operators, and transporters add journey steps. Every update is immutable on-chain." },
    { num: "03", icon: ShoppingBag, title: "Consumer Scans QR", desc: "Retailer prints QR. Consumer scans to view the entire farm-to-shelf journey with AI quality score." },
];

const DEMO_STEPS = [
    { status: "Harvested", location: "Nashik, Maharashtra", time: "Dec 12, 2025  ·  6:30 AM", icon: "🌱", active: true },
    { status: "Cold Storage", location: "Pune Cold Storage Hub", time: "Dec 14, 2025  ·  2:15 PM", icon: "❄️", active: true },
    { status: "In Transit", location: "Mumbai → Bengaluru", time: "Dec 16, 2025  ·  11:00 PM", icon: "🚛", active: true },
    { status: "At Retailer", location: "Bengaluru, Karnataka", time: "Dec 19, 2025  ·  9:00 AM", icon: "🏪", active: false },
];

const STAKEHOLDERS = [
    {
        icon: "🌾", title: "Farmers",
        color: "brand",
        benefits: ["Mint NFT for each produce batch", "Upload certifications to IPFS", "Receive fair price visibility", "Access AI quality insights"],
    },
    {
        icon: "🏭", title: "Processors & Transporters",
        color: "gold",
        benefits: ["Log real-time location updates", "Add cold chain temperature data", "Transfer batch ownership on-chain", "Prove compliance automatically"],
    },
    {
        icon: "🛍️", title: "Consumers",
        color: "teal",
        benefits: ["Scan QR for full journey view", "See AI freshness score", "Verify organic certifications", "Trust every purchase"],
    },
];

const STATS = [
    { value: 12400, suffix: "+", label: "Batches Tokenized" },
    { value: 3200, suffix: "+", label: "Farmers Onboarded" },
    { value: 8, suffix: "", label: "Indian States" },
    { value: 99, suffix: ".8%", label: "Uptime" },
];

const PROPOSALS = [
    { title: "Mandate cold-chain for all mango batches > 500km", for: 78, against: 22 },
    { title: "Reduce minimum batch size from 100kg to 10kg", for: 62, against: 38 },
];


/* ── Component ───────────────────────────────────────────────────────── */
export default function LandingPage() {
    const [demoTokenId, setDemoTokenId] = useState("");

    return (
        <div className="relative overflow-x-hidden" style={{ background: "var(--bg-primary)" }}>

            {/* ═══ SECTION 1: HERO ════════════════════════════════════════════ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 overflow-hidden">
                {/* BG: particle network */}
                <div className="absolute inset-0 z-0">
                    <ParticleNetwork />
                </div>
                {/* BG: floating orbs */}
                <div className="orb orb-green animate-orb w-96 h-96 -top-24 -left-32" style={{ animationDelay: "0s" }} />
                <div className="orb orb-gold  animate-orb w-64 h-64 top-1/2 -right-20" style={{ animationDelay: "4s" }} />
                <div className="orb orb-teal  animate-orb w-72 h-72 bottom-0 left-1/3" style={{ animationDelay: "8s" }} />

                {/* BG: radial gradient vignette */}
                <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,15,13,0.85) 100%)" }} />

                <div className="relative z-10 max-w-5xl mx-auto">
                    {/* Chip */}
                    <ScrollReveal delay={0}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
                            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                            Live on Polygon Mumbai Testnet
                        </div>
                    </ScrollReveal>

                    {/* Headline */}
                    <ScrollReveal delay={100}>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
                            <span className="hero-gradient-text">India's Agriculture,</span>
                            <br />
                            <span className="text-white">On-Chain.</span>
                        </h1>
                    </ScrollReveal>

                    <ScrollReveal delay={200}>
                        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Immutable farm-to-fork traceability for India's agricultural supply chain — powered by Polygon blockchain, AI spoilage prediction, and decentralised IPFS storage.
                        </p>
                    </ScrollReveal>

                    {/* CTAs */}
                    <ScrollReveal delay={300}>
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                            <Link href="/trace" className="btn-primary pulse-ring text-base px-8 py-4">
                                Start Tracing <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/trace/1" className="btn-secondary text-base px-8 py-4">
                                <Play className="w-4 h-4" /> View Demo Batch
                            </Link>
                        </div>
                    </ScrollReveal>

                    {/* Floating NFT card */}
                    <ScrollReveal delay={400}>
                        <div className="relative mx-auto max-w-sm animate-float">
                            <div className="glass-card p-5 text-left">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                        style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.05))", border: "1px solid rgba(34,197,94,0.25)" }}>
                                        🥜
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-mono">Batch NFT #1</p>
                                        <p className="font-bold text-white text-sm">Cashew · Nashik, MH</p>
                                    </div>
                                    <span className="ml-auto badge-green">Verified ✓</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                    {[["500 kg", "Quantity"], ["8/10", "Grade"], ["15%", "Moisture"]].map(([v, l]) => (
                                        <div key={l} className="rounded-lg p-2" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)" }}>
                                            <p className="text-sm font-bold text-brand-400">{v}</p>
                                            <p className="text-xs text-slate-500">{l}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(34,197,94,0.1)" }}>
                                        <div className="h-full rounded-full bg-brand-500" style={{ width: "82%" }} />
                                    </div>
                                    <span className="text-xs text-brand-400 font-semibold">AI Risk: Low 🟢</span>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Stats row */}
                <div className="relative z-10 w-full max-w-3xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
                    {STATS.map(({ value, suffix, label }, i) => (
                        <ScrollReveal key={label} delay={i * 80}>
                            <div className="glass-card p-4 text-center">
                                <p className="text-2xl font-black text-white">
                                    <AnimatedCounter target={value} suffix={suffix} />
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-slate-600 text-xs animate-float">
                    <span>Scroll</span>
                    <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, rgba(34,197,94,0.5), transparent)" }} />
                </div>
            </section>

            {/* ═══ SECTION 2: HOW IT WORKS ════════════════════════════════════ */}
            <section className="relative py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">The Process</p>
                            <h2 className="text-4xl font-black text-white mb-3">How AgriChain Works</h2>
                            <p className="text-slate-400 max-w-xl mx-auto">Three simple steps. One immutable blockchain record.</p>
                        </div>
                    </ScrollReveal>

                    <div className="flex flex-col md:flex-row items-start gap-0 md:gap-0 relative">
                        {/* Connecting line (desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-px z-0"
                            style={{ background: "linear-gradient(to right, transparent, rgba(34,197,94,0.4) 20%, rgba(34,197,94,0.4) 80%, transparent)" }} />

                        {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
                            <ScrollReveal key={num} delay={i * 150} className="flex-1 flex flex-col items-center text-center px-6 relative z-10">
                                <div className="relative mb-6">
                                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2 mx-auto"
                                        style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.15),rgba(34,197,94,0.04))", border: "1px solid rgba(34,197,94,0.25)", boxShadow: "0 0 32px rgba(34,197,94,0.08)" }}>
                                        <Icon className="w-8 h-8 text-brand-400" />
                                    </div>
                                    {/* Number badge */}
                                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center shadow-lg">
                                        {i + 1}
                                    </div>
                                    {/* Animated pulse dot on connector */}
                                    {i < 2 && (
                                        <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-[150%]">
                                            <div className="w-2.5 h-2.5 rounded-full bg-brand-500" style={{ animation: "dotPulse 1.8s ease-in-out infinite", animationDelay: `${i * 0.6}s` }} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs font-black text-brand-500 tracking-widest mb-1">{num}</p>
                                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 3: FEATURES GRID ═══════════════════════════════════ */}
            <section className="relative py-24 px-4"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(17,27,20,0.6) 30%, rgba(17,27,20,0.6) 70%, transparent)" }}>
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-14">
                            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">Capabilities</p>
                            <h2 className="text-4xl font-black text-white mb-3">Everything You Need</h2>
                            <p className="text-slate-400 max-w-xl mx-auto">From minting batch NFTs to AI-driven quality insights — AgriChain handles the full supply chain lifecycle.</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FEATURES.map(({ emoji, title, desc }, i) => (
                            <ScrollReveal key={title} delay={i * 80}>
                                <div className="feature-card group h-full">
                                    <div className="feature-card-icon text-2xl group-hover:scale-110 transition-transform duration-300">
                                        {emoji}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white mb-2 text-base">{title}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                                    </div>
                                    <div className="mt-auto flex items-center gap-1 text-xs text-brand-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Learn more <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 4: LIVE TRACE DEMO ══════════════════════════════════ */}
            <section className="relative py-24 px-4">
                <div className="orb orb-green w-64 h-64 absolute left-0 top-1/2 -translate-y-1/2 animate-orb" style={{ animationDelay: "2s" }} />
                <div className="max-w-5xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">Try It Live</p>
                            <h2 className="text-4xl font-black text-white mb-3">Trace Any Batch</h2>
                            <p className="text-slate-400 max-w-xl mx-auto">Enter a batch token ID to see its full supply chain journey. Try Token #1 as a demo.</p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={100}>
                        <div className="flex gap-3 max-w-lg mx-auto mb-12">
                            <input className="input-field flex-1 text-base"
                                placeholder="Enter Batch Token ID (e.g. 1)"
                                value={demoTokenId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDemoTokenId(e.target.value)} />
                            <Link href={`/trace/${demoTokenId || 1}`} className="btn-primary px-6">
                                <Search className="w-4 h-4" />
                                Trace
                            </Link>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Journey timeline */}
                        <ScrollReveal delay={200} className="lg:col-span-3">
                            <div className="glass-card p-6">
                                <h4 className="font-bold text-white mb-5 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-brand-400" />
                                    Supply Chain Journey — Cashew Batch #1
                                </h4>
                                <div className="space-y-0">
                                    {DEMO_STEPS.map(({ status, location, time, icon, active }, i) => (
                                        <div key={status} className="flex gap-4 relative">
                                            {/* Connector line */}
                                            {i < DEMO_STEPS.length - 1 && (
                                                <div className="absolute left-[19px] top-10 bottom-0 w-px z-0"
                                                    style={{ background: active ? "linear-gradient(to bottom, rgba(34,197,94,0.4), rgba(34,197,94,0.15))" : "rgba(255,255,255,0.06)" }} />
                                            )}
                                            {/* Node */}
                                            <div className="relative z-10 flex-shrink-0">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${active
                                                        ? "border-brand-600/50 bg-brand-900/40"
                                                        : "border-surface-border bg-surface-light"
                                                    }`}>
                                                    {icon}
                                                </div>
                                            </div>
                                            {/* Content */}
                                            <div className={`pb-6 flex-1 ${i === DEMO_STEPS.length - 1 ? "pb-0" : ""}`}>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-sm font-semibold ${active ? "text-white" : "text-slate-500"}`}>{status}</span>
                                                    {active && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                                                </div>
                                                <p className="text-xs text-slate-500">{location}</p>
                                                <p className="text-xs text-slate-600 mt-0.5">{time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* AI Risk card */}
                        <ScrollReveal delay={300} className="lg:col-span-2 flex flex-col gap-5">
                            <div className="glass-card p-6 flex-1">
                                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-gold-400" /> AI Quality Score
                                </h4>
                                {/* Risk meter */}
                                <div className="relative w-32 h-32 mx-auto mb-4">
                                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                        <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="12" />
                                        <circle cx="60" cy="60" r="48" fill="none" stroke="#22c55e" strokeWidth="12"
                                            strokeDasharray="301.6" strokeDashoffset="54" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-white">82%</span>
                                        <span className="text-xs text-brand-400">Freshness</span>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {[["Risk Level", "Low 🟢"], ["Shelf Life", "14–18 days"], ["Temp", "22°C ✓"], ["Humidity", "68% ✓"]].map(([k, v]) => (
                                        <div key={k} className="flex justify-between">
                                            <span className="text-slate-400">{k}</span>
                                            <span className="text-white font-medium">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card p-5">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Recommendation</p>
                                <p className="text-sm text-slate-300 leading-relaxed">Maintain storage below 25°C. Consume within 16 days. No immediate quality risk detected.</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 5: STAKEHOLDERS ═════════════════════════════════════ */}
            <section className="relative py-24 px-4"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(17,27,20,0.5) 40%, rgba(17,27,20,0.5) 60%, transparent)" }}>
                <div className="max-w-5xl mx-auto">
                    <ScrollReveal>
                        <div className="text-center mb-14">
                            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">For Everyone</p>
                            <h2 className="text-4xl font-black text-white mb-3">Built for Every Stakeholder</h2>
                            <p className="text-slate-400 max-w-lg mx-auto">AgriChain empowers every participant in India's agri supply chain.</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STAKEHOLDERS.map(({ icon, title, benefits }, i) => (
                            <ScrollReveal key={title} delay={i * 100}>
                                <div className="glass-card p-6 h-full">
                                    <div className="text-3xl mb-3">{icon}</div>
                                    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
                                    <ul className="space-y-2.5">
                                        {benefits.map(b => (
                                            <li key={b} className="flex items-start gap-2 text-sm text-slate-400">
                                                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 6: TRUST BANNER ══════════════════════════════════════ */}
            <section className="relative py-20 px-4 overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(22,32,25,0.9) 0%, rgba(10,15,13,0.95) 100%)", borderTop: "1px solid rgba(34,197,94,0.08)", borderBottom: "1px solid rgba(34,197,94,0.08)" }}>
                <div className="orb orb-gold w-96 h-48 absolute top-0 right-0 animate-orb" style={{ animationDelay: "6s" }} />
                <div className="max-w-5xl mx-auto">
                    <ScrollReveal>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-14">
                            {STATS.map(({ value, suffix, label }, i) => (
                                <div key={label} className="flex flex-col items-center gap-1">
                                    <p className="text-4xl font-black gradient-text">
                                        <AnimatedCounter target={value} suffix={suffix} duration={2000} />
                                    </p>
                                    <p className="text-sm text-slate-400">{label}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>

                    {/* Powered by */}
                    <ScrollReveal delay={200}>
                        <p className="text-center text-xs text-slate-600 uppercase tracking-widest mb-6 font-semibold">Powered by</p>
                        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
                            {[
                                { name: "Polygon", color: "#8247e5" },
                                { name: "IPFS", color: "#65c2cb" },
                                { name: "Pinata", color: "#e8437e" },
                                { name: "OpenAI", color: "#74aa9c" },
                                { name: "Hardhat", color: "#f0c900" },
                            ].map(({ name, color }) => (
                                <div key={name} className="px-4 py-2 rounded-lg text-sm font-bold tracking-wide"
                                    style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                                    {name}
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ═══ SECTION 7: DAO TEASER ════════════════════════════════════════ */}
            <section className="relative py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <ScrollReveal direction="left">
                            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">Community Driven</p>
                            <h2 className="text-4xl font-black text-white mb-4">Govern the Future of AgriChain</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Every NFT batch holder is a member. Vote on supply chain standards, minimum quality requirements, and platform policies — entirely on-chain.
                            </p>
                            <Link href="/dao" className="btn-primary">
                                Join Governance <ArrowRight className="w-4 h-4" />
                            </Link>
                        </ScrollReveal>

                        <ScrollReveal direction="right" delay={100}>
                            <div className="glass-card p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-white">Active Proposals</h4>
                                    <span className="badge-green">⚡ Live</span>
                                </div>
                                {PROPOSALS.map(({ title, for: f, against }) => (
                                    <div key={title} className="p-4 rounded-xl" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
                                        <p className="text-sm text-slate-300 mb-3">{title}</p>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                            <span>For: {f}%</span><span>Against: {against}%</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                            <div className="h-full bg-brand-500 rounded-full transition-all duration-1000" style={{ width: `${f}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 8: CTA BANNER ═══════════════════════════════════════ */}
            <section className="relative py-24 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 z-0" style={{ background: "radial-gradient(ellipse at center, rgba(34,197,94,0.1) 0%, transparent 65%)" }} />
                <div className="relative z-10 max-w-3xl mx-auto">
                    <ScrollReveal>
                        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                            Ready to Trace Your{" "}
                            <span className="gradient-text">First Batch?</span>
                        </h2>
                        <p className="text-slate-400 text-lg mb-10">
                            Get started in minutes. Connect your wallet, mint a batch NFT, and put India's agriculture on-chain.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link href="/dashboard" className="btn-primary text-base px-10 py-4">
                                Open Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="https://github.com/realharshdiwan/agrichain" target="_blank" rel="noreferrer"
                                className="btn-secondary text-base px-10 py-4">
                                View on GitHub
                            </a>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ═══ FOOTER ══════════════════════════════════════════════════════ */}
            <footer className="relative border-t px-4 py-12"
                style={{ borderColor: "rgba(34,197,94,0.08)", background: "rgba(10,15,13,0.95)" }}>
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
                        {/* Brand */}
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                                    style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.05))", border: "1px solid rgba(34,197,94,0.3)" }}>
                                    🌾
                                </div>
                                <span className="font-black text-lg text-white">AgriChain</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">Farm to Fork, On-Chain. Immutable traceability for India's agricultural supply chain.</p>
                        </div>

                        {/* Nav links */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
                            {[
                                { title: "Product", links: ["Dashboard", "Trace", "DAO", "API"] },
                                { title: "Resources", links: ["Docs", "GitHub", "README"] },
                                { title: "Network", links: ["Polygon Mumbai", "IPFS Gateway", "Pinata"] },
                            ].map(({ title, links }) => (
                                <div key={title}>
                                    <p className="font-semibold text-slate-300 mb-3">{title}</p>
                                    <ul className="space-y-2">
                                        {links.map(l => (
                                            <li key={l}>
                                                <span className="text-slate-500 hover:text-brand-400 cursor-pointer transition-colors">{l}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
                        style={{ borderTop: "1px solid rgba(34,197,94,0.06)" }}>
                        <p className="text-xs text-slate-600">© 2026 AgriChain. MIT License.</p>
                        <div className="flex items-center gap-2 text-xs"
                            style={{ background: "rgba(130,71,229,0.08)", border: "1px solid rgba(130,71,229,0.2)", color: "#a78bfa", borderRadius: "20px", padding: "4px 12px" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            Built on Polygon Mumbai Testnet
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
