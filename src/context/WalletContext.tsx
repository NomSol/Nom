"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PublicKey } from "@solana/web3.js";

// Define Phantom provider interface
interface PhantomProvider {
    connect: () => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: (args: any) => void) => void;
    isPhantom: boolean;
    publicKey: PublicKey | null;
}

// Define window with Phantom
interface WindowWithPhantom extends Window {
    phantom?: {
        solana?: PhantomProvider;
    };
}

// Define wallet types
export type WalletType = "metamask" | "walletconnect" | "binance" | "phantom" | null;

interface WalletContextType {
    connected: boolean;
    walletType: WalletType;
    walletAddress: string | null;
    isLoading: boolean;
    error: string | null;
    connectWallet: (type: WalletType) => Promise<void>;
    disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Debug flag to help track redirect loops
const DEBUG = true;

export function WalletProvider({ children }: { children: ReactNode }) {
    const [connected, setConnected] = useState<boolean>(false);
    const [walletType, setWalletType] = useState<WalletType>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start as loading
    const [error, setError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState<boolean>(false);

    // Check for existing connections on component mount
    useEffect(() => {
        const checkExistingConnection = async () => {
            if (DEBUG) console.log("Checking for existing wallet connection...");

            // Check local storage for existing connection
            const savedWalletType = localStorage.getItem('walletType');
            const savedWalletAddress = localStorage.getItem('walletAddress');

            if (savedWalletType && savedWalletAddress) {
                if (DEBUG) console.log(`Found saved wallet: ${savedWalletType}, address: ${savedWalletAddress.substring(0, 8)}...`);

                // Set connection state
                setWalletType(savedWalletType as WalletType);
                setWalletAddress(savedWalletAddress);
                setConnected(true);

                // If it's a Phantom wallet, check if it's still connected
                if (savedWalletType === 'phantom') {
                    const phantom = (window as WindowWithPhantom).phantom?.solana;

                    if (!phantom || !phantom.publicKey) {
                        if (DEBUG) console.log("Phantom disconnected, clearing state");
                        // Phantom disconnected, clear the state
                        await disconnectWallet();
                    }
                }
            } else {
                if (DEBUG) console.log("No saved wallet found");
            }

            // Initialization complete
            setIsLoading(false);
            setInitialized(true);
        };

        if (typeof window !== 'undefined') {
            checkExistingConnection().catch(error => {
                console.error("Error checking wallet connection:", error);
                setIsLoading(false);
                setInitialized(true);
            });
        }
    }, []);

    // Connect to a wallet with timeout to prevent message channel closure issues
    const connectWallet = async (type: WalletType) => {
        if (!type) return;

        setIsLoading(true);
        setError(null);

        if (DEBUG) console.log(`Connecting to wallet type: ${type}`);

        try {
            if (type === 'phantom') {
                const phantom = (window as WindowWithPhantom).phantom?.solana;

                if (!phantom) {
                    throw new Error("Phantom wallet is not installed");
                }

                // Create a timeout promise to handle message channel closure
                const connectWithTimeout = async () => {
                    let timeoutId: NodeJS.Timeout;

                    try {
                        const result = await Promise.race([
                            phantom.connect(),
                            new Promise<never>((_, reject) => {
                                timeoutId = setTimeout(() => {
                                    reject(new Error("Connection timed out. Please try again."));
                                }, 30000); // 30 second timeout
                            })
                        ]);

                        clearTimeout(timeoutId!);
                        return result;
                    } catch (err) {
                        clearTimeout(timeoutId!);
                        throw err;
                    }
                };

                try {
                    const response = await connectWithTimeout();
                    const publicKey = response.publicKey.toString();

                    if (DEBUG) console.log(`Connected to Phantom wallet: ${publicKey.substring(0, 8)}...`);

                    // Set state first to indicate connection
                    setConnected(true);
                    setWalletType('phantom');
                    setWalletAddress(publicKey);

                    // Save to local storage
                    localStorage.setItem('walletType', 'phantom');
                    localStorage.setItem('walletAddress', publicKey);

                    // Add disconnect event listener
                    phantom.on('disconnect', () => {
                        if (DEBUG) console.log("Phantom disconnect event received");
                        disconnectWallet();
                    });
                } catch (error) {
                    if (
                        error instanceof Error &&
                        (error.message.includes("message channel closed") ||
                            error.message.includes("User rejected"))
                    ) {
                        throw new Error("Connection was cancelled or timed out. Please try again.");
                    }
                    throw error;
                }

            } else {
                // Simulate connection for other wallet types
                // In a real implementation, you would use the appropriate SDK for each wallet

                // Generate a mock address
                const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;

                if (DEBUG) console.log(`Connected to mock wallet: ${mockAddress.substring(0, 8)}...`);

                // Set state
                setConnected(true);
                setWalletType(type);
                setWalletAddress(mockAddress);

                // Save to local storage
                localStorage.setItem('walletType', type);
                localStorage.setItem('walletAddress', mockAddress);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error));
            console.error("Wallet connection error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Disconnect from wallet
    const disconnectWallet = async () => {
        setIsLoading(true);

        if (DEBUG) console.log("Disconnecting wallet");

        try {
            if (walletType === 'phantom') {
                const phantom = (window as WindowWithPhantom).phantom?.solana;

                if (phantom) {
                    try {
                        await Promise.race([
                            phantom.disconnect(),
                            new Promise<void>((resolve) => {
                                setTimeout(resolve, 3000); // 3 second timeout for disconnect
                            })
                        ]);
                    } catch (err) {
                        console.error("Error disconnecting from Phantom:", err);
                        // Continue with cleanup even if disconnect fails
                    }
                }
            }

            // Clear state
            setConnected(false);
            setWalletType(null);
            setWalletAddress(null);

            // Clear local storage
            localStorage.removeItem('walletType');
            localStorage.removeItem('walletAddress');

            if (DEBUG) console.log("Wallet disconnected successfully");
        } catch (error) {
            console.error("Error disconnecting wallet:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Only provide the context once initialized
    if (!initialized && isLoading) {
        return <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2">Initializing wallet...</p>
            </div>
        </div>;
    }

    return (
        <WalletContext.Provider
            value={{
                connected,
                walletType,
                walletAddress,
                isLoading,
                error,
                connectWallet,
                disconnectWallet,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
} 