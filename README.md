# NOM GAME

*Turning dead meme tokens into treasure hunts*

## Overview

Nom Game is an innovative blockchain-based game that combines real-world geolocation with cryptocurrency, specifically focusing on "dead" meme tokens. Players can analyze, collect, trade, and compete with defunct meme tokens through a unique treasure hunting mechanism mapped to real-world locations.

```mermaid
graph TD
    A[NOM Game Ecosystem] --> B[AI Agent Analysis]
    A --> C[Recycling Stations]
    A --> D[Token Recovery]
    A --> E[PvP Competitions]
    
    B --> B1[Token Analytics]
    B --> B2[Meme Death Index]
    
    C --> C1[Build Stations]
    C --> C2[Earn from Recycling]
    
    D --> D1[Find Stations]
    D --> D2[Process Dead Tokens]
    
    E --> E1[Timed Mode]
    E --> E2[Traditional Mode]
```

## Core Features

### 1. AI Agent Analytics (Under development)

Our advanced AI chatbot provides real-time analysis of meme tokens:

- Simply input a token ticker or contract address
- Receive instant analysis of the token's "death index"
- Get comprehensive data analysis on token performance
- Learn about token history and market context

### 2. Recycling Station Ownership (Finished)

Build your own infrastructure in the Nom ecosystem:

- Create recycling stations at real-world locations
- Become a station master and establish your territory
- Earn rewards from other players who use your station
- Upgrade stations to increase capacity and earning potential

### 3. Token Recovery Missions (Under development)

Turn worthless assets into gameplay elements:

- Locate recycling stations on the real-world map
- Process dead meme tokens for in-game value
- Convert otherwise worthless tokens into gameplay assets
- Collect and trade recovered tokens

### 4. PvP Competition Modes (Finished)

Compete against other players in token-based battles:

```mermaid
flowchart LR
    A[Start PvP] --> B{Choose Mode}
    B --> C[Timed Mode]
    B --> D[Traditional Mode]
    C --> E[Contribute Tokens to Prize Pool]
    D --> E
    E --> F[Bury Tokens at Real Locations]
    F --> G{Battle}
    G --> H[Find More Tokens in Time Limit]
    G --> I[Find All Opponent's Tokens First]
    H --> J[Winner Takes Prize Pool]
    I --> J
```

#### Timed Mode (Under development)
- Both players contribute dead meme tokens to a prize pool
- Tokens are virtually "buried" at random real-world locations
- Players have a time limit to find as many tokens as possible
- The player who recovers more tokens wins the entire prize pool

#### Traditional Mode (Finished)
- Both players contribute dead meme tokens to a prize pool
- Each player buries their tokens at selected real-world locations
- First player to find all of their opponent's tokens wins
- Winner claims the entire prize pool

## Gameplay Integration with Real World (Finished)

Nom Game seamlessly integrates virtual gameplay with physical locations:

```mermaid
graph TD
    A[Real World Map] --> B[Player Location]
    A --> C[Virtual Token Locations]
    A --> D[Recycling Stations]
    
    B --> E[Proximity Detection]
    C --> E
    D --> E
    
    E --> F[Location-based Actions]
    F --> G[Token Recovery]
    F --> H[Station Interaction]
    F --> I[PvP Competition]
```

- Uses GPS and map data to track player movements
- Requires physical presence at locations to interact
- Creates an augmented reality treasure hunting experience
- Encourages exploration of real-world environments

## Token Economics

Nom Game creates utility for otherwise "dead" meme tokens:

- Tokens with low trading volume or value become game assets
- Building recycling infrastructure creates new token utility
- PvP competitions add competitive value to defunct tokens
- Creates a secondary market for previously abandoned assets

## Getting Started

1. [Git clone this repository]

2. npm install

3. npm start

## Community & Support

- Join our Telegram Group and Channel for strategy discussions, we'd like to dear advices on further development
- Follow us on Twitter for updates
- Visit our website at nomme.xyz

## Firebase Seeding

After setting up Firebase, you can populate the database with dummy data using the included seeding script:

```bash
# Install required dependencies
npm install

# Run the seeding script
npm run seed
```

This will create:
- 5 dummy users with random wallet addresses
- 10 treasure items placed at random coordinates in the San Francisco Bay Area
- Random likes on treasures by users
- A few completed treasure findings

You can modify the `firebase-seed.js` script to customize the seeding data as needed.

### Firebase Seed Options

If you want to clear the database before seeding, uncomment this line in the `seedDatabase()` function:

```javascript
// Uncomment to clear the database before seeding
// await clearDatabase();
```

---

*Nom Game: Where dead memes find new life.*

# NomNom - Firebase Development Guide

This guide explains how to set up and use Firebase Firestore for the NomNom dead meme coin recycling game.

## Game Mechanics Overview

NomNom is a geo-location based game where players can recycle "dead" meme coins for rewards:

1. **Recycling Stations**: Users can find and visit recycling stations on the map to dispose of their dead meme coins in exchange for NOM tokens and points.

2. **Blind Boxes**: Users can spend dead coins to open blind boxes at specific locations and receive active meme coins as rewards.

3. **PVP Competitions**: Players can challenge each other by contributing dead coins to prize pools, with winners taking all the coins.

4. **Station Ownership**: Users can establish and own recycling stations, earning a share of recycled coins processed at their stations.

## Prerequisites

Make sure you have Node.js (v16 or later) installed on your system.

## Setup Instructions

1. Install the required dependencies:
```bash
npm install
```

2. Seed the Firebase Firestore database with sample data:
```bash
npm run seed
```

This command will:
- Connect to your Firebase Firestore database
- Clear existing data in the database (with a 5-second confirmation window to cancel)
- Seed the database with sample data including users, recycling stations, dead coin records, blind boxes, PVP matches, and user-station interactions

## Seed Data Overview

The seeding script creates:
- 10 users with random statistics and wallet addresses
- 8 recycling stations (5 user-owned and 3 official)
- 20 dead coin recycling records
- 15 blind boxes (some already claimed)
- 10 PVP matches in various states (open, in-progress, completed)
- 30 user-station interactions

## Connecting to Firebase Firestore

Use the following configuration to connect to Firebase in your application:

```javascript
// In your Firebase initialization code:
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA9rBubO644uLujowvGgZ88kijyhr6UX1A",
  authDomain: "nomnom-103d6.firebaseapp.com",
  projectId: "nomnom-103d6",
  storageBucket: "nomnom-103d6.firebasestorage.app",
  messagingSenderId: "981324903048",
  appId: "1:981324903048:web:8618ca311b5ca78093e53d",
  measurementId: "G-4BPWCVDEQW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);
```

## Database Structure

The Firebase Firestore database follows this structure:

### Users Collection (/users/{userId})
```
- nickname: string
- avatar_url: string
- description: string
- email: string
- wallet_address: string
- wallet_type: string ("solana", "ethereum", etc.)
- points: number (game points accumulated)
- nom_tokens: number (NOM tokens owned)
- created_at: timestamp
- updated_at: timestamp
- stats: {
    coins_recycled: number
    blind_boxes_opened: number
    pvp_wins: number
    pvp_losses: number
    stations_owned: number
  }
```

### Recycling Stations Collection (/recycling_stations/{stationId})
```
- name: string
- description: string
- image_url: string
- owner_id: string (reference to user.id or null for official stations)
- latitude: number
- longitude: number
- status: string ("ACTIVE", "INACTIVE", "UNDER_MAINTENANCE")
- capacity: number (max coins that can be recycled per day)
- current_usage: number
- level: number (for upgrades)
- earnings: number (total NOM tokens earned)
- created_at: timestamp
- updated_at: timestamp
- is_official: boolean
- special_features: array (special features for official stations)
```

### Dead Coins Collection (/dead_coins/{recordId})
```
- user_id: string (reference to user.id)
- station_id: string (reference to station.id)
- coin_name: string
- coin_symbol: string
- coin_contract: string
- amount: number
- usdt_value: number
- death_index: number (AI-determined death index)
- rewards: {
    nom_tokens: number
    points: number
  }
- transaction_hash: string
- created_at: timestamp
```

### Blind Boxes Collection (/blind_boxes/{boxId})
```
- name: string
- description: string
- image_url: string
- latitude: number
- longitude: number
- status: string ("ACTIVE", "CLAIMED")
- cost: {
    coin_type: string
    amount: number
  }
- reward: {
    coin_type: string
    amount: number
    usdt_value: number
  }
- creator_id: string
- claimer_id: string (null if unclaimed)
- created_at: timestamp
- claimed_at: timestamp (null if unclaimed)
```

### PVP Matches Collection (/pvp_matches/{matchId})
```
- status: string ("OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED")
- match_type: string ("PROBABILITY", "MINI_GAME", "STRATEGY", "QUIZ")
- creator_id: string (reference to user.id)
- opponent_id: string (reference to user.id who joined, null if open)
- winner_id: string (reference to user.id who won, null if not completed)
- pool: {
    creator_contribution: {
      coin_type: string
      coin_symbol: string
      coin_contract: string
      amount: number
      usdt_value: number
    }
    opponent_contribution: {
      coin_type: string
      coin_symbol: string
      coin_contract: string
      amount: number
      usdt_value: number
    }
  }
- created_at: timestamp
- updated_at: timestamp
- completed_at: timestamp (null if not completed)
```

### User-Station Interactions Collection (/user_station_interactions/{interactionId})
```
- user_id: string (reference to user.id)
- station_id: string (reference to station.id)
- interaction_type: string ("VISIT", "RECYCLE", "UPGRADE")
- coins_recycled: number
- points_earned: number
- tokens_earned: number
- created_at: timestamp
```

## Troubleshooting

If you encounter any issues connecting to Firebase:

1. Make sure you have properly set up Firebase for your project
2. Check that you're using the correct configuration from your Firebase console
3. Ensure you have the proper permissions set in your Firebase Firestore security rules
