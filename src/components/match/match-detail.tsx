'use client';

import { useEffect, useState } from 'react';
import { useMatch } from '@/hooks/use-match';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, Clock, Trophy, Users } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user';

const formatTime = (ms: number): string => {
  if (!ms) return '00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

interface MatchDetailProps {
  matchId: string;
}

const MatchDetail = ({ matchId }: MatchDetailProps) => {
  const { match, teams, status, loading } = useMatch(matchId);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const { profile } = useUserProfile();
  
  // Find which team the user is on
  const userTeam = profile?.id && match ? 
    (teams?.team1?.players?.[profile.id] ? 'team1' : 
     teams?.team2?.players?.[profile.id] ? 'team2' : null) : null;
  
     useEffect(() => {
      // Early return if conditions aren't met
      if (!match || status !== 'in_progress' || !match.startedAt) {
        setTimeLeft('');
        return;
      }
    
      const startedAt = match.startedAt; // TypeScript knows startedAt is number here
    
      const updateTimer = () => {
        const endTime = startedAt + (60 * 60 * 1000); // 1 hour after start
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
    
        setTimeLeft(formatTime(remaining));
    
        if (remaining <= 0) {
          clearInterval(timerInterval);
        }
      };
    
      // Initial update
      updateTimer();
    
      // Update every second
      const timerInterval = setInterval(updateTimer, 1000);
    
      // Cleanup interval on unmount
      return () => {
        clearInterval(timerInterval);
      };
    }, [match, status]);
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Loading match details...</p>
      </div>
    );
  }
  
  if (!match) {
    return (
      <div className="text-center py-4">
        <p>Match not found</p>
      </div>
    );
  }
  
  // Calculate progress percentage for team filling
  const team1Progress = teams?.team1 ? 
    (teams.team1.currentPlayers / teams.team1.maxPlayers) * 100 : 0;
  
  const team2Progress = teams?.team2 ? 
    (teams.team2.currentPlayers / teams.team2.maxPlayers) * 100 : 0;
  
  // Calculate match progress
  const matchProgress = match.status === 'in_progress' && match.startedAt ? 
    Math.min(100, ((Date.now() - match.startedAt) / (60 * 60 * 1000)) * 100) : 
    (match.status === 'completed' ? 100 : 0);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Match Type: {match.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Status: {match.status}</span>
          {match.status === 'in_progress' && timeLeft && (
            <span className="font-bold">{timeLeft}</span>
          )}
        </div>
      </div>
      
      {match.status === 'in_progress' && (
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Match Time</span>
            <span>{timeLeft} remaining</span>
          </div>
          <Progress value={matchProgress} className="h-2" />
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card className={`overflow-hidden ${userTeam === 'team1' ? 'border-2 border-blue-500' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Team 1</span>
              </div>
              {match.status === 'in_progress' && (
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{teams?.team1?.score || 0}</span>
                </div>
              )}
            </div>
            
            <div className="text-sm mb-1">
              Players: {teams?.team1?.currentPlayers || 0}/{teams?.team1?.maxPlayers || 0}
            </div>
            <Progress value={team1Progress} className="h-2 mb-3" />
            
            <div className="text-sm">
              {teams?.team1?.players ? (
                <div className="space-y-1">
                  {Object.keys(teams.team1.players).length > 0 ? (
                    <ul className="space-y-1">
                      {Object.keys(teams.team1.players).map((playerId) => (
                        <li key={playerId} className="text-sm flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          {playerId === profile?.id ? 'You' : 'Player'}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No players yet</p>
                  )}
                </div>
              ) : (
                <p>No players yet</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className={`overflow-hidden ${userTeam === 'team2' ? 'border-2 border-red-500' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span className="font-semibold">Team 2</span>
              </div>
              {match.status === 'in_progress' && (
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{teams?.team2?.score || 0}</span>
                </div>
              )}
            </div>
            
            <div className="text-sm mb-1">
              Players: {teams?.team2?.currentPlayers || 0}/{teams?.team2?.maxPlayers || 0}
            </div>
            <Progress value={team2Progress} className="h-2 mb-3" />
            
            <div className="text-sm">
              {teams?.team2?.players ? (
                <div className="space-y-1">
                  {Object.keys(teams.team2.players).length > 0 ? (
                    <ul className="space-y-1">
                      {Object.keys(teams.team2.players).map((playerId) => (
                        <li key={playerId} className="text-sm flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          {playerId === profile?.id ? 'You' : 'Player'}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No players yet</p>
                  )}
                </div>
              ) : (
                <p>No players yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {match.status === 'matching' && (
        <div className="text-center text-sm text-gray-500 mt-2">
          Waiting for more players to join...
        </div>
      )}
      
      {match.status === 'in_progress' && (
        <div className="text-center text-sm text-green-600 mt-2 font-medium">
          Match in progress!
        </div>
      )}
      
      {match.status === 'completed' && (
        <div className="text-center mt-4">
          <h3 className="text-lg font-bold">Match Complete</h3>
          <div className="flex justify-center gap-8 mt-2">
            <div className="text-center">
              <div className="text-blue-500 font-bold">Team 1</div>
              <div className="text-2xl font-bold">{teams?.team1?.score || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-red-500 font-bold">Team 2</div>
              <div className="text-2xl font-bold">{teams?.team2?.score || 0}</div>
            </div>
          </div>
          <div className="mt-2 font-medium">
            {teams?.team1 && teams?.team2 ? (
              teams.team1.score > teams.team2.score ? (
                <span className="text-blue-500">Team 1 Wins!</span>
              ) : teams.team2.score > teams.team1.score ? (
                <span className="text-red-500">Team 2 Wins!</span>
              ) : (
                <span>It's a Tie!</span>
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetail;