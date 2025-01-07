// components/match/match-detail.tsx
import { useEffect, useState } from 'react';
import { useUserProfile } from '@/hooks/use-user';
import { useMatch, useMatchActions } from '@/hooks/use-match';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Timer, Users } from 'lucide-react';
import { format } from 'date-fns';

interface MatchDetailProps {
  matchId: string;
}

const MATCH_DURATION = 60 * 60; // 30 minutes in seconds

const MatchDetail = ({ matchId }: MatchDetailProps) => {
  const { profile } = useUserProfile(); 
  const { match, isLoading } = useMatch(matchId);
  const { updateMatchStatus } = useMatchActions();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // 辅助函数：从 "NvN" 格式提取数字
  const getTeamSize = (matchType: string): number => {
    const size = parseInt(matchType.split('v')[0]);
    return isNaN(size) ? 0 : size;
  };

  useEffect(() => {
    if (match?.status === 'playing') {
      const timer = setInterval(() => {
        const startTime = new Date(match.start_time);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const remaining = Math.max(0, MATCH_DURATION - elapsed);
        
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          updateMatchStatus.mutateAsync({
            id: matchId,
            status: 'finished'
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [match, matchId, updateMatchStatus]);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          未找到对局信息
        </AlertDescription>
      </Alert>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTeam = () => {
    if (!profile) return null;  // 修改这里
    return match.match_teams.find(team =>
      team.match_members.some(member => member.user_id === profile.id)  // 修改这里
    );
  };

  const currentTeam = getCurrentTeam();

  const getTeamProgress = (team: any) => {
    const totalDiscoveries = team.match_discoveries.length;
    const uniqueDiscoveries = new Set(
      team.match_discoveries.map((d: any) => d.treasure_id)
    ).size;
    return { totalDiscoveries, uniqueDiscoveries };
  };

  // 计算需要的总人数
  const requiredPlayers = getTeamSize(match.match_type) * 2;
  const currentPlayers = match.match_teams.reduce(
    (sum, team) => sum + team.match_members.length, 
    0
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {match.match_type} 寻宝对战
            </h2>
            <p className="text-sm text-gray-500">
              状态: {
                match.status === 'matching' ? '等待中' :
                match.status === 'playing' ? '进行中' :
                '已结束'
              }
            </p>
          </div>
          {timeRemaining !== null && (
            <div className="text-xl font-mono flex items-center bg-secondary p-2 rounded">
              <Timer className="mr-2 h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {match.match_teams.map((team) => {
            const { totalDiscoveries, uniqueDiscoveries } = getTeamProgress(team);
            
            return (
              <div key={team.id} className={`
                space-y-4 p-4 rounded-lg border
                ${currentTeam?.id === team.id ? 'border-primary' : 'border-gray-200'}
              `}>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    队伍 {team.team_number}
                  </h3>
                  <span className="text-2xl font-bold">
                    {team.total_score}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  发现宝藏: {uniqueDiscoveries} 个 (总计 {totalDiscoveries} 次)
                </div>

                <div className="space-y-2">
                  {team.match_members.map((member) => (
                    <div
                      key={member.id}
                      className={`
                        p-3 rounded-lg bg-secondary/5
                        ${member.user_id === profile?.id ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {member.user.avatar_url && (
                            <img
                              src={member.user.avatar_url}
                              alt="avatar"
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <span>{member.user.nickname}</span>
                        </div>
                        <span className="font-medium">
                          {member.individual_score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {team.match_discoveries.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">最近发现：</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {[...team.match_discoveries]
                        .sort((a, b) => new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime())
                        .slice(0, 5)
                        .map((discovery) => (
                          <div
                            key={discovery.id}
                            className="text-sm flex justify-between items-center p-2 bg-secondary/5 rounded"
                          >
                            <div>
                              <span>{discovery.treasure.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                {format(new Date(discovery.discovered_at), 'HH:mm:ss')}
                              </span>
                            </div>
                            <span className="text-green-600">+{discovery.treasure.points}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {match.status === 'finished' && (
          <div className="mt-8 text-center p-6 bg-primary/5 rounded-lg">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold">游戏结束！</h3>
            <p className="text-lg mt-2">
              胜利队伍：队伍 {
                match.match_teams.reduce((a, b) => 
                  a.total_score > b.total_score ? a : b
                ).team_number
              }
            </p>
          </div>
        )}
      {match.status === 'playing' && currentTeam && (
        <div className="mt-8">
          <div className="bg-secondary/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">比赛信息</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-sm text-gray-500">剩余时间</div>
                <div className="text-xl font-mono mt-1">
                  {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
                </div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-sm text-gray-500">你的得分</div>
                <div className="text-xl font-mono mt-1">
                  {currentTeam.match_members.find(m => m.user_id === profile?.id)?.individual_score || 0}  {/* 修改这里 */}
                </div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-sm text-gray-500">队伍总分</div>
                <div className="text-xl font-mono mt-1">
                  {currentTeam.total_score}
                </div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-sm text-gray-500">发现宝藏数</div>
                <div className="text-xl font-mono mt-1">
                  {new Set(currentTeam.match_discoveries.map(d => d.treasure_id)).size}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {match.status === 'playing' && currentTeam && (
          <div className="mt-8">
            <div className="bg-secondary/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">比赛信息</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-sm text-gray-500">剩余时间</div>
                  <div className="text-xl font-mono mt-1">
                    {timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
                  </div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-sm text-gray-500">你的得分</div>
                  <div className="text-xl font-mono mt-1">
                    {currentTeam.match_members.find(m => m.user_id === profile?.id)?.individual_score || 0}
                  </div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-sm text-gray-500">队伍总分</div>
                  <div className="text-xl font-mono mt-1">
                    {currentTeam.total_score}
                  </div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg">
                  <div className="text-sm text-gray-500">发现宝藏数</div>
                  <div className="text-xl font-mono mt-1">
                    {new Set(currentTeam.match_discoveries.map(d => d.treasure_id)).size}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchDetail;