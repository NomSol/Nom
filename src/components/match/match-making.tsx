"use client";

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
  const { createMatch, addTeamMember, updateTeamPlayers,leaveMatch,deleteMatch } = useMatchActions();
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

  // if (!profile) {
  //   return (
  //     <Alert variant="destructive">
  //       <AlertDescription>
  //         请先登录
  //       </AlertDescription>
  //     </Alert>
  //   );
  // }

    // 获取当前用户的等待中的比赛
    const currentMatch = waitingMatches?.find(match =>
      match.match_teams.some(team =>
        team.match_members.some(member => member.user_id === profile?.id)
      )
    );
  
    // 检查用户是否是创建者
    const isCreator = currentMatch?.match_teams.some(team =>
      team.match_members.length > 0 &&
      team.match_members[0].user_id === profile?.id
    );

    const handleCancelMatch = async () => {
      if (!currentMatch || !profile) return;
  
      try {
        if (isCreator) {
          // 如果是创建者，删除整个比赛
          await deleteMatch.mutateAsync(currentMatch.id);
        } else {
          // 如果是加入者，只移除自己
          const team = currentMatch.match_teams.find(team =>
            team.match_members.some(member => member.user_id === profile.id)
          );
          
          if (team) {
            await leaveMatch.mutateAsync({
              match_id: currentMatch.id,
              user_id: profile.id
            });
            
            // 更新队伍当前人数
            await updateTeamPlayers.mutateAsync({
              team_id: team.id,
              current_players: team.current_players - 1
            });
          }
        }
  
        router.push('/main/match');
      } catch (error) {
        console.error('Failed to cancel match:', error);
        setError('取消匹配失败，请重试');
      }
    };

  const handleMatchStart = async (size: number) => {
    try {
      if (!profile) {
        setError('请先登录');
        return;
      }

      if (currentMatch) {
        setError('你已经在一个比赛中，请先退出当前比赛');
        return;
      }

      setError(null);
      console.log('Starting match...');
      const matchType = `${size}v${size}`;

      // 查找可加入的对局
      const availableMatch = waitingMatches?.find(match => {
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

          router.push(`/main/match/detail`);
        }
      } else {
        // 创建新对局
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
          
          {currentMatch ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">当前匹配中</h3>
                <p className="text-gray-500">
                  {currentMatch.match_type} - 等待玩家加入 
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
                    {leaveMatch.isPending || deleteMatch.isPending ? '取消中...' : '取消匹配'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认取消匹配？</AlertDialogTitle>
                    <AlertDialogDescription>
                      {isCreator 
                        ? '作为创建者取消将结束整个比赛' 
                        : '你将退出当前比赛'
                      }
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelMatch}>
                      确认
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchMaking;