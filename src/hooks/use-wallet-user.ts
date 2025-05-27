import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWallet } from '@/context/WalletContext';
import { UserProfile } from '@/types/user';
import { UserProfileInput } from '@/types/user';
import { firebaseApiClient } from '@/lib/firebase-api-client';

export function useWalletUser() {
    const { walletAddress, walletType, connected } = useWallet();
    const queryClient = useQueryClient();

    const {
        data: profile,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['walletUser', walletAddress],
        queryFn: async () => {
            if (!walletAddress) throw new Error('No wallet connected');

            // Get user by wallet address
            try {
                const data = await firebaseApiClient.getWalletUser(walletAddress);

                // If no user found with this wallet, create a new user profile
                if (!data.users || data.users.length === 0) {
                    return createWalletUser();
                }

                return data.users[0] as UserProfile;
            } catch (error) {
                console.error('Error fetching wallet user:', error);
                return createWalletUser();
            }
        },
        enabled: !!walletAddress && connected,
    });

    // Create a new user profile for this wallet
    const createWalletUser = async () => {
        const newUser: UserProfileInput = {
            wallet_address: walletAddress!,
            wallet_type: walletType!,
            nickname: `User_${walletAddress?.substring(0, 6)}`,
            email: `${walletAddress}@wallet.user`, // Virtual email using wallet address
            avatar_url: '', // Default avatar
            created_at: new Date().toISOString(),
        };

        const data = await firebaseApiClient.createUser(newUser);
        return data as UserProfile;
    };

    // Update user profile
    const updateWalletUser = useMutation({
        mutationFn: async (updates: Partial<UserProfileInput>) => {
            if (!walletAddress) throw new Error('No wallet connected');

            // Find user by wallet address and update
            const email = `${walletAddress}@wallet.user`;
            return firebaseApiClient.updateUser(email, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['walletUser', walletAddress] });
        },
    });

    return {
        profile,
        isLoading,
        error,
        refetch,
        updateWalletUser,
    };
} 