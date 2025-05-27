// app/treasures/my-placements/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TreasureList } from '@/components/treasures/treasure_list';
import { useTreasures } from '@/hooks/use-treasure';
import { useToast } from '@/components/ui/toaster';
import { useAuth } from '@/utils/auth';
import { useWallet } from '@/context/WalletContext';
import { useUserProfile } from '@/hooks/use-user';

export default function MyPlacementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { walletAddress } = useWallet();
  const { userPlacements, isLoading, error, deleteTreasure } = useTreasures();
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

  const handleDelete = async (id: string) => {
    try {
      await deleteTreasure.mutateAsync(id);
      toast({ title: 'Success', description: 'Treasure deleted successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete treasure',
        variant: 'destructive',
      });
    }
  };

  // Ensure all treasures have the correct creator_id
  const treasuresWithCreator = userPlacements?.map(treasure => ({
    ...treasure,
    creator_id: profile?.id // Ensure creator_id matches current user ID
  })) || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Created Treasures</h1>
        <Button onClick={() => router.push('create')}>
          Create New Treasure
        </Button>
      </div>

      <TreasureList
        treasures={treasuresWithCreator}
        onDelete={handleDelete}
        showActions={true}
      />
    </div>
  );
}