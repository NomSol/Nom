"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWallet } from '@/context/WalletContext';
import { toast } from '@/hooks/use-toast';
import { disposeDeadCoin } from '@/solana/token_recycle_client';
import { calculateDeadCoinRewards, getSolanaConnection, checkTokenInWallet } from '@/solana/utils';

// Sample dead coins data - in a real app, this would come from an API
const deadCoins = [
    { name: "SafeMoon", symbol: "SAFEMOON", contract: "0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3", logo: "https://cryptologos.cc/logos/safemoon-safemoon-logo.png", death_index: 92 },
    { name: "SQUID Game", symbol: "SQUID", contract: "0x87230146e138d3f296a9a77e497a2a83012e9bc5", logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/16125.png", death_index: 98 },
    { name: "Luna Classic", symbol: "LUNC", contract: "0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9", logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/4172.png", death_index: 95 },
    { name: "Shiba Inu", symbol: "SHIB", contract: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce", logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png", death_index: 68 },
    { name: "Dogelon Mars", symbol: "ELON", contract: "0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3", logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/9436.png", death_index: 75 },
];

export default function DisposePage() {
    const router = useRouter();
    const { connected, connecting, walletAddress, connect, isPhantomAvailable } = useWallet();
    const [selectedToken, setSelectedToken] = useState<string | undefined>();
    const [amount, setAmount] = useState<string>("");
    const [swapMode, setSwapMode] = useState<"swap" | "dispose">("swap");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasToken, setHasToken] = useState<boolean>(false);

    const selectedCoin = deadCoins.find(coin => coin.symbol === selectedToken);

    // Calculate rewards using utility function
    const rewards = selectedCoin && amount ?
        calculateDeadCoinRewards(parseFloat(amount), selectedCoin.death_index) :
        { usdtValue: "0.00", nomTokens: "0.00", xpPoints: 0 };

    // Check if the selected token is in the wallet
    useEffect(() => {
        const checkToken = async () => {
            if (connected && walletAddress && selectedCoin) {
                const connection = getSolanaConnection();
                const result = await checkTokenInWallet(
                    connection,
                    walletAddress,
                    selectedCoin.contract
                );
                setHasToken(result);
            } else {
                setHasToken(false);
            }
        };

        checkToken();
    }, [connected, walletAddress, selectedCoin]);

    const handleBackClick = () => {
        router.back();
    };

    const handleConnectWallet = async () => {
        if (!isPhantomAvailable) {
            toast({
                title: "Phantom wallet not found",
                description: "Please install Phantom wallet to continue",
                variant: "destructive",
            });
            return;
        }

        try {
            await connect();
        } catch (error) {
            toast({
                title: "Connection failed",
                description: "Failed to connect to wallet",
                variant: "destructive",
            });
        }
    };

    const handleValidate = async () => {
        if (!connected) {
            toast({
                title: "Connect wallet",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        if (!selectedToken) {
            toast({
                title: "Select a token",
                description: "Please select a token to dispose",
                variant: "destructive",
            });
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid amount",
                variant: "destructive",
            });
            return;
        }

        // Check if the token is in the wallet
        if (!hasToken) {
            toast({
                title: "Token not found",
                description: `You don't have any ${selectedToken} in your wallet`,
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Token validated",
            description: `${amount} ${selectedToken} is available for recycling`,
        });
    };

    const handleSwap = async () => {
        if (!connected) {
            toast({
                title: "Connect wallet",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        if (!selectedToken || !selectedCoin) {
            toast({
                title: "Select a token",
                description: "Please select a token to swap",
                variant: "destructive",
            });
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid amount",
                variant: "destructive",
            });
            return;
        }

        if (!hasToken) {
            toast({
                title: "Token not found",
                description: `You don't have any ${selectedToken} in your wallet`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // For demonstration purposes, we use a mock wallet since we don't have a real wallet connection
            const mockWallet = {
                publicKey: walletAddress,
                payer: {} as any // In a real app, this would be the actual wallet keypair
            };

            // Get Solana connection
            const connection = getSolanaConnection();

            // Mock station ID - in a real app, this would be the current station the user is at
            const stationId = "StationIdHere111111111111111111111111111111";

            // Call the Solana contract function
            const result = await disposeDeadCoin(
                connection,
                mockWallet,
                stationId,
                selectedCoin.contract,
                parseFloat(amount) * 1_000_000, // Convert to smallest units
                selectedCoin.death_index
            );

            if (result.success) {
                toast({
                    title: "Swap successful",
                    description: `Swapped ${amount} ${selectedToken} for ${rewards.nomTokens} NOM`,
                });

                // Reset form
                setSelectedToken(undefined);
                setAmount("");

                // Navigate back after successful transaction
                setTimeout(() => router.push("/dashboard"), 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                title: "Swap failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDispose = async () => {
        if (!connected) {
            toast({
                title: "Connect wallet",
                description: "Please connect your wallet first",
                variant: "destructive",
            });
            return;
        }

        if (!selectedToken || !selectedCoin) {
            toast({
                title: "Select a token",
                description: "Please select a token to dispose",
                variant: "destructive",
            });
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid amount",
                variant: "destructive",
            });
            return;
        }

        if (!hasToken) {
            toast({
                title: "Token not found",
                description: `You don't have any ${selectedToken} in your wallet`,
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // For demonstration purposes, we use a mock wallet since we don't have a real wallet connection
            const mockWallet = {
                publicKey: walletAddress,
                payer: {} as any // In a real app, this would be the actual wallet keypair
            };

            // Get Solana connection
            const connection = getSolanaConnection();

            // Mock station ID - in a real app, this would be the current station the user is at
            const stationId = "StationIdHere111111111111111111111111111111";

            // Call the Solana contract function
            const result = await disposeDeadCoin(
                connection,
                mockWallet,
                stationId,
                selectedCoin.contract,
                parseFloat(amount) * 1_000_000, // Convert to smallest units
                selectedCoin.death_index
            );

            if (result.success) {
                toast({
                    title: "Dispose successful",
                    description: `Disposed ${amount} ${selectedToken} for ${rewards.xpPoints} XP`,
                });

                // Reset form
                setSelectedToken(undefined);
                setAmount("");

                // Navigate back after successful transaction
                setTimeout(() => router.push("/dashboard"), 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast({
                title: "Dispose failed",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 flex items-center">
                <button onClick={handleBackClick} className="mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-semibold">Dispose Dead Coin</h1>
            </div>

            {/* Main content */}
            <div className="flex-1 p-4 flex flex-col gap-6">
                {/* Wallet connection */}
                {!connected && (
                    <Button
                        variant="default"
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={handleConnectWallet}
                        disabled={connecting}
                    >
                        {connecting ? "Connecting..." : "Connect Wallet"}
                    </Button>
                )}

                {/* Token to dispose section */}
                <div className="bg-teal-500 rounded-lg p-4 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm">Token to dispose:</p>
                        </div>
                        <div className="flex items-center gap-2 bg-teal-400 p-2 rounded-md">
                            {selectedCoin && (
                                <div className="h-6 w-6 relative">
                                    <Image
                                        src={selectedCoin.logo}
                                        alt={selectedCoin.symbol}
                                        fill
                                        sizes="24px"
                                        className="rounded-full"
                                    />
                                </div>
                            )}
                            <Select value={selectedToken} onValueChange={setSelectedToken}>
                                <SelectTrigger className="border-none bg-transparent text-white w-24">
                                    <SelectValue placeholder="Token" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deadCoins.map((coin) => (
                                        <SelectItem key={coin.symbol} value={coin.symbol}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-5 relative">
                                                    <Image
                                                        src={coin.logo}
                                                        alt={coin.symbol}
                                                        fill
                                                        sizes="20px"
                                                        className="rounded-full"
                                                    />
                                                </div>
                                                <span>{coin.symbol}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-sm">
                            <Input
                                type="text"
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-16 h-8 p-1 text-black text-center"
                            />
                        </div>
                    </div>

                    {selectedCoin && amount && (
                        <div className="mt-2 text-xs">
                            <p>Death index: {selectedCoin.death_index}/100</p>
                            <p>Estimated value: ~${rewards.usdtValue} USD</p>
                            {connected && !hasToken && (
                                <p className="text-red-200 mt-1">Note: You don't have this token in your wallet (demo mode)</p>
                            )}
                        </div>
                    )}
                </div>

                <Button
                    variant="default"
                    className="w-full bg-teal-500 hover:bg-teal-600"
                    onClick={handleValidate}
                    disabled={isLoading || !connected}
                >
                    Validate
                </Button>

                {/* Swap Mode */}
                <div className="pt-4">
                    <h2 className="font-semibold mb-2">Swap Mode:</h2>
                    <div className="bg-purple-500 rounded-lg p-4 text-white mb-2">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <p className="text-sm">From</p>
                            </div>
                            <div className="flex items-center gap-2 bg-purple-400 p-2 rounded-md">
                                {selectedCoin && (
                                    <div className="h-6 w-6 relative">
                                        <Image
                                            src={selectedCoin.logo}
                                            alt={selectedCoin.symbol}
                                            fill
                                            sizes="24px"
                                            className="rounded-full"
                                        />
                                    </div>
                                )}
                                <span>{amount || "0"} {selectedToken || "Token"}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm">To</p>
                            </div>
                            <div className="flex items-center gap-2 bg-purple-400 p-2 rounded-md">
                                <div className="h-6 w-6 relative">
                                    <div className="bg-yellow-500 h-full w-full rounded-full flex items-center justify-center text-xs">N</div>
                                </div>
                                <span>{rewards.nomTokens} NOM</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="default"
                        className="w-full bg-purple-500 hover:bg-purple-600"
                        onClick={handleSwap}
                        disabled={isLoading || !connected}
                    >
                        {isLoading ? "Processing..." : "Swap"}
                    </Button>
                </div>

                {/* Dispose Mode */}
                <div className="pt-4">
                    <h2 className="font-semibold mb-2">Dispose Mode:</h2>
                    <div className="bg-green-200 rounded-lg p-4 mb-2">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm">From</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white p-2 rounded-md">
                                {selectedCoin && (
                                    <div className="h-6 w-6 relative">
                                        <Image
                                            src={selectedCoin.logo}
                                            alt={selectedCoin.symbol}
                                            fill
                                            sizes="24px"
                                            className="rounded-full"
                                        />
                                    </div>
                                )}
                                <span>{amount || "0"} {selectedToken || "Token"}</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="default"
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={handleDispose}
                        disabled={isLoading || !connected}
                    >
                        {isLoading ? "Processing..." : `${rewards.xpPoints} XP! Dispose`}
                    </Button>
                </div>
            </div>
        </div>
    );
} 