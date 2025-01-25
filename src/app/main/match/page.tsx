// src/app/(main)/match/page.tsx
"use client";

import { useUserProfile } from "@/hooks/use-user";
import MatchMaking from "@/components/match/match-making";
import { Timer } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MatchPage() {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="container py-8 text-center">
        <Timer className="animate-spin h-8 w-8 mx-auto mb-2" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Please log in before accessing this page
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
