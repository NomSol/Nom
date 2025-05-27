#!/bin/bash

# Create a .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOL
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA9rBubO644uLujowvGgZ88kijyhr6UX1A
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nomnom-103d6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://nomnom-103d6-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nomnom-103d6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nomnom-103d6.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=981324903048
NEXT_PUBLIC_FIREBASE_APP_ID=1:981324903048:web:8618ca311b5ca78093e53d

# Next.js Configuration
NEXT_PUBLIC_FIREBASE_API=http://localhost:3000/api
EOL
fi

# Create the Firebase database schema file
mkdir -p firebase/schema

cat > firebase/schema/database-rules.json << EOL
{
  "rules": {
    "users": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "treasures": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$treasureId": {
        ".read": true,
        ".write": "auth != null && (data.child('creator_id').val() === auth.uid || newData.child('creator_id').val() === auth.uid)"
      }
    },
    "likes": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$likeId": {
        ".read": true,
        ".write": "auth != null && (data.child('user_id').val() === auth.uid || newData.child('user_id').val() === auth.uid)"
      }
    },
    "matches": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$matchId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
EOL

# Create a sample data JSON for import
cat > firebase/schema/sample-data.json << EOL
{
  "users": {
    "user1": {
      "nickname": "User One",
      "avatar_url": null,
      "cath_id": null,
      "ip_location": null,
      "description": "Sample user",
      "email": "user1@example.com",
      "wallet_address": "wallet1",
      "wallet_type": "solana",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  },
  "treasures": {
    "treasure1": {
      "name": "Sample Treasure",
      "description": "This is a sample treasure",
      "points": 10,
      "hint": "Look under the tree",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "status": "ACTIVE",
      "image_url": null,
      "verification_code": "ABC123",
      "creator_id": "user1",
      "finder_id": null,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "likes_count": 0
    }
  },
  "likes": {},
  "matches": {}
}
EOL

# Create firebase API functions
mkdir -p src/app/api/firebase

# Create Firebase API endpoints for users
cat > src/app/api/firebase/users/route.ts << EOL
import { NextRequest, NextResponse } from 'next/server';
import { ref, get, set, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// GET /api/firebase/users
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const nickname = searchParams.get('nickname');
    
    if (email) {
      // Get user by email
      const userRef = query(ref(db, 'users'), orderByChild('email'), equalTo(email));
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((childSnapshot) => {
          users.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return NextResponse.json(users);
      }
      
      return NextResponse.json({ users: [] });
    } 
    else if (nickname) {
      // Get user by nickname
      const userRef = query(ref(db, 'users'), orderByChild('nickname'), equalTo(nickname));
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((childSnapshot) => {
          users.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return NextResponse.json(users);
      }
      
      return NextResponse.json({ users: [] });
    }
    else {
      // Get all users
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = [];
        snapshot.forEach((childSnapshot) => {
          users.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
        return NextResponse.json({ users });
      }
      
      return NextResponse.json({ users: [] });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/firebase/users
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const userData = {
      ...data,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    await set(ref(db, \`users/\${userId}\`), userData);
    
    return NextResponse.json({ 
      id: userId,
      ...userData
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PATCH /api/firebase/users
export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, ...updates } = data;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Find user by email
    const userRef = query(ref(db, 'users'), orderByChild('email'), equalTo(email));
    const snapshot = await get(userRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    let userId = null;
    snapshot.forEach((childSnapshot) => {
      userId = childSnapshot.key;
    });
    
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Update user
    const timestamp = new Date().toISOString();
    const updateData = {
      ...updates,
      updated_at: timestamp
    };
    
    await update(ref(db, \`users/\${userId}\`), updateData);
    
    return NextResponse.json({ 
      id: userId,
      updated_at: timestamp
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
EOL

# Create Firebase API endpoints for treasures
cat > src/app/api/firebase/treasures/route.ts << EOL
import { NextRequest, NextResponse } from 'next/server';
import { ref, get, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

// GET /api/firebase/treasures
export async function GET(request: NextRequest) {
  try {
    const treasuresRef = ref(db, 'treasures');
    const snapshot = await get(treasuresRef);
    
    if (snapshot.exists()) {
      const treasures = [];
      snapshot.forEach((childSnapshot) => {
        treasures.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return NextResponse.json({ treasures });
    }
    
    return NextResponse.json({ treasures: [] });
  } catch (error) {
    console.error('Error fetching treasures:', error);
    return NextResponse.json({ error: 'Failed to fetch treasures' }, { status: 500 });
  }
}

// POST /api/firebase/treasures
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const treasureId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const treasureData = {
      ...data,
      status: data.status || 'ACTIVE',
      likes_count: 0,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    await set(ref(db, \`treasures/\${treasureId}\`), treasureData);
    
    return NextResponse.json({ 
      id: treasureId,
      ...treasureData
    });
  } catch (error) {
    console.error('Error creating treasure:', error);
    return NextResponse.json({ error: 'Failed to create treasure' }, { status: 500 });
  }
}

// PATCH /api/firebase/treasures
export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Treasure ID is required' }, { status: 400 });
    }
    
    const treasureRef = ref(db, \`treasures/\${id}\`);
    const snapshot = await get(treasureRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Treasure not found' }, { status: 404 });
    }
    
    const timestamp = new Date().toISOString();
    const updateData = {
      ...updates,
      updated_at: timestamp
    };
    
    await update(treasureRef, updateData);
    
    return NextResponse.json({ 
      id,
      updated_at: timestamp
    });
  } catch (error) {
    console.error('Error updating treasure:', error);
    return NextResponse.json({ error: 'Failed to update treasure' }, { status: 500 });
  }
}

// DELETE /api/firebase/treasures
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Treasure ID is required' }, { status: 400 });
    }
    
    await remove(ref(db, \`treasures/\${id}\`));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting treasure:', error);
    return NextResponse.json({ error: 'Failed to delete treasure' }, { status: 500 });
  }
}
EOL

echo "Firebase setup files created."
echo "To start using Firebase with your project:"
echo "1. Update your .env file with your Firebase credentials"
echo "2. Run 'npm install firebase uuid' if not already installed"
echo "3. Update your code to use the Firebase API endpoints instead of GraphQL" 