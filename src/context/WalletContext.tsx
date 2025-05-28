"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isPhantomInstalled, connectPhantomWallet, formatSolanaAddress } from '@/solana/utils';

interface WalletContextType {
    connected: boolean;
    connecting: boolean;
    walletAddress: string | null;
    walletAddressShort: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    isPhantomAvailable: boolean;
}

const WalletContext = createContext<WalletContextType>({
    connected: false,
    connecting: false,
    walletAddress: null,
    walletAddressShort: null,
    connect: async () => { },
    disconnect: () => { },
    isPhantomAvailable: false,
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const [connected, setConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [walletAddressShort, setWalletAddressShort] = useState<string | null>(null);
    const [isPhantomAvailable, setIsPhantomAvailable] = useState(false);

    useEffect(() => {
        // Check if Phantom wallet is available
        setIsPhantomAvailable(isPhantomInstalled());

        // Check if wallet was previously connected
        const savedWalletAddress = localStorage.getItem('walletAddress');
        if (savedWalletAddress) {
            setWalletAddress(savedWalletAddress);
            setWalletAddressShort(formatSolanaAddress(savedWalletAddress));
            setConnected(true);
        }
    }, []);

    const connect = async () => {
        try {
            setConnecting(true);
            const response = await connectPhantomWallet();

            if (response && response.publicKey) {
                setWalletAddress(response.publicKey);
                setWalletAddressShort(formatSolanaAddress(response.publicKey));
                setConnected(true);
                localStorage.setItem('walletAddress', response.publicKey);
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setConnecting(false);
        }
    };

    const disconnect = () => {
        setWalletAddress(null);
        setWalletAddressShort(null);
        setConnected(false);
        localStorage.removeItem('walletAddress');
    };

    return (
        <WalletContext.Provider
            value={{
                connected,
                connecting,
                walletAddress,
                walletAddressShort,
                connect,
                disconnect,
                isPhantomAvailable,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}; 