"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button_login";
import { useRouter } from "next/navigation";
import { FaEthereum } from "react-icons/fa";
import { SiTether } from "react-icons/si";
import { TbBrandBinance } from "react-icons/tb";
import { RiGhostLine } from "react-icons/ri";
import { IconType } from "react-icons";
import { useWallet, WalletType } from "@/context/WalletContext";

// Define window with Phantom
interface WindowWithPhantom extends Window {
    phantom?: {
        solana?: any;
    };
}

export function ConnectWalletForm() {
    const router = useRouter();
    const { connectWallet, connected, isLoading, error: walletError } = useWallet();
    const [error, setError] = useState("");
    const [phantomInstalled, setPhantomInstalled] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [redirectInProgress, setRedirectInProgress] = useState(false);

    // Check if Phantom is installed on component mount
    useEffect(() => {
        const checkPhantomInstalled = () => {
            const provider = (window as WindowWithPhantom).phantom?.solana;
            setPhantomInstalled(provider && provider.isPhantom ? true : false);
        };

        if (typeof window !== "undefined") {
            checkPhantomInstalled();
        }
    }, []);

    // Automatically redirect if already connected
    useEffect(() => {
        if (connected && !isLoading && !redirectInProgress) {
            console.log("Already connected, redirecting to dashboard");
            setRedirectInProgress(true);

            // Add a small delay to prevent immediate redirect
            const redirectTimer = setTimeout(() => {
                router.push("/main/dashboard");
            }, 500);

            return () => clearTimeout(redirectTimer);
        }
    }, [connected, isLoading, router, redirectInProgress]);

    // Use the context's error state if available
    useEffect(() => {
        if (walletError) {
            setError(walletError);
            setConnecting(false);
        }
    }, [walletError]);

    const handleConnectWallet = async (provider: WalletType) => {
        setError("");
        setConnecting(true);

        try {
            await connectWallet(provider);
            // Let the useEffect above handle the redirect to prevent race conditions
        } catch (error) {
            console.error("Connection error:", error);
            setError(error instanceof Error ? error.message : String(error));
            setConnecting(false);
        }
    };

    const walletButtons: {
        provider: WalletType;
        icon: IconType;
        text: string;
        color: string;
        disabled?: boolean;
    }[] = [
            {
                provider: "metamask",
                icon: FaEthereum,
                text: "MetaMask",
                color: "bg-orange-50 hover:bg-orange-100 text-orange-600 border-orange-200",
            },
            {
                provider: "walletconnect",
                icon: SiTether,
                text: "WalletConnect",
                color: "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200",
            },
            {
                provider: "binance",
                icon: TbBrandBinance,
                text: "Binance Wallet",
                color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border-yellow-200",
            },
            {
                provider: "phantom",
                icon: RiGhostLine,
                text: "Phantom (Solana)",
                color: "bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200",
                disabled: !phantomInstalled,
            },
        ];

    if (connected && !isLoading) {
        return (
            <div className="space-y-4 text-center">
                <div className="flex items-center justify-center mb-4">
                    <div className="w-8 h-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                </div>
                <p className="text-gray-600">Wallet connected! Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <p className="text-center text-gray-600 mb-4">Select a wallet to connect</p>
            {walletButtons.map(({ provider, icon: Icon, text, color, disabled }) => (
                <Button
                    key={provider}
                    onClick={() => handleConnectWallet(provider)}
                    className={`w-full flex items-center justify-center space-x-2 ${color} border ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading || connecting || disabled}
                >
                    {(isLoading || connecting) && provider === "phantom" ? (
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    ) : (
                        <Icon className="w-5 h-5" />
                    )}
                    <span>{(isLoading || connecting) ? "Connecting..." : text}</span>
                    {provider === "phantom" && !phantomInstalled && (
                        <span className="text-xs ml-2">(Not installed)</span>
                    )}
                </Button>
            ))}
            {!phantomInstalled && (
                <div className="text-xs text-center mt-2">
                    <a
                        href="https://phantom.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                    >
                        Install Phantom Wallet
                    </a>
                </div>
            )}
        </div>
    );
} 