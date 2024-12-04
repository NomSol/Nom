'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TreasureList } from '@/components/treasures/treasure_list';
import { TreasureMap } from '@/components/treasures/treasure_map';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTreasures } from '@/hooks/use-treasure';
import { useToast } from '@/components/ui/toaster';

export default function TreasuresPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { treasures, isLoading, error, deleteTreasure } = useTreasures();
  const [view, setView] = useState<'list' | 'map'>('list');
  // 添加本地状态来管理乐观更新
  const [localTreasures, setLocalTreasures] = useState<typeof treasures>([]);

  // 当 treasures 加载完成后更新本地状态
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
      // 立即更新本地状态
      setLocalTreasures((current) => 
        current?.filter(treasure => treasure.id !== id) || []
      );

      // 执行实际的删除操作
      await deleteTreasure.mutateAsync(id);
      
      toast({
        title: 'Success',
        description: 'Treasure deleted successfully',
      });
    } catch (error) {
      // 如果删除失败，恢复本地状态
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
        <h1 className="text-3xl font-bold">宝藏列表</h1>
        <Button onClick={() => router.push('treasures/create')}>
          创建宝藏
        </Button>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'map')}>
        <TabsList>
          <TabsTrigger value="list">列表视图</TabsTrigger>
          <TabsTrigger value="map">地图视图</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <TreasureList
            treasures={localTreasures || []}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <div className="h-[600px] rounded-lg overflow-hidden">
            <TreasureMap
              treasures={localTreasures || []}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}