import { Connection, PublicKey, Transaction, SystemProgram, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import idl from './token_recycle.json';

// Program ID from the deployed contract
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

// NOM token mint address (this would be your project's token)
const NOM_MINT = new PublicKey('NomTokenMintAddressHere11111111111111111111111');

// Rent sysvar public key
const SYSVAR_RENT_PUBKEY = new PublicKey('SysvarRent111111111111111111111111111111111');

/**
 * Create a provider with the given connection and wallet
 */
export const getProvider = (connection: Connection, wallet: any) => {
    const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
    );
    return provider;
};

/**
 * Get the program instance
 */
export const getProgram = (provider: AnchorProvider) => {
    return new Program(idl as any, PROGRAM_ID, provider);
};

/**
 * Initialize a new recycling station
 */
export const initializeStation = async (
    connection: Connection,
    wallet: any,
    name: string,
    description: string,
    latitude: number,
    longitude: number
) => {
    const provider = getProvider(connection, wallet);
    const program = getProgram(provider);

    // Generate a new keypair for the station account
    const stationKeypair = Keypair.generate();

    try {
        const tx = await program.methods
            .initializeStation(name, description, latitude, longitude)
            .accounts({
                station: stationKeypair.publicKey,
                owner: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([stationKeypair])
            .rpc();

        console.log('Station initialized with transaction signature', tx);

        return {
            success: true,
            signature: tx,
            stationId: stationKeypair.publicKey.toString()
        };
    } catch (error: any) {
        console.error('Error initializing station:', error);
        return {
            success: false,
            error: error.toString()
        };
    }
};

/**
 * Dispose a dead coin
 */
export const disposeDeadCoin = async (
    connection: Connection,
    wallet: any,
    stationId: string,
    deadCoinMint: string,
    amount: number,
    deathIndex: number
) => {
    const provider = getProvider(connection, wallet);
    const program = getProgram(provider);

    const stationPubkey = new PublicKey(stationId);
    const deadCoinMintPubkey = new PublicKey(deadCoinMint);

    try {
        // Find the associated token accounts
        const userDeadCoinAccount = await getAssociatedTokenAddress(
            deadCoinMintPubkey,
            wallet.publicKey
        );

        const userNomAccount = await getAssociatedTokenAddress(
            NOM_MINT,
            wallet.publicKey
        );

        // Find the program's PDA for authority
        const [programAuthority, programAuthorityBump] = await PublicKey.findProgramAddress(
            [Buffer.from("program-authority")],
            program.programId
        );

        // Find the program's NOM token account
        const programNomAccount = await getAssociatedTokenAddress(
            NOM_MINT,
            programAuthority,
            true // allowOwnerOffCurve
        );

        // Create a record account
        const recycleRecordKeypair = Keypair.generate();

        // Check if the user's NOM account exists, if not create it
        const userNomAccountInfo = await connection.getAccountInfo(userNomAccount);

        const transaction = new Transaction();

        if (!userNomAccountInfo) {
            transaction.add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    userNomAccount,
                    wallet.publicKey,
                    NOM_MINT
                )
            );
        }

        // Create the transaction
        const tx = await program.methods
            .disposeDeadCoin(
                new BN(amount),
                deathIndex
            )
            .accounts({
                user: wallet.publicKey,
                station: stationPubkey,
                deadCoinMint: deadCoinMintPubkey,
                userDeadCoinAccount: userDeadCoinAccount,
                nomMint: NOM_MINT,
                userNomAccount: userNomAccount,
                programNomAccount: programNomAccount,
                programAuthority: programAuthority,
                programAuthorityBump: programAuthorityBump.toString(),
                recycleRecord: recycleRecordKeypair.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            })
            .signers([recycleRecordKeypair])
            .transaction();

        transaction.add(tx);

        // Send and confirm the transaction
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet.payer, recycleRecordKeypair]
        );

        console.log('Dead coin disposed with transaction signature', signature);

        return {
            success: true,
            signature: signature,
            recordId: recycleRecordKeypair.publicKey.toString()
        };
    } catch (error: any) {
        console.error('Error disposing dead coin:', error);
        return {
            success: false,
            error: error.toString()
        };
    }
};

/**
 * Claim XP points
 */
export const claimXP = async (
    connection: Connection,
    wallet: any
) => {
    const provider = getProvider(connection, wallet);
    const program = getProgram(provider);

    try {
        const tx = await program.methods
            .claimXp()
            .accounts({
                user: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log('XP claimed with transaction signature', tx);

        return {
            success: true,
            signature: tx
        };
    } catch (error: any) {
        console.error('Error claiming XP:', error);
        return {
            success: false,
            error: error.toString()
        };
    }
}; 