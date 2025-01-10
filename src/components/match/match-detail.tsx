"use client";

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

  // 获取匹配状态显示
  const getStatusDisplay = (status?: string) => {
    switch (status) {
      case 'matching':
        return <Badge variant="secondary">匹配中</Badge>;
      case 'playing':
        return <Badge variant="default">进行中</Badge>;
      case 'finished':
        return <Badge variant="outline">已结束</Badge>;
      default:
        return <Badge variant="secondary">{status || '未知状态'}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>加载对局信息中...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error?.message || '未找到对局信息'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>请先登录</AlertDescription>
      </Alert>
    );
  }

  // 确保 match_teams 是数组
  const teams = Array.isArray(match.match_teams) ? match.match_teams : [];
  
  // 找到玩家所在的队伍和对手队伍
  const userTeam = teams.find(team => 
    team.match_members?.some(member => member.user_id === profile.id)
  );

  const otherTeam = teams.find(team => team.id !== userTeam?.id);

  return (
    <div className="space-y-6">
      {/* 对局信息卡片 */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold">{match.match_type} 对战</h2>
            {getStatusDisplay(match.status)}
          </div>
          <p className="text-sm text-gray-500">
            {match.start_time ? `开始时间: ${new Date(match.start_time).toLocaleString()}` : '等待开始'}
          </p>
        </CardHeader>
      </Card>

      {/* 队伍信息 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 我的队伍 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                我的队伍
              </h3>
              <Badge variant="outline">总分: {userTeam?.total_score ?? 0}</Badge>
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
                    <span>{member.individual_score ?? 0} 分</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 对手队伍 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                对手队伍
              </h3>
              <Badge variant="outline">总分: {otherTeam?.total_score ?? 0}</Badge>
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
                    <span>{member.individual_score ?? 0} 分</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 宝藏发现记录 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">已发现的宝藏</h3>
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
                  <Badge variant="secondary">+{discovery.score ?? 0} 分</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              还未发现任何宝藏
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}