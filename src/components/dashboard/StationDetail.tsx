import React, { useMemo } from "react";
import { RecyclingStation } from "@/types/station";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Battery, Coins, MapPin, Navigation, Recycle, Star, User } from "lucide-react";

interface StationDetailProps {
    station: RecyclingStation;
    onClose: () => void;
    onNavigate: () => void;
}

export const StationDetail: React.FC<StationDetailProps> = ({
    station,
    onClose,
    onNavigate,
}) => {
    // Calculate usage percentage
    const usagePercentage = useMemo(() =>
        Math.min(Math.round((station.current_usage / station.capacity) * 100), 100),
        [station.current_usage, station.capacity]
    );

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-fade-in-up relative max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M18 6L6 18"
                            stroke="#666"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M6 6L18 18"
                            stroke="#666"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                {/* Station image */}
                <div className="w-full h-60 relative bg-gray-100">
                    {station.image_url ? (
                        <div className="w-full h-full relative">
                            <Image
                                src={station.image_url}
                                alt={station.name || "Recycling Station"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 400px"
                            />
                            {/* Add green glow effect */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "radial-gradient(circle at center, rgba(52, 211, 153, 0.3) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }}
                            ></div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-green-50 to-emerald-50">
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "radial-gradient(circle at center, rgba(52, 211, 153, 0.4) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }}
                            ></div>
                            <Recycle className="w-20 h-20 text-green-500" />
                        </div>
                    )}

                    {/* Level indicator */}
                    <div className="absolute left-4 bottom-4 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-md flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-gray-800 font-medium">
                            Level {station.level}
                        </span>
                    </div>

                    {/* Official badge if applicable */}
                    {station.is_official && (
                        <div className="absolute right-4 bottom-4 bg-yellow-100 px-3 py-1 rounded-full shadow-md flex items-center">
                            <span className="text-yellow-800 font-medium text-sm">
                                Official Station
                            </span>
                        </div>
                    )}
                </div>

                <div
                    className="p-6 space-y-5"
                    style={{
                        background:
                            "linear-gradient(to bottom, white, rgba(240, 253, 244, 0.2))",
                    }}
                >
                    {/* Station title and description */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {station.name || "Recycling Station"}
                        </h2>
                        <p className="text-gray-600">
                            {station.description || "A place to recycle your dead meme coins."}
                        </p>
                    </div>

                    {/* Station info card */}
                    <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1 flex items-center justify-center">
                                    <Battery className="w-3 h-3 mr-1" />
                                    Capacity
                                </p>
                                <p className="font-semibold text-sm">{station.capacity}</p>
                            </div>
                            <div className="text-center border-x border-gray-200">
                                <p className="text-xs text-gray-500 mb-1 flex items-center justify-center">
                                    <Recycle className="w-3 h-3 mr-1" />
                                    Usage
                                </p>
                                <p className="font-semibold text-sm">{usagePercentage}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1 flex items-center justify-center">
                                    <Coins className="w-3 h-3 mr-1" />
                                    Earnings
                                </p>
                                <p className="font-semibold text-sm">{station.earnings} NOM</p>
                            </div>
                        </div>

                        {/* Usage bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                            <div
                                className={`h-full rounded-full ${usagePercentage > 80 ? "bg-red-500" :
                                        usagePercentage > 50 ? "bg-yellow-500" : "bg-green-500"
                                    }`}
                                style={{ width: `${usagePercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Special features section for official stations */}
                    {station.is_official && station.special_features && station.special_features.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium mb-2">Special Features:</h3>
                            <div className="flex flex-wrap gap-2">
                                {station.special_features.map((feature, index) => (
                                    <Badge key={index} variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                                        {feature}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Owner info if available */}
                    {station.owner_id && (
                        <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-1" />
                            <span>Owned by: User#{station.owner_id.substring(0, 6)}</span>
                        </div>
                    )}

                    {/* Location info */}
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>
                            Location: {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                        </span>
                    </div>

                    {/* Navigation button */}
                    <button
                        onClick={onNavigate}
                        className="w-full bg-green-500 text-white py-4 rounded-xl text-lg font-bold hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                        <Navigation className="w-5 h-5 mr-2" />
                        Navigate to Station
                    </button>
                </div>
            </div>
        </div>
    );
};