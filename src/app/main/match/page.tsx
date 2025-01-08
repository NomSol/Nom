// src/app/(main)/match/page.tsx
"use client";

import { useUserProfile } from "@/hooks/use-user";
import MatchMaking from "@/components/match/match-making";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Timer } from "lucide-react";

export default function MatchPage() {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="container py-8 text-center">
        <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
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
      <MatchMaking />
    </div>
  );
}