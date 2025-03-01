// src/hooks/use-match.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { 
  Match, 
  createMatch as createMatchFn, 
  getWaitingMatches as getWaitingMatchesFn,
  getUserCurrentMatch as getUserCurrentMatchFn,
  joinMatch as joinMatchFn,
  leaveMatch as leaveMatchFn
} from '@/lib/firebase-matches';

// Hook for managing current match ID
export function useCurrentMatch() {
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

  const clearCurrentMatch = useCallback(() => {
    setCurrentMatchId(null);
  }, []);

  return {
    currentMatchId,
    setCurrentMatch: setCurrentMatchId,
    clearCurrentMatch
  };
}

// Hook for listening to a specific match
export function useMatch(matchId: string | null) {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!matchId) {
      setMatch(null);
      return;
    }

    setLoading(true);
    setError(null);

    const matchRef = ref(db, `matches/${matchId}`);
    
    const handleMatchUpdate = (snapshot: any) => {
      if (snapshot.exists()) {
        setMatch({
          id: matchId,
          ...snapshot.val()
        });
      } else {
        setMatch(null);
      }
      setLoading(false);
    };

    const handleError = (err: Error) => {
      console.error('Error loading match:', err);
      setError(err);
      setLoading(false);
    };

    // Listen for match updates
    onValue(matchRef, handleMatchUpdate, handleError);

    // Clean up listener
    return () => {
      off(matchRef, 'value', handleMatchUpdate);
    };
  }, [matchId]);

  // Get team information
  const teams = useMemo(() => {
    if (!match) return { team1: null, team2: null };
    
    return {
      team1: match.teams.team1,
      team2: match.teams.team2
    };
  }, [match]);

  // Get match status
  const status = useMemo(() => match?.status || null, [match]);

  // Calculate remaining time (if match is in progress)
  const remainingTime = useMemo(() => {
    if (!match || match.status !== 'in_progress' || !match.startedAt) {
      return null;
    }

    const endTime = match.startedAt + (60 * 60 * 1000); // 1 hour after start
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    
    return remaining;
  }, [match]);

  return {
    match,
    teams,
    status,
    remainingTime,
    loading,
    error
  };
}

// Hook for searching available matches
export function useWaitingMatches(matchType: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Listen for waiting matches
  useEffect(() => {
    if (!matchType) {
      setMatches([]);
      return;
    }

    setLoading(true);
    setError(null);

    const matchesRef = ref(db, 'matches');
    
    const handleMatchesUpdate = (snapshot: any) => {
      if (snapshot.exists()) {
        const allMatches: Match[] = [];
        
        snapshot.forEach((childSnapshot: any) => {
          const match = childSnapshot.val();
          
          // Only include matches of the requested type that are still in the matching phase
          if (match.type === matchType && match.status === 'matching') {
            // Check if there's room in any team
            const team1Full = match.teams.team1.currentPlayers >= match.teams.team1.maxPlayers;
            const team2Full = match.teams.team2.currentPlayers >= match.teams.team2.maxPlayers;
            
            if (!team1Full || !team2Full) {
              allMatches.push({
                id: childSnapshot.key,
                ...match
              });
            }
          }
        });
        
        setMatches(allMatches);
      } else {
        setMatches([]);
      }
      
      setLoading(false);
    };

    const handleError = (err: Error) => {
      console.error('Error loading waiting matches:', err);
      setError(err);
      setLoading(false);
    };

    // Listen for matches updates
    onValue(matchesRef, handleMatchesUpdate, handleError);

    // Clean up listener
    return () => {
      off(matchesRef, 'value', handleMatchesUpdate);
    };
  }, [matchType]);

  return {
    matches,
    loading,
    error
  };
}

// Hook for match actions (create, join, leave)
export function useMatchActions() {
  // Create a new match
  const createMatch = useCallback(async (matchType: string, userId: string) => {
    try {
      return await createMatchFn(matchType, userId);
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  }, []);

  // Join an existing match
  const joinMatch = useCallback(async (matchId: string, userId: string) => {
    try {
      await joinMatchFn(matchId, userId);
    } catch (error) {
      console.error('Error joining match:', error);
      throw error;
    }
  }, []);

  // Leave a match
  const leaveMatch = useCallback(async (matchId: string, userId: string) => {
    try {
      await leaveMatchFn(matchId, userId);
    } catch (error) {
      console.error('Error leaving match:', error);
      throw error;
    }
  }, []);

  // Check if user is already in a match
  const checkUserMatch = useCallback(async (userId: string) => {
    try {
      return await getUserCurrentMatchFn(userId);
    } catch (error) {
      console.error('Error checking user match:', error);
      throw error;
    }
  }, []);

  // Get waiting matches
  const getWaitingMatches = useCallback(async (matchType: string) => {
    try {
      return await getWaitingMatchesFn(matchType);
    } catch (error) {
      console.error('Error getting waiting matches:', error);
      throw error;
    }
  }, []);

  return {
    createMatch,
    joinMatch,
    leaveMatch,
    checkUserMatch,
    getWaitingMatches
  };
}