"use client";

import { useState } from 'react';
import { useUserProfile } from '@/hooks/use-user';
import { useMatchActions, useWaitingMatches } from '@/hooks/use-match';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Timer } from 'lucide-react';
// import type { UserProfile } from '@/types/user';

interface MatchMakingProps {
  onMatchStart: (matchId: string) => void;
}

const MatchMaking = ({ onMatchStart }: MatchMakingProps) => {
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { createMatch, addTeamMember, updateTeamPlayers } = useMatchActions();
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
      if (!profile) {
        setError('请先登录');
        return;
      }

      setError(null);
      const matchType = `${size}v${size}`;

      // 查找可加入的对局
      const availableMatch = waitingMatches?.find(match => {
        // 检查是否有可加入的队伍且玩家未在此对局中
        return match.match_teams.some(team => 
          team.current_players < team.max_players &&
          !team.match_members.some(member => member.user_id === profile.id)
        );
      });

      if (availableMatch) {
        // 找到人数最少的队伍
        const teamToJoin = availableMatch.match_teams
          .filter(team => team.current_players < team.max_players)
          .sort((a, b) => a.current_players - b.current_players)[0];

        if (teamToJoin) {
          // 加入队伍
          await addTeamMember.mutateAsync({
            object: {
              match_id: availableMatch.id,
              team_id: teamToJoin.id,
              user_id: profile.id
            }
          });

          // 更新队伍人数
          await updateTeamPlayers.mutateAsync({
            team_id: teamToJoin.id,
            current_players: teamToJoin.current_players + 1
          });

          onMatchStart(availableMatch.id);
        }
      } else {
        // 创建新对局
        const result = await createMatch.mutateAsync({
          object: {
            match_type: matchType,
            required_players_per_team: size
          }
        });

        if (result?.id) {
          onMatchStart(result.id);
        } else {
          throw new Error('创建对局失败');
        }
      }
    } catch (error) {
      console.error('Failed to start/join match:', error);
      setError('匹配失败，请重试');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">寻宝对战</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
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

          <div className="text-sm text-gray-500 text-center">
            选择对战类型开始匹配
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchMaking;