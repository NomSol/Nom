'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from '@/hooks/use-user';
import { useCurrentMatch, useMatch, useWaitingMatches, useMatchActions } from '@/hooks/use-match';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Timer } from 'lucide-react';
import MatchDetail from './match-detail';

const MatchMaking = () => {
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const { currentMatchId, setCurrentMatch, clearCurrentMatch } = useCurrentMatch();
  const { createMatch, joinMatch, leaveMatch, checkUserMatch, getWaitingMatches } = useMatchActions();
  
  // Get match type string from selected size
  const matchType = selectedSize ? `${selectedSize}v${selectedSize}` : '';
  
  // Listen for matches of selected type
  const { matches: waitingMatches, loading: isLoadingMatches } = useWaitingMatches(matchType);
  
  // Get current match data if we have a match ID
  const { match: currentMatchData, loading: isLoadingMatch } = useMatch(currentMatchId);

  // Debug logging
  useEffect(() => {
    console.log('Matching state:', {
      isMatching,
      selectedSize,
      matchType,
      currentMatchId,
      hasWaitingMatches: Boolean(waitingMatches?.length),
      waitingMatchesCount: waitingMatches?.length
    });

    if (waitingMatches?.length) {
      console.log('Available matches:', waitingMatches.map(match => ({
        id: match.id,
        type: match.type,
        status: match.status,
        teams: {
          team1: {
            current: match.teams.team1.currentPlayers,
            max: match.teams.team1.maxPlayers,
            playerCount: Object.keys(match.teams.team1.players || {}).length
          },
          team2: {
            current: match.teams.team2.currentPlayers,
            max: match.teams.team2.maxPlayers,
            playerCount: Object.keys(match.teams.team2.players || {}).length
          }
        }
      })));
    }
  }, [isMatching, selectedSize, matchType, currentMatchId, waitingMatches]);

  // Check if user is already in a match on component mount
  useEffect(() => {
    const verifyExistingMatch = async () => {
      if (!profile?.id) {
        console.log('No profile ID found for verification');
        return;
      }

      try {
        console.log('Checking if user is already in a match:', profile.id);
        const existingMatchId = await checkUserMatch(profile.id);
        
        if (existingMatchId) {
          console.log('User is already in match:', existingMatchId);
          setCurrentMatch(existingMatchId);
          setIsMatching(true);
        } else {
          console.log('User is not in any match');
        }
      } catch (error) {
        console.error('Error checking existing match:', error);
      }
    };

    verifyExistingMatch();
  }, [profile?.id, checkUserMatch, setCurrentMatch]);

  // Update selected size when match data changes
  useEffect(() => {
    if (currentMatchData && !selectedSize) {
      const size = parseInt(currentMatchData.type.split('v')[0]);
      setSelectedSize(size);
    }
  }, [currentMatchData, selectedSize]);

  const handleMatchStart = async (size: number) => {
    try {
      if (!profile?.id) {
        console.log('No profile ID found, cannot start match');
        setError('Please log in first');
        return;
      }

      setError(null);
      setSelectedSize(size);
      const newMatchType = `${size}v${size}`;
      
      // Check if user is already in a match
      const existingMatchId = await checkUserMatch(profile.id);
      if (existingMatchId) {
        setError('You are already in a match');
        setCurrentMatch(existingMatchId);
        setIsMatching(true);
        return;
      }

      // Get waiting matches of this type
      const availableMatches = await getWaitingMatches(newMatchType);
      console.log('Available matches:', availableMatches);

      setIsMatching(true);

      if (availableMatches.length > 0) {
        // Find a match with room
        const matchToJoin = availableMatches[0];
        console.log('Joining existing match:', matchToJoin.id);
        
        await joinMatch(matchToJoin.id, profile.id);
        setCurrentMatch(matchToJoin.id);
      } else {
        // Create a new match
        console.log('Creating new match of type:', newMatchType);
        const newMatchId = await createMatch(newMatchType, profile.id);
        setCurrentMatch(newMatchId);
      }
    } catch (error) {
      console.error('Match start/join failed:', error);
      setIsMatching(false);
      setSelectedSize(null);
      setError(error instanceof Error ? error.message : 'Match failed, please try again');
    }
  };

  const handleCancelMatch = async () => {
    if (!currentMatchId || !profile?.id) return;
  
    try {
      console.log('Leaving match:', currentMatchId);
      await leaveMatch(currentMatchId, profile.id);
      
      setIsMatching(false);
      setSelectedSize(null);
      clearCurrentMatch();
    } catch (error) {
      console.error('Failed to cancel match:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel match, please try again');
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="text-center py-8">
        <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Please log in first</AlertDescription>
      </Alert>
    );
  }

  const isMatchAvailable = (size: number) => {
    return waitingMatches?.some(match => match.type === `${size}v${size}`);
  };

  const shouldShowMatchDetail = Boolean(currentMatchId) || isMatching;
  const isLoadingMatchData = isLoadingMatch && currentMatchId;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Treasure Hunt Battle</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {shouldShowMatchDetail ? (
            <div className="space-y-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleCancelMatch}
              >
                Cancel Match
              </Button>

              {isLoadingMatchData ? (
                <div className="text-center py-8">
                  <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
                  <p>Loading match information...</p>
                </div>
              ) : currentMatchId ? (
                <MatchDetail matchId={currentMatchId} />
              ) : null}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 5].map((size) => (
                  <Button
                    key={size}
                    onClick={() => handleMatchStart(size)}
                    variant={selectedSize === size ? "default" : "outline"}
                    className="h-24 relative"
                    disabled={isMatching || isLoadingMatches}
                  >
                    <div className="text-center">
                      <Users className="h-8 w-8 mb-2 mx-auto" />
                      <span className="block">{size} vs {size}</span>
                      {isMatchAvailable(size) && (
                        <span className="absolute bottom-2 left-0 right-0 text-xs text-green-500">
                          Match available
                        </span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>

              {isLoadingMatches && (
                <div className="text-center py-4">
                  <Timer className="animate-spin h-6 w-6 mx-auto mb-2" />
                  <p>Loading available matches...</p>
                </div>
              )}

              <div className="text-sm text-gray-500 text-center">
                Select match type to start matching
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchMaking;