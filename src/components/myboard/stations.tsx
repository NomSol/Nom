"use client";

import { useStations } from '@/hooks/use-stations';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Recycle, Coins, Star, ArrowUp } from "lucide-react";

export function Stations() {
    const { userStations, isLoading } = useStations();

    if (isLoading) {
        return (
            <div className="w-full p-6 text-center">
                <div className="animate-spin">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-2 sm:space-y-6">
            <div className="flex justify-between items-center bg-gradient-to-br from-green-900 to-green-800 text-white p-3 sm:p-6 rounded-xl">
                <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                    我的回收站
                </h2>
                <Badge variant="outline" className="border-green-500 text-green-500">
                    {userStations?.length || 0} 个回收站
                </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {userStations?.map((station) => (
                    <Card key={station.id} className="group relative overflow-hidden bg-gradient-to-br from-green-900 to-green-800 text-white border-0 hover:shadow-xl transition-all duration-300">
                        <div className="relative h-40 sm:h-48 overflow-hidden">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 blur opacity-75 group-hover:opacity-100 transition duration-1000" />
                            <div className="relative">
                                <img
                                    src={station.image_url || '/default-station.jpg'}
                                    alt={station.name}
                                    className="w-full h-40 sm:h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 to-transparent" />
                            </div>
                            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-20">
                                <h3 className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                                    {station.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{station.description}</p>
                            </div>
                            {/* Level indicator */}
                            <div className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="absolute text-xs font-bold">{station.level}</span>
                            </div>
                        </div>

                        <div className="p-2 sm:p-4 space-y-2 sm:space-y-4 bg-green-800/50 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs sm:text-sm border-green-500 text-green-500 flex items-center gap-1">
                                    <Recycle className="w-3 h-3" />
                                    容量 {station.capacity}
                                </Badge>
                                <Badge variant="outline" className="text-xs sm:text-sm border-emerald-500 text-emerald-500 flex items-center gap-1">
                                    <Coins className="w-3 h-3" />
                                    {station.earnings} NOM
                                </Badge>
                            </div>

                            {/* Usage bar */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>使用率</span>
                                    <span>{Math.min(Math.round((station.current_usage / station.capacity) * 100), 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                                        style={{ width: `${Math.min(Math.round((station.current_usage / station.capacity) * 100), 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="hidden sm:grid grid-cols-2 gap-2 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <span>📍</span>
                                    <span>{station.latitude.toFixed(2)}, {station.longitude.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                    <span>🕒</span>
                                    <span>{new Date(station.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-0 border border-transparent group-hover:border-green-500/50 rounded-lg transition-colors duration-300" />
                    </Card>
                ))}
            </div>
        </div>
    );
} 