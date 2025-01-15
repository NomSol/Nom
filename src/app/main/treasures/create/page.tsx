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
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    likes_count: 0,
    verification_code: ""
  };

  interface CreateTreasureResponse {
    insert_treasures_one: {
      id: string;
      name: string;
      verification_code: string;
    };
  }

  const handleSubmit = async (data: CreateTreasureInput) => {
    try {
      // 显示创建中的提示
      toast({
        title: "提示",
        description: "宝藏创建中...",
      });
  
      // 添加类型断言
      const result = await createTreasure.mutateAsync({
        ...data,
        status: "ACTIVE",
      }) as CreateTreasureResponse;
  
      // 创建成功后显示验证码
      if (result.insert_treasures_one?.verification_code) {
        toast({
          title: "创建成功",
          description: `请保存宝藏验证码：${result.insert_treasures_one.verification_code}`,
          duration: 5000,
        });
      }
  
      // 使缓存失效
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
  
      // 延迟返回，让用户有时间记下验证码
      setTimeout(() => {
        router.back();
      }, 5000);
    } catch (error) {
      console.error("Error creating treasure:", error);
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
