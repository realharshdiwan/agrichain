"use client";

import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import { ReactNode } from "react";

const projectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "eb67ac2a-81c0-4c3f-959c-a6b6aa6ae3b3";

// ── Supported networks ──────────────────────────────────────────────────
const polygonAmoy = {
    chainId: 80002,
    name: "Polygon Amoy",
    currency: "MATIC",
    explorerUrl: "https://amoy.polygonscan.com",
    rpcUrl: "https://rpc-amoy.polygon.technology",
};

const polygonMumbai = {
    chainId: 80001,
    name: "Polygon Mumbai",
    currency: "MATIC",
    explorerUrl: "https://mumbai.polygonscan.com",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
};

const polygonMainnet = {
    chainId: 137,
    name: "Polygon",
    currency: "MATIC",
    explorerUrl: "https://polygonscan.com",
    rpcUrl: "https://polygon-rpc.com",
};

const ethereumMainnet = {
    chainId: 1,
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "https://cloudflare-eth.com",
};

const metadata = {
    name: "AgriChain",
    description: "Agricultural Supply Chain Traceability on Blockchain",
    url: typeof window !== "undefined" ? window.location.origin : "https://agrichain.vercel.app",
    icons: ["https://raw.githubusercontent.com/nicholasgasior/nextjs-tailwind/main/public/favicon.ico"],
};

const hardhat = {
    chainId: 31337,
    name: "Hardhat Local",
    currency: "ETH",
    explorerUrl: "",
    rpcUrl: "http://127.0.0.1:8545",
};

createWeb3Modal({
    ethersConfig: defaultConfig({
        metadata,
        defaultChainId: 31337,
        enableEIP6963: true,
        enableInjected: true,
        enableCoinbase: false,
        rpcUrl: "http://127.0.0.1:8545",
    }),
    chains: [hardhat, polygonAmoy, polygonMumbai, polygonMainnet, ethereumMainnet],
    projectId,
    defaultChain: hardhat,
    themeMode: "dark",
    themeVariables: {
        "--w3m-accent": "#22c55e",
        "--w3m-border-radius-master": "12px",
        "--w3m-color-mix": "#0a0f0d",
        "--w3m-color-mix-strength": 40,
    },
    // Don't restrict to specific wallets — let WalletConnect QR show + all injected wallets
    // featuredWalletIds intentionally omitted so WC QR appears alongside Brave Wallet
});

export default function Web3Provider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
