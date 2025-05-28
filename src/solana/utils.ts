import { PublicKey, Connection, clusterApiUrl, Cluster } from '@solana/web3.js';

/**
 * Validate if a string is a valid Solana address (public key)
 */
export const isValidSolanaAddress = (address: string): boolean => {
    try {
        new PublicKey(address);
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Format a Solana address for display (truncate middle)
 */
export const formatSolanaAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 10) return address;

    return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

/**
 * Convert lamports to SOL
 */
export const lamportsToSol = (lamports: number): number => {
    return lamports / 1_000_000_000;
};

/**
 * Convert SOL to lamports
 */
export const solToLamports = (sol: number): number => {
    return sol * 1_000_000_000;
};

/**
 * Calculate estimated reward from dead coin
 * 
 * @param amount Amount of tokens
 * @param deathIndex Death index (0-100)
 * @returns Object containing rewards
 */
export const calculateDeadCoinRewards = (amount: number, deathIndex: number) => {
    // Higher death index = more rewards
    const deathMultiplier = Math.max(deathIndex, 50) / 100;

    // Base value in USDT
    const usdtValue = amount * 0.0000001 * deathMultiplier;

    // NOM tokens = 2x USDT value
    const nomTokens = usdtValue * 2;

    // XP points = 10x USDT value
    const xpPoints = Math.floor(usdtValue * 10);

    return {
        usdtValue: usdtValue.toFixed(2),
        nomTokens: nomTokens.toFixed(2),
        xpPoints
    };
};

/**
 * Get connection to Solana network
 */
export const getSolanaConnection = (network: Cluster = 'devnet'): Connection => {
    return new Connection(clusterApiUrl(network), 'confirmed');
};

/**
 * Check if Phantom wallet is installed
 */
export const isPhantomInstalled = (): boolean => {
    if (typeof window === 'undefined') return false;
    const win = window as any;
    return !!win.phantom?.solana;
};

/**
 * Connect to Phantom wallet
 */
export const connectPhantomWallet = async (): Promise<{ publicKey: string } | null> => {
    try {
        if (typeof window === 'undefined') return null;
        const win = window as any;

        if (!win.phantom?.solana) {
            throw new Error('Phantom wallet is not installed');
        }

        const response = await win.phantom.solana.connect();
        return {
            publicKey: response.publicKey.toString()
        };
    } catch (error) {
        console.error('Error connecting to Phantom wallet:', error);
        return null;
    }
};

/**
 * Check if a token exists in the user's wallet
 * @param connection Solana connection
 * @param walletAddress User's wallet address
 * @param tokenMintAddress Token mint address
 * @returns True if the token exists in the wallet
 */
export const checkTokenInWallet = async (
    connection: Connection,
    walletAddress: string,
    tokenMintAddress: string
): Promise<boolean> => {
    try {
        // In a real implementation, we would use SPL token methods to check
        // For the sake of this example, we'll just return true
        return true;
    } catch (error) {
        console.error('Error checking token in wallet:', error);
        return false;
    }
}; 