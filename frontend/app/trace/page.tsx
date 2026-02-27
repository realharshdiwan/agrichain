"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TracePage() {
    const [tokenId, setTokenId] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (tokenId.trim()) router.push(`/trace/${tokenId.trim()}`);
    };

    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 flex flex-col items-center justify-center max-w-2xl mx-auto">
            <div className="text-center mb-10 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-brand-900/50 border border-brand-800/50 flex items-center justify-center mx-auto mb-5">
                    <Search className="w-8 h-8 text-brand-400" />
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-3">Trace a Batch</h1>
                <p className="text-slate-400">
                    Enter a Batch Token ID or scan a QR code to view the complete
                    farm-to-consumer journey with AI quality insights.
                </p>
            </div>

            <form onSubmit={handleSearch} className="w-full flex gap-3 animate-slide-up">
                <input
                    className="input-field flex-1 text-base"
                    value={tokenId}
                    onChange={e => setTokenId(e.target.value)}
                    placeholder="Enter Batch Token ID (e.g. 1)"
                    autoFocus
                />
                <button type="submit" className="btn-primary px-6">
                    <ArrowRight className="w-5 h-5" />
                </button>
            </form>

            {/* Quick demo links */}
            <div className="mt-8 w-full animate-slide-up">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Demo batches</p>
                <div className="flex flex-wrap gap-2">
                    {["1", "2", "3"].map(id => (
                        <a key={id} href={`/trace/${id}`}
                            className="badge-green cursor-pointer hover:bg-brand-900 transition-colors text-sm px-3 py-1.5">
                            🥜 Batch #{id} — Cashew
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
