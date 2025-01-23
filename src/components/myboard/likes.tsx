"use client";

import { useTreasures } from '@/hooks/use-treasure';
import { Badge } from "@/components/myboard/badge";
import { Card } from "@/components/ui/card";

export function Likes() {
    const { treasures, isLoading } = useTreasures();

    if (isLoading) {
        return (
            <div className="w-full p-6 text-center">
                <div className="animate-spin">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-2 sm:space-y-6">
            <div className="flex justify-between items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-3 sm:p-6 rounded-xl">
                <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                    我的点赞
                </h2>
                <Badge variant="outline" className="border-pink-500 text-pink-500">
                    {treasures?.length || 0} 个宝藏
                </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {treasures?.map((treasure) => (
                    <Card key={treasure.id} className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 hover:shadow-xl transition-all duration-300">
                        <div className="relative h-40 sm:h-48 overflow-hidden">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 blur opacity-75 group-hover:opacity-100 transition duration-1000" />
                            <div className="relative">
                                <img
                                    src={treasure.image_url || '/default-treasure.jpg'}
                                    alt={treasure.name}
                                    className="w-full h-40 sm:h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
                            </div>
                            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20">
                                <h3 className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                                    {treasure.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{treasure.description}</p>
                            </div>
                        </div>

                        <div className="p-2 sm:p-4 space-y-2 sm:space-y-4 bg-gray-800/50 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs sm:text-sm border-pink-500 text-pink-500">
                                    {treasure.points} 积分
                                </Badge>
                                <Badge variant="outline" className="text-xs sm:text-sm border-violet-500 text-violet-500">
                                    {treasure.status}
                                </Badge>
                            </div>

                            <div className="hidden sm:grid grid-cols-2 gap-2 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <span>📍</span>
                                    <span>{treasure.latitude.toFixed(2)}, {treasure.longitude.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                    <span>🕒</span>
                                    <span>{new Date(treasure.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-0 border border-transparent group-hover:border-pink-500/50 rounded-lg transition-colors duration-300" />
                    </Card>
                ))}
            </div>
        </div>
    );
}