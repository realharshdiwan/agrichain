"use client";

import { useEffect, useState, useCallback } from "react";
import { useAgriTrace } from "@/hooks/useAgriTrace";
import { predictSpoilage, getWeather } from "@/lib/api";
import { BATCH_STATUS_LABELS, BATCH_STATUS_COLORS } from "@/lib/contract";
import { ipfsToHttps } from "@/lib/ipfs";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import {
    MapPin, Clock, User, Leaf, Thermometer, Droplets, Wind,
    Package2, AlertTriangle, CheckCircle2, XCircle, Loader2,
    ExternalLink, Copy, Share2, ChevronDown, ChevronUp
} from "lucide-react";
import toast from "react-hot-toast";

// ── Mock data for demo when contract not deployed ──────────────────────────────
const MOCK_BATCH = {
    tokenId: "1", farmer: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    cropType: "Cashew", origin: "Nashik, Maharashtra",
    harvestTimestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 5),
    quantityKg: 500,
    quality: { moisturePercent: 15, gradeScore: 8, certifications: "FSSAI, Organic", pesticidesUsed: false },
    ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    exists: true,
};

const MOCK_JOURNEY = [
    { updatedBy: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", status: 0, location: "Nashik, Maharashtra", notes: "Batch created and harvested", ipfsHash: "", timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 5) },
    { updatedBy: "0x9aF1Ca54c7d7B0bf2f7e1e7ACf1a923bFC0Ef03d", status: 1, location: "Shirdi Processing Unit, MH", notes: "Quality verified: Grade A cashews, moisture 15%", ipfsHash: "", timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 3) },
    { updatedBy: "0x3b4F2d8aC1e69b05E2F3f7a83bFaE57294Ad2b9D", status: 2, location: "Mumbai Distribution Hub", notes: "Loaded on refrigerated truck, ETA: 2 days", ipfsHash: "", timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 1) },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function truncateAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// ── Timeline Component ─────────────────────────────────────────────────────────
function TraceTimeline({ steps }: { steps: typeof MOCK_JOURNEY }) {
    return (
        <div className="relative space-y-0">
            {steps.map((step, i) => {
                const color = BATCH_STATUS_COLORS[Number(step.status)] || "#94a3b8";
                const label = BATCH_STATUS_LABELS[Number(step.status)] || "Unknown";
                const isLast = i === steps.length - 1;
                const ts = Number(step.timestamp) * 1000;

                return (
                    <div key={i} className="flex gap-4 pb-6 last:pb-0">
                        {/* Timeline spine */}
                        <div className="flex flex-col items-center">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                                style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            </div>
                            {!isLast && <div className="w-0.5 flex-1 mt-1 bg-surface-border" />}
                        </div>

                        {/* Content */}
                        <div className={`glass-card p-4 flex-1 mb-1 ${isLast ? "border-brand-800/50" : ""}`}>
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                <div>
                                    <span className="text-sm font-semibold text-white">{label}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-xs text-slate-400">{step.location}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-500">{format(ts, "dd MMM yyyy")}</div>
                                    <div className="text-xs text-slate-500">{format(ts, "HH:mm")}</div>
                                </div>
                            </div>
                            {step.notes && <p className="text-xs text-slate-300 mb-2">{step.notes}</p>}
                            <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-slate-500" />
                                <span className="text-xs font-mono text-slate-500">{truncateAddress(step.updatedBy)}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── AI Insights Panel ─────────────────────────────────────────────────────────
function AIInsightsPanel({ batch, journey }: { batch: typeof MOCK_BATCH; journey: typeof MOCK_JOURNEY }) {
    const [prediction, setPrediction] = useState<Awaited<ReturnType<typeof predictSpoilage>> | null>(null);
    const [weather, setWeather] = useState<Awaited<ReturnType<typeof getWeather>> | null>(null);
    const [loading, setLoading] = useState(true);
    const [showActions, setShowActions] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const transportDays = Math.ceil(
                    (Date.now() - Number(journey[0]?.timestamp || 0) * 1000) / 86_400_000
                );

                const [pred, wx] = await Promise.allSettled([
                    predictSpoilage({
                        crop_type: batch.cropType,
                        temperature: 28,
                        humidity: 72,
                        transport_days: transportDays || 3,
                        moisture_percent: Number(batch.quality.moisturePercent),
                    }),
                    getWeather({ city: batch.origin.split(",")[0].trim() }),
                ]);

                if (pred.status === "fulfilled") setPrediction(pred.value);
                if (wx.status === "fulfilled") setWeather(wx.value);
            } catch { /* silently fail */ }
            finally { setLoading(false); }
        })();
    }, [batch, journey]);

    if (loading) {
        return (
            <div className="glass-card p-6 flex items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                <span className="text-sm">Fetching AI insights...</span>
            </div>
        );
    }

    const riskColor = prediction?.recommendation.color || "#94a3b8";
    const riskLabel = prediction?.risk_label || "Unknown";

    return (
        <div className="space-y-4">
            {/* Risk score card */}
            {prediction && (
                <div className="glass-card p-5" style={{ borderColor: `${riskColor}30` }}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Spoilage Risk</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-extrabold" style={{ color: riskColor }}>
                                    {prediction.risk_percent.toFixed(0)}%
                                </span>
                                <span className="badge text-sm px-2.5 py-1 font-semibold"
                                    style={{ backgroundColor: `${riskColor}20`, color: riskColor, border: `1px solid ${riskColor}30` }}>
                                    {prediction.recommendation.icon} {riskLabel}
                                </span>
                            </div>
                        </div>
                        {riskLabel === "Low" && <CheckCircle2 className="w-9 h-9 text-brand-400" />}
                        {riskLabel === "Medium" && <AlertTriangle className="w-9 h-9 text-gold-400" />}
                        {riskLabel === "High" && <XCircle className="w-9 h-9 text-red-400" />}
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-surface-border rounded-full overflow-hidden mb-3">
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${prediction.risk_percent}%`, backgroundColor: riskColor }} />
                    </div>

                    <p className="text-sm text-slate-300 mb-3">{prediction.recommendation.message}</p>
                    <p className="text-xs text-slate-400">
                        ⏱ Estimated shelf life: <span className="text-white font-medium">{prediction.recommendation.estimated_shelf_life}</span>
                    </p>

                    {/* Actions toggle */}
                    <button onClick={() => setShowActions(!showActions)}
                        className="btn-ghost text-xs mt-3 text-slate-400 hover:text-white px-0">
                        Recommended Actions {showActions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {showActions && (
                        <ul className="mt-2 space-y-1.5">
                            {prediction.recommendation.actions.map((a, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                    <span className="text-brand-400 mt-0.5">→</span> {a}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Weather card */}
            {weather && (
                <div className="glass-card p-5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Live Weather — {weather.location}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="flex flex-col gap-0.5">
                            <Thermometer className="w-4 h-4 text-orange-400" />
                            <span className="font-bold text-white">{weather.temperature}°C</span>
                            <span className="text-xs text-slate-400">Temperature</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <Droplets className="w-4 h-4 text-blue-400" />
                            <span className="font-bold text-white">{weather.humidity}%</span>
                            <span className="text-xs text-slate-400">Humidity</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <Wind className="w-4 h-4 text-slate-400" />
                            <span className="font-bold text-white">{weather.wind_speed} m/s</span>
                            <span className="text-xs text-slate-400">Wind</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-lg">🌤</span>
                            <span className="font-bold text-white text-sm">{weather.weather}</span>
                            <span className="text-xs text-slate-400">Condition</span>
                        </div>
                    </div>

                    {weather.agri_alerts.length > 0 && (
                        <div className="mt-4 space-y-1.5">
                            {weather.agri_alerts.map((alert, i) => (
                                <div key={i} className="flex gap-2 p-2 rounded-lg bg-gold-900/20 border border-gold-800/30">
                                    <AlertTriangle className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs text-gold-300">{alert}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Trace Detail Page ─────────────────────────────────────────────────────
export default function TraceBatchPage({ params }: { params: { tokenId: string } }) {
    const { tokenId } = params;
    const { getBatch, getBatchJourney } = useAgriTrace();
    const [batch, setBatch] = useState<typeof MOCK_BATCH | null>(null);
    const [journey, setJourney] = useState<typeof MOCK_JOURNEY>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showQR, setShowQR] = useState(false);

    const traceUrl = typeof window !== "undefined"
        ? `${window.location.origin}/trace/${tokenId}`
        : `/trace/${tokenId}`;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [b, j] = await Promise.all([getBatch(tokenId), getBatchJourney(tokenId)]);
            setBatch(b);
            setJourney(j);
        } catch {
            // Fallback to mock data for demo
            setBatch(MOCK_BATCH);
            setJourney(MOCK_JOURNEY);
        }
        setLoading(false);
    }, [tokenId, getBatch, getBatchJourney]);

    useEffect(() => { load(); }, [load]);

    const copyUrl = () => {
        navigator.clipboard.writeText(traceUrl);
        toast.success("URL copied!");
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-400" />
                <p className="text-slate-400 text-sm">Loading batch #{tokenId}...</p>
            </div>
        </div>
    );

    if (!batch) return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="glass-card p-8 text-center max-w-md">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="font-bold text-white text-xl mb-2">Batch Not Found</h2>
                <p className="text-slate-400">Token #{tokenId} doesn&apos;t exist on-chain.</p>
            </div>
        </div>
    );

    const harvestDate = new Date(Number(batch.harvestTimestamp) * 1000);
    const currentStep = journey[journey.length - 1];
    const currentStatus = Number(currentStep?.status ?? 0);

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8 animate-fade-in">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{batch.cropType === "Cashew" ? "🥜" : "🌿"}</span>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                                {batch.cropType} Batch #{tokenId}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-sm text-slate-400">{batch.origin}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="badge-green">{BATCH_STATUS_LABELS[currentStatus]}</span>
                        <span className="badge-blue">
                            <Clock className="w-3 h-3" />
                            {format(harvestDate, "dd MMM yyyy")}
                        </span>
                        <span className="badge-slate">
                            <Package2 className="w-3 h-3" />
                            {batch.quantityKg} kg
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={copyUrl} className="btn-secondary text-xs gap-1.5">
                        <Copy className="w-3.5 h-3.5" /> Copy URL
                    </button>
                    <button onClick={() => setShowQR(!showQR)} className="btn-secondary text-xs gap-1.5">
                        <Share2 className="w-3.5 h-3.5" /> QR Code
                    </button>
                    <a href={`https://mumbai.polygonscan.com/token/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}?a=${tokenId}`}
                        target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>

            {/* QR Code panel */}
            {showQR && (
                <div className="glass-card p-6 mb-6 flex flex-col sm:flex-row items-center gap-6 animate-slide-up">
                    <QRCodeSVG value={traceUrl} size={140} bgColor="transparent" fgColor="#22c55e"
                        level="H" includeMargin={false}
                        imageSettings={{ src: "/favicon.ico", height: 24, width: 24, excavate: true }} />
                    <div>
                        <p className="font-semibold text-white mb-1">Scan to trace</p>
                        <p className="text-sm text-slate-400 mb-3">
                            Consumers can scan this QR code to view the complete supply chain journey.
                        </p>
                        <p className="text-xs font-mono text-slate-500 break-all">{traceUrl}</p>
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
                {/* Left column */}
                <div className="space-y-6">
                    {/* Batch details card */}
                    <div className="glass-card p-6 animate-slide-up">
                        <h2 className="section-title text-lg mb-4">
                            <Leaf className="inline w-5 h-5 text-brand-500 mr-2" />Batch Details
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                { label: "Farmer Address", value: truncateAddress(batch.farmer), mono: true },
                                { label: "Harvest Date", value: format(harvestDate, "dd MMM yyyy, HH:mm") },
                                { label: "Quantity", value: `${batch.quantityKg} kg` },
                                { label: "Moisture", value: `${batch.quality.moisturePercent}%` },
                                { label: "Grade Score", value: `${batch.quality.gradeScore}/10` },
                                { label: "Pesticides", value: batch.quality.pesticidesUsed ? "Yes" : "No" },
                                { label: "Certifications", value: batch.quality.certifications || "None" },
                                { label: "IPFS Document", value: "View →", link: ipfsToHttps(batch.ipfsHash) },
                            ].map(({ label, value, mono, link }) => (
                                <div key={label} className="px-3.5 py-3 rounded-xl bg-surface-light">
                                    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                                    {link
                                        ? <a href={link} target="_blank" rel="noopener noreferrer"
                                            className={`text-sm font-medium text-brand-400 hover:underline ${mono ? "font-mono" : ""}`}>{value}</a>
                                        : <p className={`text-sm font-medium text-white ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Journey timeline */}
                    <div className="glass-card p-6 animate-slide-up">
                        <h2 className="section-title text-lg mb-5">
                            Supply Chain Journey ({journey.length} steps)
                        </h2>
                        <TraceTimeline steps={journey} />
                    </div>
                </div>

                {/* Right column — AI Insights */}
                <div className="animate-slide-up">
                    <h2 className="section-title text-lg mb-4">
                        🤖 AI Quality Insights
                    </h2>
                    <AIInsightsPanel batch={batch} journey={journey} />
                </div>
            </div>
        </div>
    );
}
