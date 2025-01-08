"use client";

import { useState } from 'react';
import { useUserProfile } from '@/hooks/use-user'; 
import { useMatchActions, useWaitingMatches } from '@/hooks/use-match';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Timer } from 'lucide-react';
import type { Match } from '@/types/matches';

interface MatchMakingProps {
  onMatchStart: (matchId: string) => void;
}

const MatchMaking = ({ onMatchStart }: MatchMakingProps) => {
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const { createMatch, addTeamMember } = useMatchActions();
  const { data: waitingMatches, isLoading: isLoadingMatches } = useWaitingMatches(
    selectedSize ? `${selectedSize}v${selectedSize}` : ''
  );

  if (isLoadingProfile) {
    return (
      <div className="text-center py-8">
        <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          请先登录
        </AlertDescription>
      </Alert>
    );
  }

  const handleMatchStart = async (size: number) => {
    try {
      const availableMatch = waitingMatches?.find(match => {
        const totalPlayers = match.match_teams.reduce(
          (sum, team) => sum + team.match_members.length,
          0
        );
        return totalPlayers < size * 2;
      });

      if (availableMatch) {
        const teamToJoin = availableMatch.match_teams.find(
          team => team.match_members.length < size
        );

        if (teamToJoin) {
          await addTeamMember.mutateAsync({
            object: {
              match_id: availableMatch.id,
              team_id: teamToJoin.id,
              user_id: profile.id
            }
          });
          onMatchStart(availableMatch.id);
        }
      } else {
        // 创建新对局
        const result = await createMatch.mutateAsync({
          object: {
            match_type: `${size}v${size}`,
            status: 'matching',
            match_teams: {
              data: [
                { team_number: 1 },
                { team_number: 2 }
              ]
            }
          }
        });

        if (result && result.id && result.match_teams && result.match_teams.length > 0) {
          await addTeamMember.mutateAsync({
            object: {
              match_id: result.id,
              team_id: result.match_teams[0].id,
              user_id: profile.id
            }
          });
          onMatchStart(result.id);
        } else {
          console.error('Failed to create match: invalid result structure');
        }
      }
    } catch (error) {
      console.error('Failed to start/join match:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">寻宝对战</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
                  {waitingMatches?.some(m => m.match_type === `${size}v${size}`) && (
                    <span className="absolute bottom-2 left-0 right-0 text-xs text-green-500">
                      有比赛等待中
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {(createMatch.isPending || addTeamMember.isPending) && (
            <div className="text-center py-4">
              <Timer className="animate-spin h-6 w-6 mx-auto mb-2" />
              <p>正在匹配中...</p>
            </div>
          )}

          {(createMatch.error || addTeamMember.error) && (
            <Alert variant="destructive">
              <AlertDescription>
                匹配失败，请重试
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-500 text-center">
            选择对战类型开始匹配
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchMaking;