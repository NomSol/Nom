'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user';
import { useMatchActions, useWaitingMatches, useCurrentMatch, useCheckMatchStatus } from '@/hooks/use-match';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Timer } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import MatchDetail from './match-detail';

const MatchMaking = () => {
  const router = useRouter();
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const { currentMatchId, setCurrentMatch, clearCurrentMatch } = useCurrentMatch();
  const { createMatch, addTeamMember, updateTeamPlayers, leaveMatch, deleteMatch } = useMatchActions();
  
  // 修改匹配类型的构造
  const matchType = !isMatching && selectedSize ? `${selectedSize}v${selectedSize}` : '';
  const { data: waitingMatches, isLoading: isLoadingMatches } = useWaitingMatches(matchType);

  // 检查当前用户是否已在匹配中
  const checkExistingMatch = useCallback(async () => {
    if (!profile?.id || !waitingMatches) return;

    const existingMatch = waitingMatches.find(match => 
      Array.isArray(match.match_teams) && 
      match.match_teams.some(team =>
        Array.isArray(team.match_members) &&
        team.match_members.some(member => member.user_id === profile.id)
      )
    );

    if (existingMatch) {
      console.log('Found existing match:', existingMatch.id);
      setIsMatching(true);
      setCurrentMatch(existingMatch.id);
      setSelectedSize(parseInt(existingMatch.match_type.split('v')[0]));
      return true;
    }
    return false;
  }, [profile?.id, waitingMatches, setCurrentMatch]);

  // 初始化时检查现有匹配
  useEffect(() => {
    checkExistingMatch();
  }, [checkExistingMatch]);

  // 检查匹配状态
  const { data: matchStatus } = useCheckMatchStatus(currentMatchId);

  // 监听匹配状态变化
  useEffect(() => {
    if (matchStatus?.treasure_matches_by_pk) {
      const status = matchStatus.treasure_matches_by_pk.status;
      if (status === 'matching') {
        setIsMatching(true);
      } else if (status === 'cancelled' || status === 'finished') {
        setIsMatching(false);
        clearCurrentMatch();
        setSelectedSize(null);
      }
    }
  }, [matchStatus, clearCurrentMatch]);

  // 组件清理
  useEffect(() => {
    const cleanup = () => {
      setIsMatching(false);
      clearCurrentMatch();
      setSelectedSize(null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', cleanup);
      return () => {
        window.removeEventListener('beforeunload', cleanup);
        if (isMatching) {
          cleanup();
        }
      };
    }
  }, [isMatching, clearCurrentMatch]);

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
    return !isMatching && waitingMatches?.some(m =>
      m.match_type === `${size}v${size}` &&
      Array.isArray(m.match_teams) &&
      m.match_teams.some(t => t.current_players < t.max_players)
    );
  };

  const currentMatch = waitingMatches?.find(match => 
    Array.isArray(match.match_teams) && 
    match.match_teams.some(team =>
      Array.isArray(team.match_members) &&
      team.match_members.some(member => member.user_id === profile?.id)
    )
  );

  const isCreator = currentMatch && 
    Array.isArray(currentMatch.match_teams) && 
    currentMatch.match_teams.some(team =>
      Array.isArray(team.match_members) &&
      team.match_members.length > 0 &&
      team.match_members[0].user_id === profile?.id
    );

  const handleCancelMatch = async () => {
    if (!currentMatch || !profile) return;

    try {
      if (isCreator) {
        await deleteMatch.mutateAsync(currentMatch.id);
      } else {
        const team = Array.isArray(currentMatch.match_teams) &&
          currentMatch.match_teams.find(team =>
            Array.isArray(team.match_members) &&
            team.match_members.some(member => member.user_id === profile.id)
          );

        if (team) {
          await leaveMatch.mutateAsync({
            match_id: currentMatch.id,
            user_id: profile.id
          });

          await updateTeamPlayers.mutateAsync({
            team_id: team.id,
            current_players: Math.max(0, team.current_players - 1)
          });
        }
      }

      clearCurrentMatch();
      setIsMatching(false);
      setSelectedSize(null);
      router.push('/main/match');
    } catch (error) {
      console.error('Failed to cancel match:', error);
      setError('Failed to cancel match, please try again');
    }
  };

  const handleMatchStart = async (size: number) => {
    try {
      if (isMatching || currentMatch) {
        setError('You are already in a match, please leave the current match first');
        return;
      }

      if (!profile) {
        setError('Please log in first');
        return;
      }

      setError(null);
      setSelectedSize(size);
      const newMatchType = `${size}v${size}`;

      setIsMatching(true);

      const availableMatch = waitingMatches?.find(match => 
        Array.isArray(match.match_teams) &&
        match.match_teams.some(team =>
          team.current_players < team.max_players &&
          Array.isArray(team.match_members) &&
          !team.match_members.some(member => member.user_id === profile.id)
        )
      );

      if (availableMatch && Array.isArray(availableMatch.match_teams)) {
        const teamToJoin = availableMatch.match_teams
          .filter(team => team.current_players < team.max_players)
          .sort((a, b) => a.current_players - b.current_players)[0];

        if (teamToJoin) {
          try {
            await addTeamMember.mutateAsync({
              object: {
                match_id: availableMatch.id,
                team_id: teamToJoin.id,
                user_id: profile.id
              }
            });

            await updateTeamPlayers.mutateAsync({
              team_id: teamToJoin.id,
              current_players: teamToJoin.current_players + 1
            });

            setCurrentMatch(availableMatch.id);
          } catch (error) {
            if (error instanceof Error && error.message === 'Team is full') {
              setError('This team is already full, please try another match');
              setIsMatching(false);
            } else {
              throw error;
            }
          }
        }
      } else {
        const result = await createMatch.mutateAsync({
          object: {
            match_type: newMatchType,
            required_players_per_team: size,
            user_id: profile.id
          }
        });

        if (result?.id) {
          setCurrentMatch(result.id);
        } else {
          throw new Error('Failed to create match');
        }
      }
    } catch (error) {
      console.error('Failed to start/join match:', error);
      setIsMatching(false);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Match failed, please try again');
      }
    }
  };

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

          {isMatching || currentMatch ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Currently Matching</h3>
                {currentMatch && (
                  <p className="text-gray-500">
                    {currentMatch.match_type} - Waiting for players to join
                    ({Array.isArray(currentMatch.match_teams) ? 
                      currentMatch.match_teams.reduce((sum, team) => sum + (team.current_players || 0), 0) : 0}/
                     {Array.isArray(currentMatch.match_teams) ? 
                      currentMatch.match_teams.reduce((sum, team) => sum + (team.max_players || 0), 0) : 0})
                  </p>
                )}
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={leaveMatch.isPending || deleteMatch.isPending}
                  >
                    {leaveMatch.isPending || deleteMatch.isPending ? 'Canceling...' : 'Cancel Match'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Cancel Match?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {isCreator
                        ? 'As the creator, canceling will end the entire match'
                        : 'You will exit the current match'
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelMatch}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {currentMatchId && <MatchDetail matchId={currentMatchId} />}
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
                    disabled={isMatching || createMatch.isPending || addTeamMember.isPending}
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

              {(createMatch.isPending || addTeamMember.isPending) && (
                <div className="text-center py-4">
                  <Timer className="animate-spin h-6 w-6 mx-auto mb-2" />
                  <p>Matching...</p>
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