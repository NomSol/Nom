// app/(main)/treasures/create/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { TreasureForm } from '@/components/treasures/treasure_form';
import { useTreasures } from '@/hooks/use-treasure';
import { useToast } from '@/components/ui/toaster';
import { CreateTreasureInput } from '@/hooks/use-treasure';

export default function CreateTreasurePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createTreasure } = useTreasures();

  const handleSubmit = async (data: CreateTreasureInput) => {
    try {
      console.log('Creating treasure with data:', data); // 添加日志
      const result = await createTreasure.mutateAsync({
        ...data,
        status: 'ACTIVE'
      });
      console.log('Creation result:', result); // 添加日志
      
      toast({
        title: '成功',
        description: '宝藏创建成功',
      });
      router.back();
    } catch (error) {
      console.error('Error creating treasure:', error); // 添加错误日志
      toast({
        title: '错误',
        description: '创建宝藏失败',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">创建新宝藏</h1>
      <TreasureForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={createTreasure.isPending}
      />
    </div>
  );
}