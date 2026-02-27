import { Magic } from "magic-sdk";

let magicClient: Magic | null = null;

export function getMagic(): Magic {
    if (typeof window === "undefined") throw new Error("Magic must be used client-side");
    if (!magicClient) {
        const key = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY;
        if (!key) throw new Error("NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY is not set");
        magicClient = new Magic(key, {
            network: {
                rpcUrl: "https://rpc-amoy.polygon.technology",
                chainId: 80002,
            },
        });
    }
    return magicClient;
}

/**
 * Login with phone SMS OTP — Magic v33+ event-based API.
 * Resolves with the DID token when verified.
 * Rejects if user cancels or verification fails.
 */
export function loginWithPhone(phone: string): Promise<string> {
    const magic = getMagic();
    const E164 = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

    return new Promise((resolve, reject) => {
        const handle = (magic.auth as any).loginWithSmsOtp({ phoneNumber: E164 });

        handle
            .on("verify-email-otp", () => {
                // Magic handles its own OTP prompt inside its iframe
                // This event fires when user needs to enter the OTP
                // Nothing to do here — Magic's iframe captures it
            })
            .on("done", (result: string) => resolve(result))
            .on("error", (err: Error) => reject(err))
            .on("settled", () => { }); // cleanup
    });
}

/** Get the logged-in user metadata. */
export async function getMagicUser() {
    const magic = getMagic();
    return await magic.user.getInfo();
}

/** Get an EIP-1193 provider from Magic for use with ethers. */
export function getMagicProvider() {
    const magic = getMagic();
    return magic.rpcProvider;
}

/** Logout the current Magic session. */
export async function logoutMagic() {
    const magic = getMagic();
    await magic.user.logout();
    magicClient = null; // reset singleton so re-login works
}

/** Check if a Magic session is currently active. */
export async function isMagicLoggedIn(): Promise<boolean> {
    try {
        const magic = getMagic();
        return await magic.user.isLoggedIn();
    } catch {
        return false;
    }
}
