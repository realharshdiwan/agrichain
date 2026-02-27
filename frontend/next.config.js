/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: [
            "ipfs.io",
            "gateway.pinata.cloud",
            "cloudflare-ipfs.com",
            "openweathermap.org",
        ],
    },
    env: {
        NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
        NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY || "",
        NEXT_PUBLIC_PINATA_SECRET_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "",
        NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    },
};

module.exports = nextConfig;
