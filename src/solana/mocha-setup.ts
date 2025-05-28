import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Get the keypair from the environment or generate a new one
export function getKeypair(name: string): Keypair {
    let keypair: Keypair;

    const keypairPath = path.resolve(
        os.homedir(),
        '.config',
        'solana',
        'id.json'
    );

    if (fs.existsSync(keypairPath)) {
        const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
        keypair = Keypair.fromSecretKey(Buffer.from(keypairData));
    } else {
        keypair = Keypair.generate();
        console.warn(`Keypair generated for ${name} since none was found at ${keypairPath}`);
    }

    return keypair;
}

// Set up the Anchor provider environment
export function setupAnchorProviderEnv(): void {
    // Default to the local Solana cluster if not specified
    process.env.ANCHOR_PROVIDER_URL = process.env.ANCHOR_PROVIDER_URL || 'http://localhost:8899';

    // Set up wallet for tests
    const programWallet = getKeypair('program');
    process.env.ANCHOR_WALLET = programWallet.secretKey.toString();

    console.log(`Using Solana cluster: ${process.env.ANCHOR_PROVIDER_URL}`);
    console.log(`Wallet public key: ${programWallet.publicKey.toString()}`);
} 