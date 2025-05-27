"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';

export default function ProtectPage({ children }: { children: React.ReactNode }) {
    const { connected, walletAddress, isLoading: walletLoading } = useWallet();
    const router = useRouter();
    const pathname = usePathname() ?? "";
    const unprotectedPaths = ['/', '/auth/connect-wallet', '/test-routing', '/auth/wallet-debug'];
    const [isReady, setIsReady] = useState(false);
    const [lastRedirectTime, setLastRedirectTime] = useState(0);
    const [redirectCount, setRedirectCount] = useState(0);

    // Throttled redirect function to prevent loops
    const safeRedirect = useCallback((path: string) => {
        const now = Date.now();
        // Prevent more than 2 redirects in a 2 second window
        if (now - lastRedirectTime < 2000 && redirectCount > 2) {
            console.log(`Prevented redirect loop to ${path}. Too many redirects.`);
            setIsReady(true); // Force ready state to break the loop
            return;
        }

        // Check if we're already on this path
        if (pathname === path) {
            console.log(`Already at ${path}, no redirect needed`);
            setIsReady(true);
            return;
        }

        console.log(`Redirecting to ${path} from ${pathname}. Wallet connected: ${connected}`);
        setLastRedirectTime(now);
        setRedirectCount(prev => prev + 1);
        router.push(path);
    }, [router, pathname, lastRedirectTime, redirectCount, connected]);

    useEffect(() => {
        // Debug logging
        console.log(`Path: ${pathname}, Connected: ${connected}, Address: ${walletAddress?.substring(0, 8)}..., Loading: ${walletLoading}`);

        // If wallet is still loading, wait
        if (walletLoading) {
            console.log("Wallet still loading, waiting...");
            return;
        }

        // For unprotected paths
        if (unprotectedPaths.includes(pathname)) {
            console.log("On unprotected path:", pathname);
            // If wallet is connected on an unprotected path, redirect to dashboard
            if (connected && walletAddress && pathname !== '/auth/wallet-debug') {
                console.log("Wallet connected on unprotected path, redirecting to dashboard");
                safeRedirect("/main/dashboard");
            } else {
                // Otherwise allow access to unprotected path
                console.log("Not connected, allowing access to unprotected path");
                setIsReady(true);
            }
            return;
        }

        // For protected paths
        console.log("On protected path:", pathname);
        if (!connected || !walletAddress) {
            console.log("Not connected, redirecting to connect-wallet");
            safeRedirect("/auth/connect-wallet");
        } else {
            // User is connected with wallet, allow access
            console.log("Connected, allowing access to protected path");
            setIsReady(true);
        }
    }, [pathname, connected, walletAddress, walletLoading, safeRedirect]);

    // Show loading state while determining access
    if (!isReady || walletLoading) {
        return <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                <p className="mt-2">Loading...</p>
            </div>
        </div>;
    }

    // Render children if access is granted
    return <>{children}</>;
}
