// app/(main)/match/page.tsx
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user';
import MatchMaking from '@/components/match/match-making';
import MatchDetail from '@/components/match/match-detail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams?.get('id') || null;
  const { profile, isLoading } = useUserProfile();

  const handleMatchStart = (id: string) => {
    router.push(`/match?id=${id}`);
  };

  const handleBackToMatching = () => {
    router.push('/match');
  };

  console.log('Current matchId:', matchId);
  console.log('Profile:', profile);

  if (isLoading) {
    return (
      <div className="container py-8 text-center">
        <div className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>
            请先登录后再访问此页面
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {!matchId ? (
        <MatchMaking onMatchStart={handleMatchStart} />
      ) : (
        <div className="space-y-4">
          <Button 
            onClick={handleBackToMatching} 
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回匹配
          </Button>
          <MatchDetail matchId={matchId} />
        </div>
      )}
    </div>
  );
}