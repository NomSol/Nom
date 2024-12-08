'use client';

import { useRouter } from 'next/navigation';
import { TreasureForm } from '@/components/treasures/treasure_form';
import { useTreasures } from '@/hooks/use-treasure';
import { useToast } from '@/components/ui/toaster';
import { CreateTreasureInput, Treasure } from '@/hooks/use-treasure';
import { useQueryClient } from '@tanstack/react-query';

export default function CreateTreasurePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createTreasure } = useTreasures();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: CreateTreasureInput) => {
    try {
      const tempTreasure: Treasure = {
        id: `temp-${Date.now()}`,
        ...data,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        points: Number(data.points),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      };

      // 立即更新缓存
      queryClient.setQueryData(['treasures'], (old: any) => ({
        treasures: [...(old?.treasures || []), tempTreasure]
      }));

      // 立即返回列表页面
      router.back();

      // 显示创建中的提示
      toast({
        title: '提示',
        description: '宝藏创建中...',
      });

      // 执行实际的创建操作
      await createTreasure.mutateAsync({
        ...data,
        status: 'ACTIVE'
      });

      // 创建成功后的提示
      toast({
        title: '成功',
        description: '宝藏创建成功',
      });

      // 重新获取最新数据
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
    } catch (error) {
      console.error('Error creating treasure:', error);
      
      // 创建失败时，从缓存中移除临时数据
      queryClient.setQueryData(['treasures'], (old: any) => ({
        treasures: old?.treasures.filter((t: Treasure) => !t.id.startsWith('temp-')) || []
      }));

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