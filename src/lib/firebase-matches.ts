// src/lib/firebase-matches.ts
import { ref, set, get, update, remove, onValue, off, push, serverTimestamp, increment } from "firebase/database";
import { db } from "@/lib/firebase";

// Types
export interface MatchTeam {
  currentPlayers: number;
  maxPlayers: number;
  players: Record<string, boolean>;
  score: number;
}

export interface Match {
  id: string;
  type: string;
  status: 'matching' | 'in_progress' | 'completed';
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  teams: {
    team1: MatchTeam;
    team2: MatchTeam;
  };
}

// Firebase paths
const MATCHES_PATH = 'matches';
const USER_MATCHES_PATH = 'user-matches';

// Create a new match
export const createMatch = async (matchType: string, userId: string): Promise<string> => {
  try {
    const matchesRef = ref(db, MATCHES_PATH);
    const newMatchRef = push(matchesRef);
    const matchId = newMatchRef.key;
    
    if (!matchId) {
      throw new Error('Failed to generate match ID');
    }
    
    // Parse match size from type (e.g., "2v2" -> 2)
    const size = parseInt(matchType.split('v')[0]);
    
    // Create match data
    const matchData = {
      type: matchType,
      status: 'matching',
      createdAt: serverTimestamp(),
      teams: {
        team1: {
          currentPlayers: 1, // Starting with 1 player (the creator)
          maxPlayers: size,
          players: { [userId]: true },
          score: 0
        },
        team2: {
          currentPlayers: 0,
          maxPlayers: size,
          players: {},
          score: 0
        }
      }
    };
    
    // Save the match
    await set(ref(db, `${MATCHES_PATH}/${matchId}`), matchData);
    
    // Associate the match with the user
    await set(ref(db, `${USER_MATCHES_PATH}/${userId}`), { currentMatchId: matchId });
    
    return matchId;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

// Get waiting matches of specific type
export const getWaitingMatches = async (matchType: string): Promise<Match[]> => {
  try {
    const matchesRef = ref(db, MATCHES_PATH);
    const snapshot = await get(matchesRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const matches: Match[] = [];
    snapshot.forEach((childSnapshot) => {
      const match = { id: childSnapshot.key, ...childSnapshot.val() } as Match;
      
      // Filter for only matching status and correct type
      if (match.status === 'matching' && match.type === matchType) {
        // Check if there's room in any team
        const team1Full = match.teams.team1.currentPlayers >= match.teams.team1.maxPlayers;
        const team2Full = match.teams.team2.currentPlayers >= match.teams.team2.maxPlayers;
        
        if (!team1Full || !team2Full) {
          matches.push(match);
        }
      }
    });
    
    return matches;
  } catch (error) {
    console.error('Error getting waiting matches:', error);
    throw error;
  }
};

// Check if user is already in a match
export const getUserCurrentMatch = async (userId: string): Promise<string | null> => {
  try {
    const userMatchRef = ref(db, `${USER_MATCHES_PATH}/${userId}`);
    const snapshot = await get(userMatchRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return data.currentMatchId || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking user match:', error);
    throw error;
  }
};

// Join an existing match
export const joinMatch = async (matchId: string, userId: string): Promise<void> => {
  try {
    const matchRef = ref(db, `${MATCHES_PATH}/${matchId}`);
    const snapshot = await get(matchRef);
    
    if (!snapshot.exists()) {
      throw new Error('Match not found');
    }
    
    const match = snapshot.val() as Omit<Match, 'id'>;
    
    // Determine which team to join
    let teamToJoin: 'team1' | 'team2';
    
    if (match.teams.team1.currentPlayers < match.teams.team1.maxPlayers) {
      teamToJoin = 'team1';
    } else if (match.teams.team2.currentPlayers < match.teams.team2.maxPlayers) {
      teamToJoin = 'team2';
    } else {
      throw new Error('Match is full');
    }
    
    // Update the team
    const updates: Record<string, any> = {};
    updates[`${MATCHES_PATH}/${matchId}/teams/${teamToJoin}/currentPlayers`] = match.teams[teamToJoin].currentPlayers + 1;
    updates[`${MATCHES_PATH}/${matchId}/teams/${teamToJoin}/players/${userId}`] = true;
    updates[`${USER_MATCHES_PATH}/${userId}/currentMatchId`] = matchId;
    
    await update(ref(db), updates);
    
    // Check if match should start (both teams full)
    await checkMatchStart(matchId);
  } catch (error) {
    console.error('Error joining match:', error);
    throw error;
  }
};

// Leave a match
export const leaveMatch = async (matchId: string, userId: string): Promise<void> => {
  try {
    const matchRef = ref(db, `${MATCHES_PATH}/${matchId}`);
    const snapshot = await get(matchRef);
    
    if (!snapshot.exists()) {
      throw new Error('Match not found');
    }
    
    const match = snapshot.val() as Omit<Match, 'id'>;
    
    // Find which team the user is in
    let userTeam: 'team1' | 'team2' | null = null;
    
    if (match.teams.team1.players[userId]) {
      userTeam = 'team1';
    } else if (match.teams.team2.players[userId]) {
      userTeam = 'team2';
    }
    
    if (!userTeam) {
      throw new Error('User not found in match');
    }
    
    // If the match is in progress, we can't leave
    if (match.status === 'in_progress') {
      throw new Error('Cannot leave a match in progress');
    }
    
    const updates: Record<string, any> = {};
    
    // If we're the only player, delete the match
    const isLastPlayer = 
      match.teams.team1.currentPlayers + match.teams.team2.currentPlayers === 1;
    
    if (isLastPlayer) {
      // Delete the entire match
      await remove(matchRef);
    } else {
      // Update the team
      updates[`${MATCHES_PATH}/${matchId}/teams/${userTeam}/currentPlayers`] = match.teams[userTeam].currentPlayers - 1;
      updates[`${MATCHES_PATH}/${matchId}/teams/${userTeam}/players/${userId}`] = null;
    }
    
    // Remove user from the match
    updates[`${USER_MATCHES_PATH}/${userId}/currentMatchId`] = null;
    
    await update(ref(db), updates);
  } catch (error) {
    console.error('Error leaving match:', error);
    throw error;
  }
};

// Check if match should start (both teams full)
export const checkMatchStart = async (matchId: string): Promise<void> => {
  try {
    const matchRef = ref(db, `${MATCHES_PATH}/${matchId}`);
    const snapshot = await get(matchRef);
    
    if (!snapshot.exists()) {
      return;
    }
    
    const match = snapshot.val() as Omit<Match, 'id'>;
    
    if (match.status !== 'matching') {
      return;
    }
    
    const team1Full = match.teams.team1.currentPlayers >= match.teams.team1.maxPlayers;
    const team2Full = match.teams.team2.currentPlayers >= match.teams.team2.maxPlayers;
    
    if (team1Full && team2Full) {
      // Start the match
      const updates: Record<string, any> = {};
      updates[`${MATCHES_PATH}/${matchId}/status`] = 'in_progress';
      updates[`${MATCHES_PATH}/${matchId}/startedAt`] = serverTimestamp();
      
      await update(ref(db), updates);
      
      // Set auto-end timer (1 hour)
      setTimeout(() => {
        endMatch(matchId).catch(console.error);
      }, 60 * 60 * 1000);
    }
  } catch (error) {
    console.error('Error checking match start:', error);
  }
};

// End a match
export const endMatch = async (matchId: string): Promise<void> => {
  try {
    const matchRef = ref(db, `${MATCHES_PATH}/${matchId}`);
    const snapshot = await get(matchRef);
    
    if (!snapshot.exists()) {
      return;
    }
    
    const match = snapshot.val() as Omit<Match, 'id'>;
    
    if (match.status !== 'in_progress') {
      return;
    }
    
    // Update match status
    const updates: Record<string, any> = {};
    updates[`${MATCHES_PATH}/${matchId}/status`] = 'completed';
    updates[`${MATCHES_PATH}/${matchId}/endedAt`] = serverTimestamp();
    
    await update(ref(db), updates);
    
    // Clear user-match associations
    const team1Players = Object.keys(match.teams.team1.players);
    const team2Players = Object.keys(match.teams.team2.players);
    
    for (const userId of [...team1Players, ...team2Players]) {
      await set(ref(db, `${USER_MATCHES_PATH}/${userId}/currentMatchId`), null);
    }
  } catch (error) {
    console.error('Error ending match:', error);
  }
};

// Add points to a team (when treasure is found)
export const addTeamPoints = async (
  matchId: string, 
  teamNumber: 1 | 2, 
  points: number
): Promise<void> => {
  try {
    const teamKey = teamNumber === 1 ? 'team1' : 'team2';
    const scoreRef = ref(db, `${MATCHES_PATH}/${matchId}/teams/${teamKey}/score`);
    
    await update(scoreRef, increment(points));
  } catch (error) {
    console.error('Error adding points:', error);
    throw error;
  }
};