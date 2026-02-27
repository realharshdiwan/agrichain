/**
 * IPFS upload via Pinata
 * Docs: https://docs.pinata.cloud/
 */

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "";
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

export interface PinataResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
}

/**
 * Upload a File to IPFS via Pinata.
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        // Return a mock hash in development
        console.warn("Pinata keys not set — using mock IPFS hash");
        return `Qm${Math.random().toString(36).substring(2, 48)}`;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
        "pinataMetadata",
        JSON.stringify({ name: `agrichain-${file.name}-${Date.now()}` })
    );
    formData.append(
        "pinataOptions",
        JSON.stringify({ cidVersion: 0 })
    );

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`IPFS upload failed: ${res.status} ${JSON.stringify(err)}`);
    }

    const data: PinataResponse = await res.json();
    return data.IpfsHash;
}

/**
 * Upload a JSON metadata object to IPFS via Pinata.
 */
export async function uploadJSONToIPFS(payload: Record<string, unknown>, name?: string): Promise<string> {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
        console.warn("Pinata keys not set — using mock IPFS hash");
        return `Qm${Math.random().toString(36).substring(2, 48)}`;
    }

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_KEY,
        },
        body: JSON.stringify({
            pinataContent: payload,
            pinataMetadata: { name: name || `agrichain-meta-${Date.now()}` },
            pinataOptions: { cidVersion: 0 },
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`IPFS JSON upload failed: ${res.status} ${JSON.stringify(err)}`);
    }

    const data: PinataResponse = await res.json();
    return data.IpfsHash;
}

/**
 * Convert an IPFS CID to a public gateway URL.
 */
export function ipfsToHttps(cid: string): string {
    if (!cid) return "";
    if (cid.startsWith("http")) return cid;
    const cleanCid = cid.replace("ipfs://", "");
    return `${PINATA_GATEWAY}${cleanCid}`;
}
