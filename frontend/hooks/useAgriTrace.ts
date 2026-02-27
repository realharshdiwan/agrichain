"use client";

import { useState, useCallback } from "react";
import { useWeb3ModalProvider, useWeb3ModalAccount } from "@web3modal/ethers/react";
import { BrowserProvider, Contract } from "ethers";
import { AGRITRACE_ABI, CONTRACT_ADDRESS } from "@/lib/contract";
import toast from "react-hot-toast";

export function useAgriTrace() {
    const { walletProvider } = useWeb3ModalProvider();
    const { address, isConnected } = useWeb3ModalAccount();

    const getContract = useCallback(async (readonly = false) => {
        if (!walletProvider) throw new Error("No wallet connected");
        const ethersProvider = new BrowserProvider(walletProvider);
        if (readonly) return new Contract(CONTRACT_ADDRESS, AGRITRACE_ABI, ethersProvider);
        const signer = await ethersProvider.getSigner();
        return new Contract(CONTRACT_ADDRESS, AGRITRACE_ABI, signer);
    }, [walletProvider]);

    const createBatch = useCallback(async (params: {
        cropType: string;
        origin: string;
        quantityKg: number;
        moisturePercent: number;
        gradeScore: number;
        certifications: string;
        pesticidesUsed: boolean;
        ipfsHash: string;
    }) => {
        const contract = await getContract();
        const tx = await contract.createBatch(
            params.cropType,
            params.origin,
            params.quantityKg,
            params.moisturePercent,
            params.gradeScore,
            params.certifications,
            params.pesticidesUsed,
            params.ipfsHash
        );
        const receipt = await tx.wait();
        // Parse BatchCreated event to extract tokenId
        const event = receipt.logs
            .map((log: { topics: string[], data: string }) => {
                try { return contract.interface.parseLog(log); } catch { return null; }
            })
            .find((e: { name: string } | null) => e?.name === "BatchCreated");
        return event?.args?.tokenId?.toString() || null;
    }, [getContract]);

    const addUpdate = useCallback(async (
        tokenId: string,
        status: number,
        location: string,
        notes: string,
        ipfsHash: string
    ) => {
        const contract = await getContract();
        const tx = await contract.addUpdate(tokenId, status, location, notes, ipfsHash);
        return tx.wait();
    }, [getContract]);

    const transferOwnership = useCallback(async (tokenId: string, newOwner: string) => {
        const contract = await getContract();
        const tx = await contract.transferBatchOwnership(tokenId, newOwner);
        return tx.wait();
    }, [getContract]);

    const getBatch = useCallback(async (tokenId: string) => {
        const contract = await getContract(true);
        return contract.getBatch(tokenId);
    }, [getContract]);

    const getBatchJourney = useCallback(async (tokenId: string) => {
        const contract = await getContract(true);
        return contract.getBatchJourney(tokenId);
    }, [getContract]);

    const totalBatches = useCallback(async () => {
        const contract = await getContract(true);
        return Number(await contract.totalBatches());
    }, [getContract]);

    const createProposal = useCallback(async (description: string, durationSeconds: number) => {
        const contract = await getContract();
        const tx = await contract.createProposal(description, durationSeconds);
        return tx.wait();
    }, [getContract]);

    const vote = useCallback(async (proposalId: string, inFavor: boolean) => {
        const contract = await getContract();
        const tx = await contract.vote(proposalId, inFavor);
        return tx.wait();
    }, [getContract]);

    return {
        address,
        isConnected,
        createBatch,
        addUpdate,
        transferOwnership,
        getBatch,
        getBatchJourney,
        totalBatches,
        createProposal,
        vote,
    };
}
