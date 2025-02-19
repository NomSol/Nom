'use client';

import { useMatch } from '@/hooks/use-match';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Timer, Trophy } from 'lucide-react';
import { useEffect } from 'react';

interface MatchControllerProps {
  matchId: string;
  onMatchEnd?: () => void;
}

export default function MatchController({ matchId, onMatchEnd }: MatchControllerProps) {
  const { data: match, error, isLoading } = useMatch(matchId);

  // Monitor match end
  useEffect(() => {
    if (match?.status === 'finished') {
      onMatchEnd?.();
    }
  }, [match?.status, onMatchEnd]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>Loading match information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || 'Failed to load match information'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!match) return null;

  // Format time display
  const formatMatchTime = () => {
    if (!match.end_time || match.status !== 'playing') return null;
    const endTime = new Date(match.end_time);
    const now = new Date();
    const diffSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderTeamScores = () => (
    <div className="grid grid-cols-2 gap-4">
      {match.match_teams.map((team) => (
        <div
          key={team.id}
          className={`p-4 rounded-lg ${
            match.winner_team_id === team.id
              ? 'bg-green-100 dark:bg-green-900'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          <div className="font-bold">Team {team.team_number}</div>
          <div className="text-2xl font-bold">{team.total_score || 0}</div>
          <div className="text-sm text-gray-500">
            {team.current_players}/{team.max_players} Players
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Match Status</h3>
          <Badge variant={match.status === 'playing' ? 'default' : 'secondary'}>
            {match.status === 'playing' ? 'In Progress' : 
             match.status === 'finished' ? 'Finished' : 
             match.status === 'matching' ? 'Matching' : match.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {match.status === 'playing' && (
            <div className="text-center">
              <div className="text-3xl font-bold font-mono">
                {formatMatchTime() ?? '--:--'}
              </div>
              <p className="text-sm text-gray-500">Time Remaining</p>
            </div>
          )}

          {renderTeamScores()}

          {match.status === 'finished' && match.winner_team_id && (
            <div className="text-center mt-4">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="text-xl font-bold">
                Team {match.match_teams.find(t => t.id === match.winner_team_id)?.team_number} Wins!
              </h4>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}