"use client";

import React, { useState, FormEvent } from "react";
import { useAgriTrace } from "@/hooks/useAgriTrace";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import { Vote, Plus, ThumbsUp, ThumbsDown, Clock, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

interface Proposal {
    id: string;
    description: string;
    votesFor: number;
    votesAgainst: number;
    deadline: Date;
    proposer: string;
    status: "active" | "passed" | "rejected";
}

// Demo proposals
const DEMO_PROPOSALS: Proposal[] = [
    {
        id: "1",
        description: "Mandate cold-chain storage for all mango batches traveling more than 500km.",
        votesFor: 142, votesAgainst: 38,
        deadline: new Date(Date.now() + 86400 * 2 * 1000),
        proposer: "0x742d...f44e", status: "active",
    },
    {
        id: "2",
        description: "Reduce minimum batch quantity from 100kg to 10kg to enable small farmers.",
        votesFor: 89, votesAgainst: 22,
        deadline: new Date(Date.now() + 86400 * 5 * 1000),
        proposer: "0x9aF1...Ef03", status: "active",
    },
    {
        id: "3",
        description: "Integrate Aadhaar-based farmer identity verification for increased supply chain trust.",
        votesFor: 210, votesAgainst: 95,
        deadline: new Date(Date.now() - 86400 * 2 * 1000),
        proposer: "0x3b4F...2b9D", status: "passed",
    },
];

export default function DAOPage() {
    const { isConnected } = useWeb3ModalAccount();
    const { createProposal } = useAgriTrace();
    const [proposals, setProposals] = useState<Proposal[]>(DEMO_PROPOSALS);
    const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
    const [showForm, setShowForm] = useState(false);
    const [desc, setDesc] = useState("");
    const [duration, setDuration] = useState("7");
    const [loading, setLoading] = useState(false);

    const handleVote = async (proposalId: string, inFavor: boolean) => {
        if (!isConnected) { toast.error("Connect wallet to vote"); return; }
        if (votedIds.has(proposalId)) { toast.error("Already voted on this proposal"); return; }

        const tid = toast.loading("Recording vote on-chain...");
        try {
            await new Promise(r => setTimeout(r, 1500));
            setVotedIds(prev => new Set([...prev, proposalId]));
            setProposals((prev: Proposal[]) =>
                prev.map((p: Proposal) =>
                    p.id === proposalId
                        ? { ...p, votesFor: p.votesFor + (inFavor ? 1 : 0), votesAgainst: p.votesAgainst + (inFavor ? 0 : 1) }
                        : p
                )
            );
            toast.success(inFavor ? "Voted For ✅" : "Voted Against ❌", { id: tid });
        } catch {
            toast.error("Vote failed", { id: tid });
        }
    };

    const handleCreateProposal = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isConnected) { toast.error("Connect wallet first"); return; }
        if (!desc.trim()) { toast.error("Description required"); return; }

        setLoading(true);
        const tid = toast.loading("Creating proposal on-chain...");
        try {
            await new Promise(r => setTimeout(r, 1500));
            const newProposal: Proposal = {
                id: String(proposals.length + 1),
                description: desc,
                votesFor: 0, votesAgainst: 0,
                deadline: new Date(Date.now() + Number(duration) * 86400 * 1000),
                proposer: "You",
                status: "active",
            };
            setProposals((prev: Proposal[]) => [newProposal, ...prev]);
            toast.success("Proposal created! 🗳️", { id: tid });
            setDesc(""); setShowForm(false);
        } catch {
            toast.error("Failed to create proposal", { id: tid });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8 animate-fade-in">
                <div>
                    <h1 className="section-title text-3xl">
                        <Vote className="inline w-7 h-7 text-brand-500 mr-2" />DAO Governance
                    </h1>
                    <p className="section-subtitle">NFT holders vote on supply chain standards and policies</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    <Plus className="w-4 h-4" /> New Proposal
                </button>
            </div>

            {/* Wallet warning */}
            {!isConnected && (
                <div className="glass-card p-4 flex items-center gap-3 mb-6 border-gold-800/50 animate-slide-up">
                    <AlertCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
                    <p className="text-sm text-slate-300">Connect your wallet and hold a batch NFT to vote or propose.</p>
                    <w3m-button size="sm" />
                </div>
            )}

            {/* Create proposal form */}
            {showForm && (
                <div className="glass-card p-6 mb-6 animate-slide-up">
                    <h3 className="font-bold text-white mb-4">Create New Proposal</h3>
                    <form onSubmit={handleCreateProposal} className="space-y-4">
                        <div>
                            <label className="field-label">Proposal Description</label>
                            <textarea className="input-field resize-none" rows={4} value={desc}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
                                placeholder="Describe the change you want the community to vote on..." required />
                        </div>
                        <div className="w-48">
                            <label className="field-label">Voting Duration (days)</label>
                            <select className="select-field" value={duration}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDuration(e.target.value)}>
                                {["1", "3", "7", "14", "30"].map(d => <option key={d} value={d}>{d} days</option>)}
                            </select>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Submit Proposal"}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8 animate-slide-up">
                {[
                    { label: "Active Proposals", value: proposals.filter(p => p.status === "active").length, icon: "🗳️" },
                    { label: "Proposals Passed", value: proposals.filter(p => p.status === "passed").length, icon: "✅" },
                    { label: "Total Participants", value: "1,247", icon: "👥" },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="stat-card animate-slide-up text-center">
                        <span className="text-2xl">{icon}</span>
                        <span className="text-2xl font-extrabold text-white">{value}</span>
                        <span className="text-xs text-slate-400">{label}</span>
                    </div>
                ))}
            </div>

            {/* Proposals list */}
            <div className="space-y-4">
                {proposals.map((proposal, i) => {
                    const total = proposal.votesFor + proposal.votesAgainst;
                    const forPct = total > 0 ? Math.round((proposal.votesFor / total) * 100) : 0;
                    const voted = votedIds.has(proposal.id);
                    const isActive = proposal.status === "active" && proposal.deadline > new Date();

                    return (
                        <div key={proposal.id}
                            className={`glass-card p-6 animate-slide-up ${voted ? "border-brand-800/60" : ""}`}
                            style={{ animationDelay: `${i * 60}ms` }}>
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`badge text-xs ${isActive ? "badge-green" :
                                                proposal.status === "passed" ? "badge-gold" : "badge-red"
                                            }`}>
                                            {isActive ? "⚡ Active" : proposal.status === "passed" ? "✅ Passed" : "❌ Rejected"}
                                        </span>
                                        {voted && <span className="badge-blue text-xs"><CheckCircle2 className="w-3 h-3" /> Voted</span>}
                                        <span className="text-xs text-slate-500">#{proposal.id}</span>
                                    </div>
                                    <p className="text-sm font-medium text-white leading-relaxed">{proposal.description}</p>
                                </div>
                            </div>

                            {/* Vote bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                    <span>For: {proposal.votesFor} votes ({forPct}%)</span>
                                    <span>Against: {proposal.votesAgainst} votes ({100 - forPct}%)</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-surface-border overflow-hidden">
                                    <div className="h-full bg-brand-500 rounded-full transition-all duration-500"
                                        style={{ width: `${forPct}%` }} />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    {isActive
                                        ? `Ends ${formatDistanceToNow(proposal.deadline, { addSuffix: true })}`
                                        : `Ended ${formatDistanceToNow(proposal.deadline, { addSuffix: true })}`}
                                    <span className="mx-1">·</span>
                                    By {proposal.proposer}
                                </div>

                                {isActive && !voted && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleVote(proposal.id, true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                 bg-brand-900/40 text-brand-400 border border-brand-800/50 hover:bg-brand-900/70 transition-colors">
                                            <ThumbsUp className="w-3.5 h-3.5" /> For
                                        </button>
                                        <button onClick={() => handleVote(proposal.id, false)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                 bg-red-900/30 text-red-400 border border-red-800/40 hover:bg-red-900/50 transition-colors">
                                            <ThumbsDown className="w-3.5 h-3.5" /> Against
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
