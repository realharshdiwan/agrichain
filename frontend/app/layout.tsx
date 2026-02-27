import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Web3Provider from "@/components/Web3Provider";
import { I18nProvider } from "@/lib/i18n";
import { FarmerProvider } from "@/components/FarmerLogin";

export const metadata: Metadata = {
    title: "AgriChain — Blockchain Supply Chain Traceability",
    description: "Track your agricultural produce from farm to consumer with immutable blockchain records, AI-powered insights, and full transparency.",
    keywords: ["agrichain", "blockchain", "supply chain", "agriculture", "NFT", "traceability", "India"],
    openGraph: {
        title: "AgriChain",
        description: "Decentralized agricultural supply chain on Polygon",
        type: "website",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className="min-h-screen text-white antialiased" style={{ background: "var(--bg-primary)" }}>
                {/* I18nProvider must be outermost to provide translations to all components including Navbar */}
                <I18nProvider>
                    <Web3Provider>
                        {/* FarmerProvider gives Magic wallet context to entire app */}
                        <FarmerProvider>
                            <Navbar />
                            <main className="pt-16">
                                {children}
                            </main>
                            <Toaster
                                position="bottom-right"
                                toastOptions={{
                                    style: {
                                        background: "#162019",
                                        color: "#f1f5f9",
                                        border: "1px solid rgba(34,197,94,0.2)",
                                        borderRadius: "12px",
                                        fontSize: "14px",
                                    },
                                    success: { iconTheme: { primary: "#22c55e", secondary: "#052e16" } },
                                    error: { iconTheme: { primary: "#ef4444", secondary: "#162019" } },
                                }}
                            />
                        </FarmerProvider>
                    </Web3Provider>
                </I18nProvider>
            </body>
        </html>
    );
}
