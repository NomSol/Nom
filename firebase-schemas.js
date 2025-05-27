/**
 * Firebase Firestore Schemas for NomNom Game
 * 
 * This file defines the data schemas used in the Firestore database
 * for the NomNom game, including users, recycling stations, treasures,
 * blind boxes, and PVP pools.
 */

// User Schema
const userSchema = {
    id: "string", // UUID
    nickname: "string",
    avatar_url: "string",
    description: "string",
    email: "string",
    wallet_address: "string",
    wallet_type: "string", // "solana", "ethereum", etc.
    points: "number", // Game points accumulated
    nom_tokens: "number", // NOM tokens owned
    created_at: "timestamp",
    updated_at: "timestamp",
    // User statistics
    stats: {
        coins_recycled: "number", // Total coins recycled
        blind_boxes_opened: "number", // Total blind boxes opened
        pvp_wins: "number", // Total PVP wins
        pvp_losses: "number", // Total PVP losses
        stations_owned: "number", // Number of recycling stations owned
    }
};

// Recycling Station Schema
const recyclingStationSchema = {
    id: "string", // UUID
    name: "string",
    description: "string",
    image_url: "string",
    owner_id: "string", // Reference to user.id
    latitude: "number", // Geographic coordinates
    longitude: "number", // Geographic coordinates
    status: "string", // "ACTIVE", "INACTIVE", "UNDER_MAINTENANCE"
    capacity: "number", // Max coins that can be recycled per day
    current_usage: "number", // Current daily usage
    level: "number", // Station level (for upgrades)
    earnings: "number", // Total NOM tokens earned by station
    created_at: "timestamp",
    updated_at: "timestamp",
    // Optional fields for official stations
    is_official: "boolean", // Whether this is an official station
    special_features: "array" // Special features of official stations
};

// Dead Coin Record Schema (tracks recycled coins)
const deadCoinSchema = {
    id: "string", // UUID
    user_id: "string", // Reference to user.id
    station_id: "string", // Reference to recyclingStation.id
    coin_name: "string", // Name of the dead coin
    coin_symbol: "string", // Symbol of the dead coin
    coin_contract: "string", // Contract address
    amount: "number", // Amount recycled
    usdt_value: "number", // Value in USDT at time of recycling
    death_index: "number", // AI-determined death index (0-100)
    rewards: {
        nom_tokens: "number", // NOM tokens rewarded
        points: "number" // Game points rewarded
    },
    transaction_hash: "string", // Blockchain transaction hash
    created_at: "timestamp"
};

// Blind Box Schema
const blindBoxSchema = {
    id: "string", // UUID
    name: "string",
    description: "string",
    image_url: "string",
    latitude: "number", // Geographic coordinates
    longitude: "number", // Geographic coordinates
    status: "string", // "ACTIVE", "CLAIMED"
    cost: {
        coin_type: "string", // Type of dead coin required
        amount: "number" // Amount required
    },
    reward: {
        coin_type: "string", // Type of meme coin rewarded
        amount: "number", // Amount rewarded
        usdt_value: "number" // Value in USDT at time of creation
    },
    creator_id: "string", // User who created the blind box (admin/sponsor)
    claimer_id: "string", // User who claimed the blind box (null if unclaimed)
    created_at: "timestamp",
    claimed_at: "timestamp" // null if unclaimed
};

// PVP Match Schema
const pvpMatchSchema = {
    id: "string", // UUID
    status: "string", // "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"
    match_type: "string", // "PROBABILITY", "MINI_GAME", "STRATEGY", "QUIZ"
    creator_id: "string", // Reference to user.id who created the match
    opponent_id: "string", // Reference to user.id who joined the match (null if open)
    winner_id: "string", // Reference to user.id who won (null if not completed)
    pool: {
        creator_contribution: {
            coin_type: "string",
            coin_symbol: "string",
            coin_contract: "string",
            amount: "number",
            usdt_value: "number"
        },
        opponent_contribution: {
            coin_type: "string",
            coin_symbol: "string",
            coin_contract: "string",
            amount: "number",
            usdt_value: "number"
        }
    },
    created_at: "timestamp",
    updated_at: "timestamp",
    completed_at: "timestamp" // null if not completed
};

// Transaction Schema (records all token transactions)
const transactionSchema = {
    id: "string", // UUID
    user_id: "string", // Reference to user.id
    transaction_type: "string", // "RECYCLE", "BLIND_BOX", "PVP_WIN", "STATION_EARNING"
    related_id: "string", // ID of related entity (station_id, blind_box_id, pvp_match_id)
    coin_in: {
        name: "string",
        symbol: "string",
        contract: "string",
        amount: "number",
        usdt_value: "number"
    },
    coin_out: {
        name: "string",
        symbol: "string",
        contract: "string",
        amount: "number",
        usdt_value: "number"
    },
    points_earned: "number",
    transaction_hash: "string", // Blockchain transaction hash if applicable
    created_at: "timestamp"
};

// User-Station Interaction Schema (records user visits to stations)
const userStationInteractionSchema = {
    id: "string", // UUID
    user_id: "string", // Reference to user.id
    station_id: "string", // Reference to recyclingStation.id
    interaction_type: "string", // "VISIT", "RECYCLE", "UPGRADE"
    coins_recycled: "number", // Only for "RECYCLE" interactions
    points_earned: "number", // Points earned from this interaction
    tokens_earned: "number", // NOM tokens earned from this interaction
    created_at: "timestamp"
};

// Module exports for use in other files
module.exports = {
    userSchema,
    recyclingStationSchema,
    deadCoinSchema,
    blindBoxSchema,
    pvpMatchSchema,
    transactionSchema,
    userStationInteractionSchema
}; 