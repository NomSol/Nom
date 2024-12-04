// app/(main)/treasures/[id]/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { TreasureForm } from '@/components/treasures/treasure_form';
import { useTreasures, useTreasure } from '@/hooks/use-treasure';
import { useToast } from '@/components/ui/toaster';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditTreasurePage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { updateTreasure } = useTreasures();
  const { treasure, isLoading } = useTreasure(params.id);

  const handleSubmit = async (data: any) => {
    try {
      await updateTreasure.mutateAsync({ id: params.id, data });
      toast({
        title: 'Success',
        description: 'Treasure updated successfully',
      });
      router.push('/treasures');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update treasure',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!treasure) {
    return <div>Treasure not found</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Treasure</h1>
      <TreasureForm
        initialData={treasure}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={updateTreasure.isPending}
      />
    </div>
  );
}