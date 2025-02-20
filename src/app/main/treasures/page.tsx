'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TreasureList } from '@/components/treasures/treasure_list';
import { useTreasures } from '@/hooks/use-treasure';
import { useToast } from '@/components/ui/toaster';

export default function TreasuresPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { treasures, isLoading, error, deleteTreasure } = useTreasures();
  // Add local state to manage optimistic updates
  const [localTreasures, setLocalTreasures] = useState<typeof treasures>([]);

  // Update local state when treasures are loaded
  useEffect(() => {
    if (treasures) {
      setLocalTreasures(treasures);
    }
  }, [treasures]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div>Error loading treasures</div>;
  }

  const handleDelete = async (id: string) => {
    try {
      // Immediately update local state
      setLocalTreasures((current) =>
        current?.filter(treasure => treasure.id !== id) || []
      );

      // Perform the actual delete operation
      await deleteTreasure.mutateAsync(id);

      toast({
        title: 'Success',
        description: 'Treasure deleted successfully',
      });
    } catch (error) {
      // If deletion fails, revert the local state
      setLocalTreasures(treasures || []);

      toast({
        title: 'Error',
        description: 'Failed to delete treasure',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Treasure List</h1>
        <Button onClick={() => router.push('treasures/create')}>
          Create Treasure
        </Button>
      </div>

      <TreasureList
        treasures={localTreasures || []}
        onDelete={handleDelete}
      />
    </div>
  );
}