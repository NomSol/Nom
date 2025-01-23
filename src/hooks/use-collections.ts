"use client";

import { useTreasures } from './use-treasure';

export interface Collection {
    id: string;
    name: string;
    description: string;
    image_url?: string;
    author: string;
    collected_at: string;
    status: string;
}

export function useCollections() {
    const { treasures, isLoading, error } = useTreasures();

    // 过滤出状态为 "collected" 的宝藏作为收藏
    const collections = treasures?.filter(treasure =>
        treasure.status === "collected"
    );

    return {
        collections,
        isLoading,
        error,
    };
}