import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coins, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecycleCoinsInput } from '@/types/station';
import { useMutation } from '@tanstack/react-query';
import { RECYCLE_COINS } from '@/graphql/stations';
import { useClient } from '@/lib/client';
import { useWallet } from '@/context/WalletContext';
import { useUserProfile } from '@/hooks/use-user';
import { toast } from '@/hooks/use-toast';

// Sample dead coins data - in a real app, this would come from an API
const deadCoins = [
    { name: "SafeMoon", symbol: "SAFEMOON", contract: "0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3" },
    { name: "SQUID Game", symbol: "SQUID", contract: "0x87230146e138d3f296a9a77e497a2a83012e9bc5" },
    { name: "Luna Classic", symbol: "LUNC", contract: "0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9" },
    { name: "Shiba Inu", symbol: "SHIB", contract: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce" },
    { name: "Dogelon Mars", symbol: "ELON", contract: "0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3" },
    { name: "Floki Inu", symbol: "FLOKI", contract: "0x43f11c02439e2736800433b4594994bd43cd066d" },
    { name: "Akita Inu", symbol: "AKITA", contract: "0x3301ee63fb29f863f2333bd4466acb46cd8323e6" },
    { name: "Pepe", symbol: "PEPE", contract: "0x6982508145454ce325ddbe47a25d4ec3d2311933" }
];

interface RecycleCoinsDialogProps {
    stationId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function RecycleCoinsDialog({ stationId, isOpen, onClose }: RecycleCoinsDialogProps) {
    const [selectedCoin, setSelectedCoin] = useState('');
    const [amount, setAmount] = useState('');
    const [estimatedUsdtValue, setEstimatedUsdtValue] = useState('0.00');
    const client = useClient();
    const { walletAddress } = useWallet();
    const { profile } = useUserProfile({ enabled: !!walletAddress });

    // Calculate estimated rewards
    const nomTokensReward = parseFloat(estimatedUsdtValue) * 2; // 2x USDT value
    const pointsReward = parseFloat(estimatedUsdtValue) * 10; // 10x USDT value

    // Find the selected coin details
    const selectedCoinDetails = deadCoins.find(coin => coin.symbol === selectedCoin);

    // Mutation for recycling coins
    const recycleMutation = useMutation({
        mutationFn: async (input: RecycleCoinsInput) => {
            if (!profile?.id) throw new Error('User profile not found');

            const deathIndex = 50 + Math.floor(Math.random() * 50); // 50-100 range
            const txHash = `0x${Math.random().toString(16).substring(2, 66)}`; // Mock transaction hash

            const variables = {
                object: {
                    ...input,
                    user_id: profile.id,
                    death_index: deathIndex,
                    rewards: {
                        nom_tokens: Math.floor(parseFloat(input.usdt_value.toString()) * 2),
                        points: Math.floor(parseFloat(input.usdt_value.toString()) * 10)
                    },
                    transaction_hash: txHash
                }
            };

            return client.request(RECYCLE_COINS, variables);
        },
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Coins recycled successfully',
                variant: 'default',
            });
            onClose();
        },
        onError: (error) => {
            console.error('Failed to recycle coins:', error);
            toast({
                title: 'Error',
                description: 'Failed to recycle coins',
                variant: 'destructive',
            });
        }
    });

    const handleAmountChange = (value: string) => {
        setAmount(value);
        // Simple mock calculation for USDT value - in a real app, this would use actual exchange rates
        if (value && !isNaN(parseFloat(value))) {
            // Let's say 1M dead tokens = $1 USDT, capped at $50 USDT
            const calculatedValue = Math.min(parseFloat(value) / 1000000, 50);
            setEstimatedUsdtValue(calculatedValue.toFixed(2));
        } else {
            setEstimatedUsdtValue('0.00');
        }
    };

    const handleRecycle = () => {
        if (!selectedCoinDetails || !amount || parseFloat(amount) <= 0) {
            toast({
                title: 'Invalid Input',
                description: 'Please select a coin and enter a valid amount',
                variant: 'destructive',
            });
            return;
        }

        const input: RecycleCoinsInput = {
            station_id: stationId,
            coin_name: selectedCoinDetails.name,
            coin_symbol: selectedCoinDetails.symbol,
            coin_contract: selectedCoinDetails.contract,
            amount: parseFloat(amount),
            usdt_value: parseFloat(estimatedUsdtValue)
        };

        recycleMutation.mutate(input);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        Recycle Dead Coins
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Coin</label>
                        <Select
                            value={selectedCoin}
                            onValueChange={setSelectedCoin}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a dead coin" />
                            </SelectTrigger>
                            <SelectContent>
                                {deadCoins.map((coin) => (
                                    <SelectItem key={coin.symbol} value={coin.symbol}>
                                        {coin.name} ({coin.symbol})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                            type="number"
                            placeholder="Enter amount to recycle"
                            value={amount}
                            onChange={(e) => handleAmountChange(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Enter the amount of tokens you want to recycle</p>
                    </div>

                    {selectedCoin && amount && parseFloat(amount) > 0 && (
                        <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                            <h3 className="text-sm font-medium">Estimated Rewards</h3>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500">USDT Value:</p>
                                    <p className="font-mono">${estimatedUsdtValue}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">NOM Tokens:</p>
                                    <p className="font-mono">{nomTokensReward.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Game Points:</p>
                                    <p className="font-mono">{pointsReward.toFixed(0)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Death Index:</p>
                                    <p className="font-mono">High</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRecycle}
                            disabled={!selectedCoin || !amount || parseFloat(amount) <= 0 || recycleMutation.isPending}
                        >
                            {recycleMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing
                                </>
                            ) : (
                                'Recycle'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 