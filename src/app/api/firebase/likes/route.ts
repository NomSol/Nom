import { NextRequest, NextResponse } from 'next/server';
import { ref, get, set, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// GET /api/firebase/likes
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const treasureId = searchParams.get('treasureId');

        if (userId && treasureId) {
            // Check if user has liked a specific treasure
            const likesRef = ref(db, 'likes');
            const snapshot = await get(likesRef);

            if (snapshot.exists()) {
                let found = false;
                let likeId = null;

                snapshot.forEach((childSnapshot) => {
                    const like = childSnapshot.val();
                    if (like.user_id === userId && like.treasure_id === treasureId) {
                        found = true;
                        likeId = childSnapshot.key;
                        return true; // Break the forEach loop
                    }
                    return false;
                });

                if (found) {
                    return NextResponse.json({ liked: true, id: likeId });
                }
            }

            return NextResponse.json({ liked: false });
        }
        else if (userId) {
            // Get all likes by a user
            const likesRef = ref(db, 'likes');
            const snapshot = await get(likesRef);
            const userLikes = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const like = childSnapshot.val();
                    if (like.user_id === userId) {
                        userLikes.push({
                            id: childSnapshot.key,
                            ...like
                        });
                    }
                });
            }

            return NextResponse.json({ likes: userLikes });
        }
        else if (treasureId) {
            // Get all likes for a treasure
            const likesRef = ref(db, 'likes');
            const snapshot = await get(likesRef);
            const treasureLikes = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const like = childSnapshot.val();
                    if (like.treasure_id === treasureId) {
                        treasureLikes.push({
                            id: childSnapshot.key,
                            ...like
                        });
                    }
                });
            }

            return NextResponse.json({ likes: treasureLikes });
        }
        else {
            // Get all likes
            const likesRef = ref(db, 'likes');
            const snapshot = await get(likesRef);
            const likes = [];

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    likes.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
            }

            return NextResponse.json({ likes });
        }
    } catch (error) {
        console.error('Error fetching likes:', error);
        return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
    }
}

// POST /api/firebase/likes
export async function POST(request: NextRequest) {
    try {
        const { user_id, treasure_id } = await request.json();

        if (!user_id || !treasure_id) {
            return NextResponse.json({
                error: 'User ID and Treasure ID are required'
            }, { status: 400 });
        }

        // Check if the like already exists
        const likesRef = ref(db, 'likes');
        const snapshot = await get(likesRef);

        if (snapshot.exists()) {
            let exists = false;
            snapshot.forEach((childSnapshot) => {
                const like = childSnapshot.val();
                if (like.user_id === user_id && like.treasure_id === treasure_id) {
                    exists = true;
                    return true; // Break the forEach loop
                }
                return false;
            });

            if (exists) {
                return NextResponse.json({
                    error: 'User has already liked this treasure'
                }, { status: 400 });
            }
        }

        // Create the like
        const likeId = uuidv4();
        const timestamp = new Date().toISOString();

        const likeData = {
            user_id,
            treasure_id,
            created_at: timestamp
        };

        await set(ref(db, `likes/${likeId}`), likeData);

        // Update the likes_count on the treasure
        const treasureRef = ref(db, `treasures/${treasure_id}`);
        const treasureSnapshot = await get(treasureRef);

        if (treasureSnapshot.exists()) {
            const treasure = treasureSnapshot.val();
            const currentLikes = treasure.likes_count || 0;

            await update(treasureRef, {
                likes_count: currentLikes + 1
            });
        }

        return NextResponse.json({
            id: likeId,
            ...likeData
        });
    } catch (error) {
        console.error('Error creating like:', error);
        return NextResponse.json({ error: 'Failed to create like' }, { status: 500 });
    }
}

// DELETE /api/firebase/likes
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const treasureId = searchParams.get('treasureId');

        if (!userId || !treasureId) {
            return NextResponse.json({
                error: 'User ID and Treasure ID are required'
            }, { status: 400 });
        }

        // Find the like
        let likeId = null;
        const likesRef = ref(db, 'likes');
        const snapshot = await get(likesRef);

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const like = childSnapshot.val();
                if (like.user_id === userId && like.treasure_id === treasureId) {
                    likeId = childSnapshot.key;
                    return true; // Break the forEach loop
                }
                return false;
            });
        }

        if (!likeId) {
            return NextResponse.json({
                error: 'Like not found'
            }, { status: 404 });
        }

        // Delete the like
        await remove(ref(db, `likes/${likeId}`));

        // Update the likes_count on the treasure
        const treasureRef = ref(db, `treasures/${treasureId}`);
        const treasureSnapshot = await get(treasureRef);

        if (treasureSnapshot.exists()) {
            const treasure = treasureSnapshot.val();
            const currentLikes = treasure.likes_count || 0;

            if (currentLikes > 0) {
                await update(treasureRef, {
                    likes_count: currentLikes - 1
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting like:', error);
        return NextResponse.json({ error: 'Failed to delete like' }, { status: 500 });
    }
} 