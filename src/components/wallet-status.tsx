"use client";

import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button_login";
import { useState } from "react";

export function WalletStatus() {
    const {
        connected,
        walletType,
        walletAddress,
        disconnectWallet,
        isLoading
    } = useWallet();
    const [isExpanded, setIsExpanded] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    if (!connected) return null;

    const truncatedAddress = walletAddress
        ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
        : '';

    const handleDisconnect = async () => {
        setDisconnecting(true);
        try {
            await disconnectWallet();
        } catch (error) {
            console.error("Error disconnecting wallet:", error);
            // Force a refresh if disconnect fails to ensure UI is updated
            window.location.reload();
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-3 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-sm">
                        {walletType === 'phantom' ? 'Phantom' :
                            walletType === 'metamask' ? 'MetaMask' :
                                walletType === 'walletconnect' ? 'WalletConnect' :
                                    walletType === 'binance' ? 'Binance' : 'Wallet'} Connected
                    </span>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    {isExpanded ? '▲' : '▼'}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Address:</span>
                        <span className="font-mono">{truncatedAddress}</span>
                    </div>

                    <Button
                        onClick={handleDisconnect}
                        className="w-full mt-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                        disabled={disconnecting || isLoading}
                    >
                        {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                </div>
            )}
        </div>
    );
} 