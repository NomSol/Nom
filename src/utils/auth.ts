"use client";

import { useWallet } from "@/context/WalletContext";

export function useAuth() {
    const { connected, walletAddress, walletType } = useWallet();

    return {
        isAuthenticated: connected && !!walletAddress,
        user: {
            id: walletAddress,
            email: `${walletAddress}@wallet.user`,
            name: `User_${walletAddress?.substring(0, 6)}`,
            image: null,
            walletAddress,
            walletType,
        },
    };
} 