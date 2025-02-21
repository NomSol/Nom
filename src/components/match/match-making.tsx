'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user';
import { useMatchActions, useWaitingMatches, useCurrentMatch, useCheckMatchStatus, useMatch } from '@/hooks/use-match';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Timer } from 'lucide-react';
import MatchDetail from './match-detail';
import { MatchingStatus } from './matching-status';

const MatchMaking = () => {
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const { currentMatchId, setCurrentMatch, clearCurrentMatch } = useCurrentMatch();
  const { createMatch, addTeamMember, updateTeamPlayers, leaveMatch, deleteMatch, checkExistingMatch, cancelMatch } = useMatchActions();
  
  // 移除 isMatching 条件，让 subscription 始终能获取到匹配
  const matchType = selectedSize ? `${selectedSize}v${selectedSize}` : '';
  const { data: waitingMatches, isLoading: isLoadingMatches } = useWaitingMatches(matchType);
  const { data: currentMatchData, isLoading: isLoadingMatch } = useMatch(currentMatchId || '');
  const { data: matchStatus } = useCheckMatchStatus(currentMatchId);

  // Debug logging
  useEffect(() => {
    console.log('Matching state:', {
      isMatching,
      selectedSize,
      matchType,
      currentMatchId,
      hasWaitingMatches: Boolean(waitingMatches),
      waitingMatchesCount: waitingMatches?.length
    });

    if (waitingMatches) {
      console.log('Available matches:', waitingMatches.map(match => ({
        id: match.id,
        type: match.match_type,
        status: match.status,
        teams: Array.isArray(match.match_teams) ? match.match_teams.map(team => ({
          id: team.id,
          number: team.team_number,
          current: team.current_players,
          max: team.max_players,
          members: Array.isArray(team.match_members) ? team.match_members.length : 0
        })) : []
      })));
    }
  }, [isMatching, selectedSize, matchType, currentMatchId, waitingMatches]);

  // Verify existing match
const verifyExistingMatch = useCallback(async () => {
  if (!profile?.id) {
    console.log('No profile ID found for verification');
    return false;
  }

  try {
    console.log('Starting existing match verification for user:', profile.id);
    const existingMatch = await checkExistingMatch(profile.id);
    console.log('API existing match check result:', existingMatch);
    
    if (existingMatch) {
      console.log('Found existing match via API:', {
        matchId: existingMatch.id,
        type: existingMatch.match_type,
        status: existingMatch.status
      });
      const matchSize = parseInt(existingMatch.match_type.split('v')[0]);
      setIsMatching(true);
      setSelectedSize(matchSize);
      setCurrentMatch(existingMatch.id);
      return true;
    }

    if (waitingMatches?.length) {
      console.log('Checking waiting matches for user:', {
        userId: profile.id,
        waitingMatchesCount: waitingMatches.length,
        waitingMatches: waitingMatches.map(m => ({
          id: m.id,
          type: m.match_type,
          teams: m.match_teams?.length || 0
        }))
      });

      const matchInWaiting = waitingMatches.find(match => {
        const teams = Array.isArray(match.match_teams) ? match.match_teams : [];
        console.log('Checking match teams:', {
          matchId: match.id,
          teamsCount: teams.length,
          teamsData: teams.map(t => ({
            id: t.id,
            players: t.current_players,
            max: t.max_players,
            members: t.match_members?.length || 0
          }))
        });

        return teams.some(team => {
          const members = Array.isArray(team.match_members) ? team.match_members : [];
          const userInTeam = members.some(member => member.user_id === profile.id);
          console.log('Checking team members:', {
            teamId: team.id,
            membersCount: members.length,
            userInTeam
          });
          return userInTeam;
        });
      });

      if (matchInWaiting) {
        console.log('Found user in waiting match:', {
          matchId: matchInWaiting.id,
          type: matchInWaiting.match_type,
          teams: matchInWaiting.match_teams?.map(t => ({
            id: t.id,
            current: t.current_players,
            max: t.max_players
          }))
        });
        const matchSize = parseInt(matchInWaiting.match_type.split('v')[0]);
        setIsMatching(true);
        setSelectedSize(matchSize);
        setCurrentMatch(matchInWaiting.id);
        return true;
      } else {
        console.log('User not found in any waiting matches');
      }
    } else {
      console.log('No waiting matches to check');
    }

    return false;
  } catch (error) {
    console.error('Error checking existing match:', error);
    return false;
  }
}, [profile?.id, waitingMatches, setCurrentMatch, checkExistingMatch]);

const handleMatchStart = async (size: number) => {
  try {
    if (!profile?.id) {
      console.log('No profile ID found, cannot start match');
      setError('Please log in first');
      return;
    }

    console.log('Starting match process:', {
      size,
      userId: profile.id,
      existingMatches: waitingMatches?.length
    });

    const hasExistingMatch = await verifyExistingMatch();
    if (hasExistingMatch) {
      setError('You are already in a match');
      return;
    }

    setError(null);
    setSelectedSize(size);
    const newMatchType = `${size}v${size}`;

    // 检查等待中的匹配
    if (waitingMatches?.length) {
      console.log('=== Detailed matches examination ===');
      waitingMatches.forEach(match => {
        console.log('Match details:', {
          id: match.id,
          type: match.match_type,
          status: match.status,
          teamsCount: match.match_teams?.length,
          teams: match.match_teams?.map(team => ({
            id: team.id,
            teamNumber: team.team_number,
            currentPlayers: team.current_players,
            maxPlayers: team.max_players,
            membersDetail: team.match_members?.map(member => ({
              id: member.id,
              userId: member.user_id
            }))
          }))
        });
      });
    
      // 筛选符合条件的匹配
      const validMatches = waitingMatches.filter(match => {
        const isMatchValid = 
          match.status === 'matching' &&
          match.match_type === newMatchType &&
          Array.isArray(match.match_teams) &&
          match.match_teams.length > 0;
    
        console.log('Match validation:', {
          matchId: match.id,
          isStatusValid: match.status === 'matching',
          isTypeValid: match.match_type === newMatchType,
          hasTeams: Array.isArray(match.match_teams) && match.match_teams.length > 0,
          isValid: isMatchValid
        });
    
        if (!isMatchValid) return false;
    
        const availableTeam = match.match_teams.find(team => {
          const availability = {
            teamId: team.id,
            hasSpace: team.current_players < team.max_players,
            notJoined: !team.match_members?.some(member => member.user_id === profile.id),
            currentPlayers: team.current_players,
            maxPlayers: team.max_players
          };
          console.log('Team availability check:', availability);
          return availability.hasSpace && availability.notJoined;
        });
    
        return Boolean(availableTeam);
      });
    
      console.log('Valid matches result:', {
        totalMatches: waitingMatches.length,
        validCount: validMatches.length,
        validMatches: validMatches.map(m => ({
          id: m.id,
          teamsCount: m.match_teams.length,
          availableTeams: m.match_teams.filter(t => 
            t.current_players < t.max_players && 
            !t.match_members?.some(member => member.user_id === profile.id)
          ).length
        }))
      });
    
      // 尝试加入匹配
      for (const match of validMatches) {
        // 找到可加入的队伍
        const availableTeams = match.match_teams
          .filter(team => {
            const hasSpace = team.current_players < team.max_players;
            const notInTeam = !team.match_members?.some(member => member.user_id === profile.id);
            return hasSpace && notInTeam;
          })
          .sort((a, b) => a.current_players - b.current_players);

        if (availableTeams.length > 0) {
          const teamToJoin = availableTeams[0];
          
          console.log('Attempting to join team:', {
            matchId: match.id,
            teamId: teamToJoin.id,
            teamNumber: teamToJoin.team_number,
            current: teamToJoin.current_players,
            max: teamToJoin.max_players
          });

          try {
            setIsMatching(true);

            // 先加入成员
            await addTeamMember.mutateAsync({
              object: {
                match_id: match.id,
                team_id: teamToJoin.id,
                user_id: profile.id
              }
            });

            // 再更新人数
            await updateTeamPlayers.mutateAsync({
              team_id: teamToJoin.id,
              current_players: teamToJoin.current_players + 1
            });

            console.log('Successfully joined match:', {
              matchId: match.id,
              teamId: teamToJoin.id,
              teamNumber: teamToJoin.team_number
            });

            setCurrentMatch(match.id);
            return;
          } catch (error) {
            console.error('Failed to join team:', {
              matchId: match.id,
              teamId: teamToJoin.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            continue;
          }
        }
      }

      console.log('No suitable matches found, creating new match');
    }

    // 创建新匹配
    console.log('Creating new match:', {
      type: newMatchType,
      size,
      userId: profile.id
    });

    setIsMatching(true);
    
    const result = await createMatch.mutateAsync({
      object: {
        match_type: newMatchType,
        required_players_per_team: size,
        status: 'matching',
        user_id: profile.id
      }
    });

    if (result?.id) {
      console.log('Successfully created new match:', {
        matchId: result.id,
        type: newMatchType,
        userId: profile.id,
        teams: result.match_teams
      });
      setCurrentMatch(result.id);
    } else {
      throw new Error('Failed to create match');
    }

  } catch (error) {
    console.error('Match start/join failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      size,
      userId: profile.id
    });
    setIsMatching(false);
    setSelectedSize(null);
    setError(error instanceof Error ? error.message : 'Match failed, please try again');
  }
};

  const handleCancelMatch = async () => {
    if (!currentMatchId || !profile) return;
  
    try {
      setIsMatching(false);
      setSelectedSize(null);
      clearCurrentMatch();

      await cancelMatch.mutateAsync({
        matchId: currentMatchId,
        userId: profile.id
      });
    } catch (error) {
      setIsMatching(true);
      setSelectedSize(parseInt(currentMatchData?.match_type?.split('v')[0] || '0'));
      setCurrentMatch(currentMatchId);
      
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
    return !isMatching && waitingMatches?.some(m =>
      m.match_type === `${size}v${size}` &&
      Array.isArray(m.match_teams) &&
      m.match_teams.some(t => t.current_players < t.max_players)
    );
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
                disabled={leaveMatch.isPending || deleteMatch.isPending}
                onClick={handleCancelMatch}
              >
                {leaveMatch.isPending || deleteMatch.isPending ? 'Canceling...' : 'Cancel Match'}
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