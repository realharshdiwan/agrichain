"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import { useAgriTrace } from "@/hooks/useAgriTrace";
import { uploadJSONToIPFS, uploadFileToIPFS } from "@/lib/ipfs";
import { BATCH_STATUS_LABELS } from "@/lib/contract";
import toast from "react-hot-toast";
import {
    Plus, RefreshCcw, ArrowRightLeft, Leaf, Package2,
    CheckCircle2, AlertCircle, Loader2, Upload, Info,
} from "lucide-react";

const CROPS = ["Cashew", "Tomato", "Onion", "Potato", "Mango", "Banana", "Wheat", "Rice"];

// ── Create Batch Form ──────────────────────────────────────────────────────────
function CreateBatchForm({ onSuccess }: { onSuccess: (id: string) => void }) {
    const { createBatch, isConnected } = useAgriTrace();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        cropType: "Cashew", origin: "Nashik, Maharashtra",
        quantityKg: 500, moisturePercent: 15, gradeScore: 8,
        certifications: "FSSAI", pesticidesUsed: false,
    });

    const update = (k: string, v: unknown) => setForm((prev: typeof form) => ({ ...prev, [k]: v }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isConnected) { toast.error("Connect your wallet first"); return; }

        setLoading(true);
        const tid = toast.loading("Uploading to IPFS...");
        try {
            let ipfsHash = "";

            // Upload image if provided
            if (imageFile) {
                ipfsHash = await uploadFileToIPFS(imageFile);
            } else {
                // Upload metadata JSON
                ipfsHash = await uploadJSONToIPFS({
                    ...form,
                    harvestDate: new Date().toISOString(),
                    type: "AgriChain Batch Metadata",
                    version: "1.0",
                }, `batch-${form.cropType}-${Date.now()}`);
            }

            toast.loading("Minting NFT on Polygon...", { id: tid });
            const tokenId = await createBatch({
                ...form,
                quantityKg: Number(form.quantityKg),
                moisturePercent: Number(form.moisturePercent),
                gradeScore: Number(form.gradeScore),
                ipfsHash,
            });

            toast.success(`Batch #${tokenId} minted successfully! 🎉`, { id: tid });
            onSuccess(tokenId);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Transaction failed";
            toast.error(msg.includes("user rejected") ? "Transaction rejected" : "Failed to create batch", { id: tid });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="field-label">Crop Type</label>
                    <select className="select-field" value={form.cropType} onChange={(e: ChangeEvent<HTMLSelectElement>) => update("cropType", e.target.value)}>
                        {CROPS.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="field-label">Origin Location</label>
                    <input className="input-field" value={form.origin} onChange={e => update("origin", e.target.value)}
                        placeholder="e.g. Nashik, Maharashtra" required />
                </div>
                <div>
                    <label className="field-label">Quantity (kg)</label>
                    <input className="input-field" type="number" min="1" value={form.quantityKg}
                        onChange={e => update("quantityKg", e.target.value)} required />
                </div>
                <div>
                    <label className="field-label">Moisture % (0–100)</label>
                    <input className="input-field" type="number" min="0" max="100" value={form.moisturePercent}
                        onChange={e => update("moisturePercent", e.target.value)} required />
                </div>
                <div>
                    <label className="field-label">Grade Score (1–10)</label>
                    <input className="input-field" type="number" min="1" max="10" value={form.gradeScore}
                        onChange={e => update("gradeScore", e.target.value)} required />
                </div>
                <div>
                    <label className="field-label">Certifications</label>
                    <input className="input-field" value={form.certifications}
                        onChange={e => update("certifications", e.target.value)}
                        placeholder="e.g. FSSAI, Organic" />
                </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-light border border-surface-border">
                <input type="checkbox" id="pesticides" checked={form.pesticidesUsed}
                    onChange={e => update("pesticidesUsed", e.target.checked)}
                    className="w-4 h-4 accent-brand-500" />
                <label htmlFor="pesticides" className="text-sm text-slate-300 cursor-pointer">
                    Pesticides / chemicals used in cultivation
                </label>
            </div>

            <div>
                <label className="field-label">Batch Document / Image (optional)</label>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-light border border-dashed border-surface-border cursor-pointer hover:border-brand-600 transition-colors">
                    <Upload className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-400">{imageFile ? imageFile.name : "Click to upload certificate or photo"}</span>
                    <input type="file" className="hidden" accept="image/*,.pdf"
                        onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    : <><Plus className="w-4 h-4" /> Mint Batch NFT</>}
            </button>
        </form>
    );
}

// ── Add Update Form ────────────────────────────────────────────────────────────
function AddUpdateForm() {
    const { addUpdate, isConnected } = useAgriTrace();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        tokenId: "", status: "1", location: "", notes: "",
    });

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isConnected) { toast.error("Connect wallet first"); return; }
        if (!form.tokenId) { toast.error("Token ID required"); return; }

        setLoading(true);
        const tid = toast.loading("Recording update on blockchain...");
        try {
            await addUpdate(form.tokenId, Number(form.status), form.location, form.notes, "");
            toast.success("Supply chain update recorded! ✅", { id: tid });
            setForm((prev: typeof form) => ({ ...prev, location: "", notes: "" }));
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "";
            toast.error(msg.includes("user rejected") ? "Rejected" : "Update failed", { id: tid });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="field-label">Batch Token ID</label>
                    <input className="input-field" value={form.tokenId}
                        onChange={e => setForm(p => ({ ...p, tokenId: e.target.value }))}
                        placeholder="e.g. 1" required />
                </div>
                <div>
                    <label className="field-label">New Status</label>
                    <select className="select-field" value={form.status}
                        onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                        {Object.entries(BATCH_STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="field-label">Current Location</label>
                    <input className="input-field" value={form.location}
                        onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                        placeholder="e.g. Pune Cold Storage, Maharashtra" required />
                </div>
                <div className="sm:col-span-2">
                    <label className="field-label">Notes</label>
                    <textarea className="input-field resize-none" rows={3} value={form.notes}
                        onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Optional: quality observations, temperature, concerns..." />
                </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Recording...</>
                    : <><RefreshCcw className="w-4 h-4" /> Add Update</>}
            </button>
        </form>
    );
}

// ── Transfer Ownership Form ────────────────────────────────────────────────────
function TransferForm() {
    const { transferOwnership, isConnected } = useAgriTrace();
    const [loading, setLoading] = useState(false);
    const [tokenId, setTokenId] = useState("");
    const [newOwner, setNewOwner] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isConnected) { toast.error("Connect wallet first"); return; }
        if (!tokenId || !newOwner) { toast.error("All fields required"); return; }

        setLoading(true);
        const tid = toast.loading("Transferring ownership...");
        try {
            await transferOwnership(tokenId, newOwner);
            toast.success("Ownership transferred! 🔁", { id: tid });
            setTokenId(""); setNewOwner("");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "";
            toast.error(msg.includes("user rejected") ? "Rejected" : "Transfer failed", { id: tid });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="field-label">Batch Token ID</label>
                <input className="input-field" value={tokenId}
                    onChange={e => setTokenId(e.target.value)} placeholder="e.g. 1" required />
            </div>
            <div>
                <label className="field-label">New Owner Address</label>
                <input className="input-field font-mono text-xs" value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                    placeholder="0x..." required />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-gold-900/20 border border-gold-800/40">
                <Info className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gold-300">
                    This will transfer the NFT to the new owner. They will be able to add updates and transfer further.
                </p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Transferring...</>
                    : <><ArrowRightLeft className="w-4 h-4" /> Transfer Ownership</>}
            </button>
        </form>
    );
}

// ── Main Dashboard Page ────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { isConnected, address } = useWeb3ModalAccount();
    const [activeTab, setActiveTab] = useState<"create" | "update" | "transfer">("create");
    const [lastMinted, setLastMinted] = useState<string | null>(null);

    const TABS = [
        { key: "create", label: "Create Batch", icon: Plus },
        { key: "update", label: "Add Update", icon: RefreshCcw },
        { key: "transfer", label: "Transfer", icon: ArrowRightLeft },
    ] as const;

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
                <h1 className="section-title text-3xl">
                    <Leaf className="inline w-7 h-7 text-brand-500 mr-2" />
                    Dashboard
                </h1>
                <p className="section-subtitle">Manage your agricultural produce batches on-chain</p>
            </div>

            {/* Wallet status */}
            {!isConnected ? (
                <div className="glass-card p-8 text-center mb-8 animate-slide-up">
                    <AlertCircle className="w-12 h-12 text-gold-400 mx-auto mb-4" />
                    <h3 className="font-bold text-white text-lg mb-2">Connect Your Wallet</h3>
                    <p className="text-slate-400 mb-6">Connect your MetaMask or WalletConnect to start tracing produce.</p>
                    <w3m-button />
                </div>
            ) : (
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-brand-900/30 border border-brand-800/50 mb-6 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                    <span className="text-sm text-brand-300 font-mono truncate">{address}</span>
                    <span className="badge-green ml-auto text-xs">Connected</span>
                </div>
            )}

            {/* Success card */}
            {lastMinted && (
                <div className="glass-card p-5 mb-6 border-brand-800/50 animate-slide-up">
                    <div className="flex items-start gap-3">
                        <Package2 className="w-6 h-6 text-brand-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-white">Batch #{lastMinted} minted!</p>
                            <p className="text-sm text-slate-400 mt-0.5">
                                Your NFT is live on Polygon Mumbai.{" "}
                                <a href={`/trace/${lastMinted}`} className="text-brand-400 hover:underline">View trace →</a>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab panel */}
            <div className="glass-card p-1 flex gap-1 mb-6 animate-slide-up">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all
              ${activeTab === key
                                ? "bg-brand-600 text-white shadow-glow-green"
                                : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {/* Form area */}
            <div className="glass-card p-6 animate-slide-up">
                {activeTab === "create" && <CreateBatchForm onSuccess={setLastMinted} />}
                {activeTab === "update" && <AddUpdateForm />}
                {activeTab === "transfer" && <TransferForm />}
            </div>
        </div>
    );
}
