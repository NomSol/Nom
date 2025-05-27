import { NextRequest, NextResponse } from 'next/server';
import { ref, get, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// GET /api/firebase/matches
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const treasureId = searchParams.get('treasureId');
        const status = searchParams.get('status');

        if (userId && treasureId) {
            // Get specific match
            const matchesRef = ref(db, 'matches');
            const snapshot = await get(matchesRef);

            if (snapshot.exists()) {
                let matchData = null;
                let matchId = null;

                snapshot.forEach((childSnapshot) => {
                    const match = childSnapshot.val();
                    if (match.user_id === userId && match.treasure_id === treasureId) {
                        matchData = match;
                        matchId = childSnapshot.key;
                        return true; // Break the forEach loop
                    }
                    return false;
                });

                if (matchData) {
                    return NextResponse.json({
                        match: {
                            id: matchId,
                            ...matchData
                        }
                    });
                }
            }

            return NextResponse.json({ match: null });
        }
        else if (userId) {
            // Get all matches for a user
            const matchesRef = ref(db, 'matches');
            const snapshot = await get(matchesRef);
            const userMatches = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const match = childSnapshot.val();
                    if (match.user_id === userId && (!status || match.status === status)) {
                        userMatches.push({
                            id: childSnapshot.key,
                            ...match
                        });
                    }
                });
            }

            return NextResponse.json({ matches: userMatches });
        }
        else if (treasureId) {
            // Get all matches for a treasure
            const matchesRef = ref(db, 'matches');
            const snapshot = await get(matchesRef);
            const treasureMatches = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const match = childSnapshot.val();
                    if (match.treasure_id === treasureId && (!status || match.status === status)) {
                        treasureMatches.push({
                            id: childSnapshot.key,
                            ...match
                        });
                    }
                });
            }

            return NextResponse.json({ matches: treasureMatches });
        }
        else {
            // Get all matches, optionally filtered by status
            const matchesRef = ref(db, 'matches');
            const snapshot = await get(matchesRef);
            const matches = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const match = childSnapshot.val();
                    if (!status || match.status === status) {
                        matches.push({
                            id: childSnapshot.key,
                            ...match
                        });
                    }
                });
            }

            return NextResponse.json({ matches });
        }
    } catch (error) {
        console.error('Error fetching matches:', error);
        return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
    }
}

// POST /api/firebase/matches
export async function POST(request: NextRequest) {
    try {
        const { user_id, treasure_id } = await request.json();

        if (!user_id || !treasure_id) {
            return NextResponse.json({
                error: 'User ID and Treasure ID are required'
            }, { status: 400 });
        }

        // Check if the match already exists
        const matchesRef = ref(db, 'matches');
        const snapshot = await get(matchesRef);

        if (snapshot.exists()) {
            let exists = false;
            snapshot.forEach((childSnapshot) => {
                const match = childSnapshot.val();
                if (match.user_id === user_id && match.treasure_id === treasure_id) {
                    exists = true;
                    return true; // Break the forEach loop
                }
                return false;
            });

            if (exists) {
                return NextResponse.json({
                    error: 'Match already exists for this user and treasure'
                }, { status: 400 });
            }
        }

        // Create the match
        const matchId = uuidv4();
        const timestamp = new Date().toISOString();

        const matchData = {
            user_id,
            treasure_id,
            status: 'PENDING',
            created_at: timestamp,
            updated_at: timestamp
        };

        await set(ref(db, `matches/${matchId}`), matchData);

        return NextResponse.json({
            id: matchId,
            ...matchData
        });
    } catch (error) {
        console.error('Error creating match:', error);
        return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
    }
}

// PATCH /api/firebase/matches
export async function PATCH(request: NextRequest) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({
                error: 'Match ID and status are required'
            }, { status: 400 });
        }

        const matchRef = ref(db, `matches/${id}`);
        const snapshot = await get(matchRef);

        if (!snapshot.exists()) {
            return NextResponse.json({
                error: 'Match not found'
            }, { status: 404 });
        }

        const timestamp = new Date().toISOString();

        // Update the match
        await update(matchRef, {
            status,
            updated_at: timestamp
        });

        // If status is COMPLETED, update the treasure as found
        if (status === 'COMPLETED') {
            const match = snapshot.val();
            const treasureRef = ref(db, `treasures/${match.treasure_id}`);

            await update(treasureRef, {
                status: 'FOUND',
                finder_id: match.user_id,
                updated_at: timestamp
            });
        }

        return NextResponse.json({
            id,
            status,
            updated_at: timestamp
        });
    } catch (error) {
        console.error('Error updating match:', error);
        return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
    }
}

// DELETE /api/firebase/matches
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                error: 'Match ID is required'
            }, { status: 400 });
        }

        await remove(ref(db, `matches/${id}`));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting match:', error);
        return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 });
    }
} 