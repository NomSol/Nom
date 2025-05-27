// Use standard Firebase client SDK with Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, getDocs, runTransaction } = require('firebase/firestore');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA9rBubO644uLujowvGgZ88kijyhr6UX1A",
    authDomain: "nomnom-103d6.firebaseapp.com",
    projectId: "nomnom-103d6",
    storageBucket: "nomnom-103d6.firebasestorage.app",
    messagingSenderId: "981324903048",
    appId: "1:981324903048:web:8618ca311b5ca78093e53d",
    measurementId: "G-4BPWCVDEQW"
};

console.log("Initializing Firebase with client SDK...");
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test database connection
const testDbConnection = async () => {
    try {
        const testDocRef = doc(collection(db, 'connection_test'));
        await setDoc(testDocRef, { timestamp: Date.now() });
        console.log("Successfully connected to Firestore");
        await deleteDoc(testDocRef);
    } catch (error) {
        console.error("Failed to connect to Firestore:", error);
        process.exit(1);
    }
};

// Generate random coordinates within a geographical boundary
const generateRandomCoordinates = () => {
    // San Francisco Bay Area boundaries
    const sfLatBounds = [37.7, 37.9];
    const sfLngBounds = [-122.5, -122.3];

    return {
        latitude: sfLatBounds[0] + Math.random() * (sfLatBounds[1] - sfLatBounds[0]),
        longitude: sfLngBounds[0] + Math.random() * (sfLngBounds[1] - sfLngBounds[0])
    };
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Sample avatars
const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=6",
    "https://i.pravatar.cc/150?img=7",
    "https://i.pravatar.cc/150?img=8"
];

// Sample dead coins
const deadCoins = [
    { name: "SafeMoon", symbol: "SAFEMOON", contract: "0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3", death_index: 92 },
    { name: "SQUID Game", symbol: "SQUID", contract: "0x87230146e138d3f296a9a77e497a2a83012e9bc5", death_index: 98 },
    { name: "Luna Classic", symbol: "LUNC", contract: "0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9", death_index: 95 },
    { name: "Shiba Inu", symbol: "SHIB", contract: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce", death_index: 68 },
    { name: "Dogelon Mars", symbol: "ELON", contract: "0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3", death_index: 75 },
    { name: "Floki Inu", symbol: "FLOKI", contract: "0x43f11c02439e2736800433b4594994bd43cd066d", death_index: 72 },
    { name: "Akita Inu", symbol: "AKITA", contract: "0x3301ee63fb29f863f2333bd4466acb46cd8323e6", death_index: 80 },
    { name: "Pepe", symbol: "PEPE", contract: "0x6982508145454ce325ddbe47a25d4ec3d2311933", death_index: 65 },
    { name: "Bonk", symbol: "BONK", contract: "0x6d6f636b757000000000000000000000000000001", death_index: 70 },
    { name: "Doge", symbol: "DOGE", contract: "0x6d6f636b757000000000000000000000000000002", death_index: 60 }
];

// Sample active meme coins
const activeCoins = [
    { name: "Dogecoin", symbol: "DOGE", contract: "0x6d6f636b757000000000000000000000000000003" },
    { name: "Shiba Inu", symbol: "SHIB", contract: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce" },
    { name: "Bonk", symbol: "BONK", contract: "0x6d6f636b757000000000000000000000000000001" },
    { name: "Floki", symbol: "FLOKI", contract: "0x43f11c02439e2736800433b4594994bd43cd066d" },
    { name: "Pepe", symbol: "PEPE", contract: "0x6982508145454ce325ddbe47a25d4ec3d2311933" }
];

// Sample recycling station names
const stationNames = [
    "EcoRevive Hub",
    "TokenRenew Center",
    "CryptoClean Station",
    "MemeReborn Point",
    "Coin Renewal Depot",
    "Green Token Exchange",
    "Digital Asset Recycler",
    "Meme Revival Center",
    "Blockchain Eco Station",
    "Sustainable Crypto Hub",
    "DeadCoin Reclaimer",
    "Token Phoenix Station",
    "MemeCoin Recycler",
    "Web3 Waste Management",
    "CryptoSave Point"
];

// Sample station descriptions
const stationDescriptions = [
    "A high-efficiency recycling station for your worthless meme coins.",
    "Convert your dead tokens into valuable NOM rewards at this station.",
    "The premier location for transforming crypto waste into treasure.",
    "Specializing in high-volume meme coin recycling with bonus rewards.",
    "An eco-friendly station that turns dead memes into valuable assets.",
    "Highest returns in the area for your worthless token collections.",
    "Advanced technology for optimal dead coin conversion rates.",
    "Strategically located station with premium recycling capabilities.",
    "A community-focused station helping clean up the blockchain ecosystem.",
    "Cutting-edge station with specialized processing for the deadest of coins."
];

// Station images
const stationImages = [
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1585167161314-7efa720aeb58?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581075698750-ababc9b6eb56?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1589463886038-dccdb96d3b78?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504981983529-08aa77a3c1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1547623542-de3ff5tba7a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1567427013651-837f0b17cce9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1550837725-a8dde49ba512?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
];

// Create dummy users
const createUsers = async () => {
    console.log("Creating dummy users...");
    const users = [];

    for (let i = 1; i <= 15; i++) {
        const userId = uuidv4();
        const walletAddress = `0x${Math.random().toString(16).substring(2, 14)}`;
        const timestamp = new Date().toISOString();
        const walletType = Math.random() > 0.7 ? "solana" : "ethereum";

        // Calculate random stats with some bias to make data more interesting
        const coinsRecycled = Math.floor(Math.random() * 35) + (i % 5 === 0 ? 40 : 0);
        const pointsEarned = coinsRecycled * 10 + Math.floor(Math.random() * 200);
        const nomTokensEarned = Math.floor(coinsRecycled * 2.5 + Math.random() * 100);
        const stationsOwned = i <= 8 ? Math.floor(Math.random() * 3) + 1 : 0; // First 8 users own stations

        const user = {
            nickname: `Recycler${i}`,
            avatar_url: avatars[Math.floor(Math.random() * avatars.length)],
            description: `Crypto enthusiast and meme coin recycler. Cleaning up the blockchain one dead token at a time.`,
            email: `recycler${i}@example.com`,
            wallet_address: walletAddress,
            wallet_type: walletType,
            points: pointsEarned,
            nom_tokens: nomTokensEarned,
            created_at: timestamp,
            updated_at: timestamp,
            stats: {
                coins_recycled: coinsRecycled,
                stations_owned: stationsOwned,
                recycling_efficiency: Math.floor(Math.random() * 50) + 50, // 50-100%
                total_usdt_value_recycled: parseFloat((coinsRecycled * (Math.random() * 5 + 2)).toFixed(2)),
                top_coin_recycled: deadCoins[Math.floor(Math.random() * deadCoins.length)].symbol,
                favorite_station_id: null // Will be updated after stations are created
            }
        };

        try {
            // Add the document with custom ID
            const userDocRef = doc(db, 'users', userId);
            await setDoc(userDocRef, user);
            users.push({ id: userId, ...user });
            console.log(`Created user: ${user.nickname}`);
        } catch (error) {
            console.error(`Error creating user ${user.nickname}:`, error);
        }
    }

    return users;
};

// Create recycling stations
const createRecyclingStations = async (users) => {
    console.log("\nCreating recycling stations...");
    const stations = [];

    // Return empty array if no users created
    if (!users || users.length === 0) {
        console.log("No users available to create stations");
        return stations;
    }

    // Create station capacities and earnings based on level
    const getCapacityForLevel = (level) => {
        const baseCapacity = 20;
        return baseCapacity + (level * 15);
    };

    // Create official stations (5) + user-owned stations (12)
    const totalStations = 17;
    const officialStationCount = 5;

    for (let i = 0; i < totalStations; i++) {
        const stationId = uuidv4();
        const isOfficial = i < officialStationCount;

        // For user stations, assign to a user with station_owned > 0
        let owner = null;
        if (!isOfficial) {
            const eligibleUsers = users.filter(user => user.stats.stations_owned > 0);
            if (eligibleUsers.length > 0) {
                owner = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
            }
        }

        const coords = generateRandomCoordinates();
        const timestamp = new Date().toISOString();

        // Set level (official stations have higher levels)
        const level = isOfficial ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 3);

        // Calculate capacity based on level
        const capacity = getCapacityForLevel(level);

        // Calculate current usage (more used for official stations)
        const usagePercent = isOfficial
            ? 30 + Math.floor(Math.random() * 50) // 30-80% for official
            : 10 + Math.floor(Math.random() * 40); // 10-50% for user-owned
        const currentUsage = Math.floor(capacity * (usagePercent / 100));

        // Calculate earnings (higher for official and higher level stations)
        const earningsFactor = isOfficial ? 20 : 10;
        const earnings = level * earningsFactor * (1 + Math.random() * 2) * (1 + currentUsage / capacity);

        const station = {
            name: stationNames[Math.floor(Math.random() * stationNames.length)],
            description: stationDescriptions[Math.floor(Math.random() * stationDescriptions.length)],
            image_url: stationImages[Math.floor(Math.random() * stationImages.length)],
            owner_id: isOfficial ? null : owner?.id,
            latitude: coords.latitude,
            longitude: coords.longitude,
            status: Math.random() > 0.9 ? "UNDER_MAINTENANCE" : "ACTIVE", // 10% chance of maintenance
            capacity: capacity,
            current_usage: currentUsage,
            level: level,
            earnings: Math.floor(earnings),
            created_at: timestamp,
            updated_at: timestamp,
            is_official: isOfficial,
            special_features: isOfficial
                ? ["PREMIUM_REWARDS", "NO_LIMITS", "SPECIAL_EVENTS"].slice(0, 1 + Math.floor(Math.random() * 3))
                : level >= 3 ? ["EFFICIENCY_BOOST"] : []
        };

        try {
            const stationDocRef = doc(db, 'recycling_stations', stationId);
            await setDoc(stationDocRef, station);
            stations.push({ id: stationId, ...station });

            // Update the user's favorite station if they own it
            if (owner) {
                const userDocRef = doc(db, 'users', owner.id);
                await updateDoc(userDocRef, {
                    "stats.favorite_station_id": stationId
                });
            }

            console.log(`Created station: ${station.name} (${isOfficial ? "Official" : "User-owned"}) - Level ${level}`);
        } catch (error) {
            console.error(`Error creating station ${station.name}:`, error);
        }
    }

    return stations;
};

// Create dead coin recycling records
const createDeadCoinRecords = async (users, stations) => {
    console.log("\nCreating dead coin recycling records...");
    const records = [];

    // Return empty array if no users or stations created
    if (!users || users.length === 0 || !stations || stations.length === 0) {
        console.log("No users or stations available to create dead coin records");
        return records;
    }

    // Create 30 dead coin recycling records
    for (let i = 0; i < 30; i++) {
        const recordId = uuidv4();
        const user = users[Math.floor(Math.random() * users.length)];
        const station = stations[Math.floor(Math.random() * stations.length)];
        const deadCoin = deadCoins[Math.floor(Math.random() * deadCoins.length)];

        // Generate timestamps within the last month
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date(new Date().setDate(new Date().getDate() - daysAgo));
        timestamp.setHours(timestamp.getHours() - hoursAgo);

        // Generate amounts and values
        const amount = (Math.random() * 10000000).toFixed(2);
        const usdtValue = (Math.random() * 40 + 5).toFixed(2); // 5-45 USDT
        const deathIndex = deadCoin.death_index || (60 + Math.floor(Math.random() * 40)); // Use predefined or random

        // Calculate rewards based on USDT value, death index, and station level
        const stationBonus = station.is_official ? 1.5 : 1 + (station.level * 0.1);
        const deathBonus = deathIndex / 100 + 0.5; // More dead = more rewards
        const nomTokensReward = Math.floor(parseFloat(usdtValue) * 2 * stationBonus * deathBonus);
        const pointsReward = Math.floor(parseFloat(usdtValue) * 10 * stationBonus * deathBonus);

        const record = {
            user_id: user.id,
            station_id: station.id,
            coin_name: deadCoin.name,
            coin_symbol: deadCoin.symbol,
            coin_contract: deadCoin.contract,
            amount: parseFloat(amount),
            usdt_value: parseFloat(usdtValue),
            death_index: deathIndex,
            rewards: {
                nom_tokens: nomTokensReward,
                points: pointsReward
            },
            transaction_hash: `0x${Math.random().toString(16).substring(2, 66)}`,
            created_at: timestamp.toISOString()
        };

        try {
            const recordDocRef = doc(db, 'dead_coins', recordId);
            await setDoc(recordDocRef, record);
            records.push({ id: recordId, ...record });
            console.log(`Created dead coin record: ${record.coin_symbol} (${record.usdt_value} USDT) - Rewards: ${nomTokensReward} NOM, ${pointsReward} points`);
        } catch (error) {
            console.error(`Error creating dead coin record for ${record.coin_symbol}:`, error);
        }
    }

    return records;
};

// Create user-station interactions
const createUserStationInteractions = async (users, stations) => {
    console.log("\nCreating user-station interactions...");
    const interactions = [];

    // Return empty array if no users or stations created
    if (!users || users.length === 0 || !stations || stations.length === 0) {
        console.log("No users or stations available to create interactions");
        return interactions;
    }

    // Create 40 user-station interactions
    for (let i = 0; i < 40; i++) {
        const interactionId = uuidv4();
        const user = users[Math.floor(Math.random() * users.length)];
        const station = stations[Math.floor(Math.random() * stations.length)];

        // Generate timestamps within the last week with more recent ones being more common
        const daysAgo = Math.floor(Math.random() * Math.random() * 7); // Bias toward recent
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date(new Date().setDate(new Date().getDate() - daysAgo));
        timestamp.setHours(timestamp.getHours() - hoursAgo);

        // Determine interaction type with weighted distribution
        const interactionTypes = ["VISIT", "RECYCLE", "UPGRADE"];
        const weights = [0.4, 0.5, 0.1]; // 40% VISIT, 50% RECYCLE, 10% UPGRADE
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        let interactionType = interactionTypes[0];

        for (let j = 0; j < weights.length; j++) {
            cumulativeWeight += weights[j];
            if (randomValue <= cumulativeWeight) {
                interactionType = interactionTypes[j];
                break;
            }
        }

        // For station owners, more likely to perform upgrades
        if (station.owner_id === user.id && Math.random() > 0.7) {
            interactionType = "UPGRADE";
        }

        // Calculate rewards based on interaction type, station level, and official status
        const stationMultiplier = station.is_official ? 1.5 : 1 + (station.level * 0.1);
        let pointsEarned = 0;
        let tokensEarned = 0;
        let coinsRecycled = 0;

        if (interactionType === "VISIT") {
            pointsEarned = Math.floor((Math.random() * 5 + 5) * stationMultiplier);
        } else if (interactionType === "RECYCLE") {
            coinsRecycled = Math.floor(Math.random() * 3) + 1;
            pointsEarned = Math.floor((Math.random() * 20 + 20) * stationMultiplier * coinsRecycled);
            tokensEarned = Math.floor((Math.random() * 5 + 5) * stationMultiplier * coinsRecycled);
        }

        const interaction = {
            user_id: user.id,
            station_id: station.id,
            interaction_type: interactionType,
            coins_recycled: coinsRecycled,
            points_earned: pointsEarned,
            tokens_earned: tokensEarned,
            created_at: timestamp.toISOString()
        };

        try {
            const interactionDocRef = doc(db, 'user_station_interactions', interactionId);
            await setDoc(interactionDocRef, interaction);
            interactions.push({ id: interactionId, ...interaction });
            console.log(`Created user-station interaction: ${interactionType} at ${station.name} by ${user.nickname}`);
        } catch (error) {
            console.error(`Error creating user-station interaction:`, error);
        }
    }

    return interactions;
};

// Clear existing data (optional)
const clearDatabase = async () => {
    console.log("Clearing existing data...");

    try {
        // Delete collections by batch
        const deleteCollection = async (collectionPath) => {
            const collectionRef = collection(db, collectionPath);
            const snapshot = await getDocs(collectionRef);
            let count = 0;

            const deletePromises = snapshot.docs.map(async (docSnapshot) => {
                await deleteDoc(doc(db, collectionPath, docSnapshot.id));
                count++;
            });

            await Promise.all(deletePromises);

            if (count > 0) {
                console.log(`Deleted ${count} documents from ${collectionPath}`);
            } else {
                console.log(`No documents to delete in ${collectionPath}`);
            }
        };

        // Delete all collections
        await deleteCollection('users');
        await deleteCollection('recycling_stations');
        await deleteCollection('dead_coins');
        await deleteCollection('user_station_interactions');

        // Delete old collections from previous versions if they exist
        await deleteCollection('treasures');
        await deleteCollection('likes');
        await deleteCollection('matches');
        await deleteCollection('blind_boxes');
        await deleteCollection('pvp_matches');

        console.log("Database cleared successfully!");
    } catch (error) {
        console.error("Error clearing database:", error);
    }
};

// Add a small delay to ensure database operations complete
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Main function to populate the database
const seedDatabase = async () => {
    try {
        // Test the database connection first
        await testDbConnection();

        // Ask for confirmation before clearing the database
        console.log("\n⚠️  WARNING: This will clear all existing data in your Firestore database!");
        console.log("Press Ctrl+C within 5 seconds to cancel...");
        await delay(5000);

        // Clear the database before seeding
        await clearDatabase();

        // Create entities in order of dependencies
        const users = await createUsers();
        const stations = await createRecyclingStations(users);
        const deadCoinRecords = await createDeadCoinRecords(users, stations);
        const interactions = await createUserStationInteractions(users, stations);

        console.log("\nDatabase seeded successfully!");
        console.log(`Created ${users.length} users`);
        console.log(`Created ${stations.length} recycling stations`);
        console.log(`Created ${deadCoinRecords.length} dead coin records`);
        console.log(`Created ${interactions.length} user-station interactions`);

        // Add a delay before exiting to ensure all database operations have completed
        await delay(2000);
        console.log("Exiting...");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

// Add event listener for process exit to ensure graceful shutdown
process.on('SIGINT', () => {
    console.log('Caught interrupt signal, exiting...');
    process.exit(0);
});

// Run the seed function
seedDatabase(); 