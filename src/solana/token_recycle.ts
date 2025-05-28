import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

// This file contains TypeScript interfaces that match our Anchor program's accounts and instructions

export interface TokenRecycle {
    // Program instructions
    initializeStation: (
        name: string,
        description: string,
        latitude: number,
        longitude: number
    ) => any;

    disposeDeadCoin: (
        amount: BN,
        deathIndex: number
    ) => any;

    claimXp: () => any;

    // Program accounts
    account: {
        recyclingStation: {
            fetch: (publicKey: PublicKey) => Promise<RecyclingStation>;
        };
        recycleRecord: {
            fetch: (publicKey: PublicKey) => Promise<RecycleRecord>;
        };
    };
}

// Matches the RecyclingStation struct in our Anchor program
export interface RecyclingStation {
    owner: PublicKey;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    recycledCount: BN;
    isActive: boolean;
    createdAt: BN;
}

// Matches the RecycleRecord struct in our Anchor program
export interface RecycleRecord {
    user: PublicKey;
    station: PublicKey;
    deadCoinMint: PublicKey;
    amount: BN;
    deathIndex: number;
    nomTokensReward: BN;
    xpPoints: BN;
    timestamp: BN;
}

// Matches the RecycleEvent event in our Anchor program
export interface RecycleEvent {
    user: PublicKey;
    station: PublicKey;
    deadCoinMint: PublicKey;
    amount: BN;
    nomTokensReward: BN;
    xpPoints: BN;
    timestamp: BN;
} 