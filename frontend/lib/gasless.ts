/**
 * Biconomy ERC-4337 gasless transaction helper.
 *
 * How it works:
 *  1. Wraps the user's provider (Magic or MetaMask) in a Biconomy Smart Account
 *  2. Routes the transaction through the Biconomy Paymaster which sponsors gas
 *  3. Falls back to a normal transaction if Biconomy is not configured
 */

import { ethers } from "ethers";

const PAYMASTER_URL = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL || "";
const BUNDLER_URL = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_BICONOMY_API_KEY || "";

export const gaslessAvailable = !!(PAYMASTER_URL && BUNDLER_URL && API_KEY);

/**
 * Send a gasless contract transaction via Biconomy Paymaster.
 * Falls back to normal tx if Biconomy env vars are missing.
 *
 * @param provider    - EIP-1193 provider (from Magic or window.ethereum)
 * @param contractAddress - address of the deployed contract
 * @param abi        - contract ABI fragment for the method
 * @param method     - method name e.g. "createBatch"
 * @param args       - array of arguments to pass
 */
export async function sendGasless(
    provider: ethers.Eip1193Provider,
    contractAddress: string,
    abi: ethers.InterfaceAbi,
    method: string,
    args: unknown[]
): Promise<{ hash: string; gasSponsored: boolean }> {
    if (!gaslessAvailable) {
        // Normal transaction fallback
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const tx = await contract[method](...args);
        await tx.wait();
        return { hash: tx.hash, gasSponsored: false };
    }

    // ── Biconomy ERC-4337 path ────────────────────────────────────────────
    try {
        // Dynamically import to avoid SSR issues and keep bundle lean
        const { createSmartAccountClient, BiconomySmartAccountV2 } =
            await import("@biconomy/sdk");
        const { createPaymaster } = await import("@biconomy/sdk");

        const ethersProvider = new ethers.BrowserProvider(provider as ethers.Eip1193Provider);
        const signer = await ethersProvider.getSigner();

        // Build Smart Account
        const smartAccount = await createSmartAccountClient({
            signer,
            biconomyPaymasterApiKey: API_KEY,
            bundlerUrl: BUNDLER_URL,
            paymasterUrl: PAYMASTER_URL,
        });

        // Encode the contract call
        const iface = new ethers.Interface(abi);
        const calldata = iface.encodeFunctionData(method, args);

        // Send sponsored UserOperation
        const tx = await smartAccount.sendTransaction({
            to: contractAddress,
            data: calldata,
        });

        const receipt = await tx.wait();
        return { hash: receipt?.transactionHash || "", gasSponsored: true };
    } catch (err) {
        console.warn("[Biconomy] Gasless failed, falling back to normal tx:", err);
        // Graceful fallback to normal transaction
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const tx = await contract[method](...args);
        await tx.wait();
        return { hash: tx.hash, gasSponsored: false };
    }
}
