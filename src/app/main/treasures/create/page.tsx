"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TreasureForm } from "@/components/treasures/treasure_form";
import {
  useTreasures,
  CreateTreasureInput,
  Treasure,
} from "@/hooks/use-treasure";
import { useToast } from "@/components/ui/toaster";
import { useQueryClient } from "@tanstack/react-query";

type TreasuresData = {
  treasures: Treasure[];
};

export default function CreateTreasurePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createTreasure } = useTreasures();
  const queryClient = useQueryClient();

  // 从URL参数中获取经纬度
  const searchParams = useSearchParams();
  const latParam = searchParams ? searchParams.get("lat") : null;
  const lngParam = searchParams ? searchParams.get("lng") : null;

  const latitude = latParam ? parseFloat(latParam) : 0;
  const longitude = lngParam ? parseFloat(lngParam) : 0;

  // 将初始数据传入 TreasureForm，包括 latitude 和 longitude
  const initialData: Treasure = {
    id: "",
    name: "",
    description: "",
    points: 0,
    hint: "",
    latitude: latitude,
    longitude: longitude,
    image_url: "",
    // ipfs_hash: "",
    // ipfs_metadata_hash: "",
    status: "ACTIVE",
    created_at: new Date().toISOString(),
  };

  const handleSubmit = async (data: CreateTreasureInput) => {
    try {
      const tempTreasure: Treasure = {
        id: `temp-${Date.now()}`,
        ...data,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        points: Number(data.points),
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      };

      // 立即更新缓存数据（添加临时宝藏条目）
      queryClient.setQueryData<TreasuresData>(["treasures"], (old) => {
        return {
          treasures: [...(old?.treasures ?? []), tempTreasure],
        };
      });

      // 显示创建中的提示
      toast({
        title: "提示",
        description: "宝藏创建中...",
      });

      // 执行实际的创建操作（调用API）
      await createTreasure.mutateAsync({
        ...data,
        status: "ACTIVE",
      });

      // 创建成功后的提示
      toast({
        title: "成功",
        description: "宝藏创建成功",
      });

      // 使缓存失效以触发重新获取最新数据
      queryClient.invalidateQueries({ queryKey: ["treasures"] });

      // 创建完成后可以选择返回或留在本页
      // router.back();
    } catch (error) {
      console.error("Error creating treasure:", error);

      // 创建失败时，从缓存中移除临时数据
      queryClient.setQueryData<TreasuresData>(["treasures"], (old) => {
        return {
          treasures: (old?.treasures ?? []).filter(
            (t: Treasure) => !t.id.startsWith("temp-")
          ),
        };
      });

      toast({
        title: "错误",
        description: "创建宝藏失败",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">创建新宝藏</h1>
      <TreasureForm
        initialData={initialData} // 将初始数据传入表单
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={createTreasure.isPending}
      />
    </div>
  );
}
