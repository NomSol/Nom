// app/(main)/match/[id]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MatchDetail from "@/components/match/match-detail";

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleBackToMatching = () => {
    router.push("/match");
  };

  return (
    <div className="container py-8">
      <div className="space-y-4">
        <Button
          onClick={handleBackToMatching}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回匹配
        </Button>
        <MatchDetail matchId={params.id} />
      </div>
    </div>
  );
}