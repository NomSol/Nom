// src/app/(main)/match/detail/page.tsx
"use client";

import { useCurrentMatch } from "@/hooks/use-match";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user";
import MatchDetail from "@/components/match/match-detail";
import { Timer } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MatchDetailPage() {
  const router = useRouter();
  const { profile, isLoading: isLoadingProfile } = useUserProfile();
  const { currentMatchId } = useCurrentMatch();

  // Add debugging logs
  console.log('Detail page rendered', { currentMatchId, profile });

  if (isLoadingProfile) {
    return (
      <div className="container py-8 text-center">
        <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>Please log in before accessing this page</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentMatchId) {
    router.push('/match');
    return null;
  }

  return (
    <div className="container py-8">
      <MatchDetail matchId={currentMatchId} />
    </div>
  );
}