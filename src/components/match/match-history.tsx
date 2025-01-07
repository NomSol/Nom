// components/match/match-history.tsx
import { useUserMatchHistory } from '@/hooks/use-match';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Trophy, Users } from 'lucide-react';

interface MatchHistoryProps {
  userId: string;
}

const MatchHistory = ({ userId }: MatchHistoryProps) => {
  const { matchHistory, isLoading } = useUserMatchHistory(userId);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Users className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">对战历史</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matchHistory?.map((member) => {
            // 确保类型安全的比较
            const isWinner = member.team.total_score === Math.max(
              ...member.match.match_teams.map(t => t.total_score)
            );

            return (
              <div
                key={`${member.match.id}-${member.team.id}`}
                className="p-4 rounded-lg border"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">
                    {member.match.match_type} 对战
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(member.match.start_time), 'yyyy-MM-dd HH:mm')}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">个人得分：</span>
                    <span className="font-medium">{member.individual_score}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">团队得分：</span>
                    <span className="font-medium">{member.team.total_score}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {isWinner && <Trophy className="h-4 w-4 text-yellow-500" />}
                  <span className={isWinner ? 'text-green-600' : 'text-red-600'}>
                    {isWinner ? '胜利' : '失败'}
                  </span>
                </div>
              </div>
            );
          })}

          {(!matchHistory || matchHistory.length === 0) && (
            <div className="text-center text-gray-500 py-8">
              暂无对战记录
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchHistory;