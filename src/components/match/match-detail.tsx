"use client";

import { useMatch } from "@/hooks/use-match";
import { useUserProfile } from "@/hooks/use-user";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Timer } from "lucide-react";
import type { MatchTeam, MatchMember, MatchDiscovery } from "@/types/matches";

interface MatchDetailProps {
  matchId: string;
}

export default function MatchDetail({ matchId }: MatchDetailProps) {
  const { data: match, isLoading: isLoadingMatch, error } = useMatch(matchId);
  const { profile } = useUserProfile();

  if (isLoadingMatch) {
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
        <AlertDescription>
          请先登录
        </AlertDescription>
      </Alert>
    );
  }

  const userTeam = match.match_teams.find(team =>
    team.match_members.some(member => member.user_id === profile.id)
  );

  const otherTeam = match.match_teams.find(team => team.id !== userTeam?.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-center">
            {match.match_type} 对战
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({match.status === 'matching' ? '匹配中' : '进行中'})
            </span>
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* 我方队伍 */}
            <div className="space-y-4">
              <h3 className="font-medium text-center">我方队伍</h3>
              <div className="space-y-2">
                {userTeam?.match_members.map((member: MatchMember) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      {member.user.avatar_url && (
                        <img
                          src={member.user.avatar_url}
                          alt={member.user.nickname}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>{member.user.nickname}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {member.individual_score || 0} 分
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-gray-500">
                总分: {userTeam?.total_score || 0}
              </div>
            </div>

            {/* 对方队伍 */}
            <div className="space-y-4">
              <h3 className="font-medium text-center">对方队伍</h3>
              <div className="space-y-2">
                {otherTeam?.match_members.map((member: MatchMember) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      {member.user.avatar_url && (
                        <img
                          src={member.user.avatar_url}
                          alt={member.user.nickname}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>{member.user.nickname}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {member.individual_score || 0} 分
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-gray-500">
                总分: {otherTeam?.total_score || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 发现的宝藏列表 */}
      <Card>
        <CardHeader>
          <h3 className="font-medium">已发现的宝藏</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {userTeam?.match_discoveries.map((discovery: MatchDiscovery) => (
              <div
                key={discovery.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>{discovery.treasure.name}</span>
                <span className="text-sm text-gray-500">
                  +{discovery.score} 分
                </span>
              </div>
            ))}
            {(!userTeam?.match_discoveries || userTeam.match_discoveries.length === 0) && (
              <div className="text-center text-sm text-gray-500 py-4">
                还未发现任何宝藏
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}