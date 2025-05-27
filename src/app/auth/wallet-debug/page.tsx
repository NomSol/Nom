"use client";

import { useWallet } from "@/context/WalletContext";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";

export default function WalletDebugPage() {
    const { connected, walletType, walletAddress, isLoading, error, disconnectWallet } = useWallet();
    const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({});
    const router = useRouter();

    useEffect(() => {
        // Get all wallet-related items from localStorage
        if (typeof window !== 'undefined') {
            const items = {
                walletType: localStorage.getItem('walletType') || 'not set',
                walletAddress: localStorage.getItem('walletAddress') || 'not set',
            };
            setLocalStorageData(items);
        }
    }, []);

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">Wallet Debug Page</h1>

            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="font-medium text-gray-700">Connected:</div>
                    <div className={connected ? "text-green-600" : "text-red-600"}>
                        {connected ? "Yes" : "No"}
                    </div>

                    <div className="font-medium text-gray-700">Wallet Type:</div>
                    <div>{walletType || "None"}</div>

                    <div className="font-medium text-gray-700">Wallet Address:</div>
                    <div className="break-all">{walletAddress || "None"}</div>

                    <div className="font-medium text-gray-700">Loading:</div>
                    <div>{isLoading ? "Yes" : "No"}</div>

                    <div className="font-medium text-gray-700">Error:</div>
                    <div className="text-red-600">{error || "None"}</div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Local Storage Data</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {Object.entries(localStorageData).map(([key, value]) => (
                        <Fragment key={key}>
                            <div className="font-medium text-gray-700">{key}:</div>
                            <div className="break-all">{value}</div>
                        </Fragment>
                    ))}
                </div>

                <div className="flex flex-col space-y-2 mt-6">
                    <button
                        onClick={() => disconnectWallet()}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        disabled={isLoading || !connected}
                    >
                        Force Disconnect
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem('walletType');
                            localStorage.removeItem('walletAddress');
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                        Clear Local Storage & Reload
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go to Home
                    </button>

                    <button
                        onClick={() => router.push("/auth/connect-wallet")}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Go to Connect Wallet
                    </button>

                    <button
                        onClick={() => router.push("/main/dashboard")}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
} 