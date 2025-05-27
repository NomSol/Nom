// app/treasures/my-findings/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TreasureList } from '@/components/treasures/treasure_list';
import { useTreasures } from '@/hooks/use-treasure';
import { useAuth } from '@/utils/auth';
import { useWallet } from '@/context/WalletContext';
import { useUserProfile } from '@/hooks/use-user';

export default function MyFindingsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { walletAddress } = useWallet();
  const { userFindings, isLoading, error } = useTreasures();
  const { profile } = useUserProfile({ enabled: !!walletAddress });

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/connect-wallet');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div>Error loading treasures</div>;
  }

  const findingsWithFinder = userFindings?.map(treasure => ({
    ...treasure,
    finder_id: profile?.id
  })) || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">My Found Treasures</h1>

      <TreasureList
        treasures={findingsWithFinder}
        showActions={false}
      />
    </div>
  );
}