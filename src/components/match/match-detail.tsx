'use client';

import { useMatch } from "@/hooks/use-match";
import { useUserProfile } from "@/hooks/use-user";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Timer, Trophy, User, Users } from "lucide-react";

interface MatchDetailProps {
  matchId: string;
}

export default function MatchDetail({ matchId }: MatchDetailProps) {
  const { data: match, isLoading, error } = useMatch(matchId);
  const { profile } = useUserProfile();

  // Get match status display
  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'matching':
        return <Badge variant="secondary">Matching</Badge>;
      case 'playing':
        return <Badge variant="default">In Progress</Badge>;
      case 'finished':
        return <Badge variant="outline">Finished</Badge>;
      default:
        return <Badge variant="secondary">{status || 'Unknown Status'}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>Loading match information...</p>
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

  if (error || !match) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error?.message || 'Match information not found'}
        </AlertDescription>
      </Alert>
    );
  }

  // Ensure match_teams is an array
  const teams = Array.isArray(match.match_teams) ? match.match_teams : [];
  
  // Find the user's team and the opponent team
  const userTeam = teams.find(team => 
    Array.isArray(team.match_members) && team.match_members.some(member => member.user_id === profile.id)
  );

  const otherTeam = teams.find(team => team.id !== userTeam?.id);


  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Match Info Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold">{match.match_type} Match</h2>
            {getStatusDisplay(match.status)}
          </div>
          <p className="text-sm text-gray-500">
            {match.start_time ? `Start Time: ${formatTime(match.start_time)}` : 'Waiting to start'}
          </p>
          {match.end_time && match.status === 'playing' && (
            <p className="text-sm text-gray-500">
              End Time: {formatTime(match.end_time)}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Team Information */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* My Team */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                My Team
                {match.winner_team_id === userTeam?.id && (
                  <Trophy className="w-5 h-5 ml-2 text-yellow-500" />
                )}
              </h3>
              <Badge variant="outline">Total Score: {userTeam?.total_score ?? 0}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userTeam?.match_members?.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{member.user?.nickname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span>{member.individual_score ?? 0} points</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opponent Team */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Opponent Team
                {match.winner_team_id === otherTeam?.id && (
                  <Trophy className="w-5 h-5 ml-2 text-yellow-500" />
                )}
              </h3>
              <Badge variant="outline">Total Score: {otherTeam?.total_score ?? 0}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otherTeam?.match_members?.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span>{member.user?.nickname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span>{member.individual_score ?? 0} points</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treasure Discovery Record */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Discovered Treasures</h3>
        </CardHeader>
        <CardContent>
          {userTeam?.match_discoveries?.length ? (
            <div className="space-y-3">
              {userTeam.match_discoveries.map(discovery => (
                <div
                  key={discovery.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span>{discovery.treasure?.name}</span>
                  <Badge variant="secondary">+{discovery.score ?? 0} points</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No treasures discovered yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}