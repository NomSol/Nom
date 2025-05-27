# Firebase Migration Guide for Nom Project

This document provides instructions for migrating the Nom project from Hasura GraphQL Engine to Firebase Realtime Database.

## Prerequisites

- Node.js and npm (for running the Next.js application)
- Firebase account and project (set up at [Firebase Console](https://console.firebase.google.com/))
- Firebase CLI (optional, for local development with emulators)
  - Install with: `npm install -g firebase-tools`

## Migration Steps

### 1. Set up Firebase

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the Realtime Database service
3. Set up authentication methods (if needed)
4. Get your Firebase configuration (API keys, etc.)

### 2. Run the Firebase setup script

```bash
./firebase-setup.sh
```

This script creates:
- A `.env` file with required Firebase environment variables
- Database schema files and security rules
- Firebase API endpoints for the Next.js application

### 3. Install required dependencies

```bash
npm install firebase uuid axios
```

### 4. Start the development server

You can either use the Firebase emulator with Docker:

```bash
docker-compose up -d
```

Or run the Next.js application locally:

```bash
npm run dev
```

### 5. Seed the database with dummy data

To populate your Firebase database with dummy data for testing purposes:

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

## Project Structure

The migration has updated the following components:

### Firebase Configuration

- `src/lib/firebase.ts` - Firebase initialization
- `src/lib/firebase-api-client.ts` - Client for Firebase API endpoints

### API Routes

- `src/app/api/firebase/users/route.ts` - User management API
- `src/app/api/firebase/treasures/route.ts` - Treasure management API
- `src/app/api/firebase/likes/route.ts` - Likes management API
- `src/app/api/firebase/matches/route.ts` - Matches management API

### Updated Hooks

- `src/hooks/use-wallet-user.ts` - User authentication and profile management
- `src/hooks/use-user.ts` - User profile management
- `src/hooks/use-treasure.tsx` - Treasure management
- `src/hooks/use-likes.ts` - Likes management

## Database Schema

The Firebase Realtime Database uses the following structure:

```
nomnom-103d6/
├── users/
│   ├── [user-id]/
│   │   ├── nickname
│   │   ├── avatar_url
│   │   ├── cath_id
│   │   ├── ip_location
│   │   ├── description
│   │   ├── email
│   │   ├── wallet_address
│   │   ├── wallet_type
│   │   ├── created_at
│   │   └── updated_at
├── treasures/
│   ├── [treasure-id]/
│   │   ├── name
│   │   ├── description
│   │   ├── points
│   │   ├── hint
│   │   ├── latitude
│   │   ├── longitude
│   │   ├── status
│   │   ├── image_url
│   │   ├── verification_code
│   │   ├── creator_id
│   │   ├── finder_id
│   │   ├── created_at
│   │   ├── updated_at
│   │   └── likes_count
├── likes/
│   ├── [like-id]/
│   │   ├── user_id
│   │   ├── treasure_id
│   │   └── created_at
└── matches/
    ├── [match-id]/
        ├── user_id
        ├── treasure_id
        ├── status
        ├── created_at
        └── updated_at
```

## Security Rules

Firebase security rules are defined in `firebase/schema/database-rules.json`. These rules control access to the database and implement basic security measures.

## API Reference

The Firebase API client (`src/lib/firebase-api-client.ts`) provides the following methods:

### User Management

- `getUserByEmail(email)` - Get user by email
- `getUserByNickname(nickname)` - Get user by nickname
- `createUser(userData)` - Create a new user
- `updateUser(email, updates)` - Update a user
- `getWalletUser(walletAddress)` - Get user by wallet address

### Treasure Management

- `getAllTreasures()` - Get all treasures
- `getTreasureById(id)` - Get treasure by ID
- `getUserPlacements(creatorId)` - Get treasures created by a user
- `getUserFindings(finderId)` - Get treasures found by a user
- `createTreasure(treasure)` - Create a new treasure
- `updateTreasure(id, updates)` - Update a treasure
- `deleteTreasure(id)` - Delete a treasure
- `verifyTreasure(id, verification_code, finder_id)` - Verify a found treasure

### Likes Management

- `getTreasureLikesCount(treasureId)` - Get likes count for a treasure
- `getUserLikes(userId)` - Get likes by a user
- `likeTreasure(userId, treasureId)` - Like a treasure
- `unlikeTreasure(userId, treasureId)` - Unlike a treasure

### Matches Management

- `getMatch(userId, treasureId)` - Get a specific match
- `getUserMatches(userId, status)` - Get matches for a user
- `getTreasureMatches(treasureId, status)` - Get matches for a treasure
- `createMatch(userId, treasureId)` - Create a match
- `updateMatchStatus(id, status)` - Update match status 