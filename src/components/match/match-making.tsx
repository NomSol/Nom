'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user';
import { useMatchActions, useWaitingMatches } from '@/hooks/use-match';
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

const MatchMaking = () => {
  const router = useRouter();
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { createMatch, addTeamMember, updateTeamPlayers, leaveMatch, deleteMatch } = useMatchActions();
  const { data: waitingMatches, isLoading: isLoadingMatches } = useWaitingMatches(
    selectedSize ? `${selectedSize}v${selectedSize}` : ''
  );

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
        <AlertDescription>
          Please log in first
        </AlertDescription>
      </Alert>
    );
  }

    // Get current user's waiting match
    const currentMatch = waitingMatches?.find(match =>
      match.match_teams.some(team =>
        team.match_members.some(member => member.user_id === profile?.id)
      )
    );
  
    // Check if the user is the creator
    const isCreator = currentMatch?.match_teams.some(team =>
      team.match_members.length > 0 &&
      team.match_members[0].user_id === profile?.id
    );

    const handleCancelMatch = async () => {
      if (!currentMatch || !profile) return;
  
      try {
        if (isCreator) {
          // If the user is the creator, delete the entire match
          await deleteMatch.mutateAsync(currentMatch.id);
        } else {
          // If the user is a participant, just remove themselves
          const team = currentMatch.match_teams.find(team =>
            team.match_members.some(member => member.user_id === profile.id)
          );
          
          if (team) {
            await leaveMatch.mutateAsync({
              match_id: currentMatch.id,
              user_id: profile.id
            });
            
            // Update team player count
            await updateTeamPlayers.mutateAsync({
              team_id: team.id,
              current_players: team.current_players - 1
            });
          }
        }
  
        router.push('/main/match');
      } catch (error) {
        console.error('Failed to cancel match:', error);
        setError('Failed to cancel match, please try again');
      }
    };

  const handleMatchStart = async (size: number) => {
    try {
      if (!profile) {
        setError('Please log in first');
        return;
      }

      if (currentMatch) {
        setError('You are already in a match, please leave the current match first');
        return;
      }

      setError(null);
      console.log('Starting match...');
      const matchType = `${size}v${size}`;

      // Find a match to join
      const availableMatch = waitingMatches?.find(match => {
        return match.match_teams.some(team => 
          team.current_players < team.max_players &&
          !team.match_members.some(member => member.user_id === profile.id)
        );
      });

      if (availableMatch) {
        // Find the team with the least number of players
        const teamToJoin = availableMatch.match_teams
          .filter(team => team.current_players < team.max_players)
          .sort((a, b) => a.current_players - b.current_players)[0];

        if (teamToJoin) {
          // Join the team
          await addTeamMember.mutateAsync({
            object: {
              match_id: availableMatch.id,
              team_id: teamToJoin.id,
              user_id: profile.id
            }
          });

          // Update team player count
          await updateTeamPlayers.mutateAsync({
            team_id: teamToJoin.id,
            current_players: teamToJoin.current_players + 1
          });

          router.push(`/main/match/detail`);
        }
      } else {
        // Create a new match
        const result = await createMatch.mutateAsync({
          object: {
            match_type: matchType,
            required_players_per_team: size,
            user_id: profile.id
          }
        });

        if (result?.id) {
          router.push('/main/match/detail');
        } else {
          throw new Error('Failed to create match');
        }
      }
    } catch (error) {
      console.error('Failed to start/join match:', error);
      setError('Match failed, please try again');
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
          
          {currentMatch ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Currently Matching</h3>
                <p className="text-gray-500">
                  {currentMatch.match_type} - Waiting for players to join 
                  ({currentMatch.match_teams.reduce((sum, team) => sum + team.current_players, 0)}/
                  {currentMatch.match_teams.reduce((sum, team) => sum + team.max_players, 0)})
                </p>
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
                    disabled={createMatch.isPending || addTeamMember.isPending}
                  >
                    <div className="text-center">
                      <Users className="h-8 w-8 mb-2 mx-auto" />
                      <span className="block">{size} vs {size}</span>
                      {waitingMatches?.some(m => 
                        m.match_type === `${size}v${size}` && 
                        m.match_teams.some(t => t.current_players < t.max_players)
                      ) && (
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
