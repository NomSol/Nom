import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Edit, Heart, Star, Trash, UploadCloud, Zap } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/utils/auth';
import { useWallet } from '@/context/WalletContext';
import { useUserProfile } from '@/hooks/use-user';
import { useLikes } from '@/hooks/use-likes';
import { RecyclingStation } from '@/types/station';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { RecycleCoinsDialog } from './recycle-dialog';
import { StationActivity } from './station_activity';
import { useStationActivity } from '@/hooks/use-station-activity';

interface StationCardProps {
    station: RecyclingStation;
    onEdit?: (station: RecyclingStation) => void;
    onDelete?: (id: string) => void;
    onUpgrade?: (id: string, level: number) => void;
}

export function StationCard({ station, onEdit, onDelete, onUpgrade }: StationCardProps) {
    const { isAuthenticated, user } = useAuth();
    const { walletAddress } = useWallet();
    const [recycleDialogOpen, setRecycleDialogOpen] = useState(false);
    const [showActivity, setShowActivity] = useState(false);
    const { profile } = useUserProfile({ enabled: !!walletAddress });
    const { activity, loading } = useStationActivity(station.id);
    const { isLiked, likeStation, unlikeStation, getLikesCount } = useLikes(station.id);
    const liked = isLiked(station.id);
    const likesCount = getLikesCount(station.id);
    const isOwner = station.owner_id === profile?.id;
    const isOfficial = station.is_official;

    // Format station ID to show only first 6 digits
    const shortId = station.id.slice(0, 6);

    // Calculate usage percentage
    const usagePercentage = Math.min(Math.round((station.current_usage / station.capacity) * 100), 100);

    const handleLikeClick = async () => {
        if (!profile?.id) {
            console.log('No profile found, cannot like/unlike');
            return;
        }

        try {
            if (liked) {
                await unlikeStation.mutateAsync(station.id);
            } else {
                await likeStation.mutateAsync(station.id);
            }
        } catch (error) {
            console.error('Failed to update like status:', error);
        }
    };

    const handleActivityClick = () => {
        setShowActivity(!showActivity);
    };

    const handleUpgradeClick = () => {
        if (onUpgrade && isOwner && station.level < 5) {
            onUpgrade(station.id, station.level + 1);
        }
    };

    return (
        <Card className="w-full overflow-hidden bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-3">
                {/* Header - Owner Info */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <div className="text-xs text-gray-600">
                        {isOfficial ? (
                            <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                <span>Official Station</span>
                            </div>
                        ) : (
                            <span>Owned by: @user</span>
                        )}
                    </div>
                    <div className="text-xs text-gray-600">
                        Level {station.level}
                    </div>
                </div>

                {/* Image Section */}
                <div className="relative w-full aspect-[4/3] my-2">
                    {station.image_url && (
                        <Image
                            src={station.image_url}
                            alt={station.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 50vw, 33vw"
                        />
                    )}
                </div>

                {/* ID and Status */}
                <div className="text-center mb-2">
                    <p className="text-sm font-mono">#{shortId} | {station.status}</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500">Capacity</span>
                        <span className="font-mono text-sm">{station.capacity}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500">Usage</span>
                        <span className="font-mono text-sm">{usagePercentage}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500">Earnings</span>
                        <span className="font-mono text-sm">{station.earnings}</span>
                    </div>
                </div>

                {/* Usage Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                        className={cn(
                            "h-full rounded-full",
                            usagePercentage > 80 ? "bg-red-500" :
                                usagePercentage > 50 ? "bg-yellow-500" : "bg-green-500"
                        )}
                        style={{ width: `${usagePercentage}%` }}
                    ></div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center items-center gap-2">
                    <div className="flex justify-center gap-2 order-2 w-full">
                        {!isOwner && (
                            <Button
                                variant="outline"
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 rounded-full px-4 text-sm h-8 min-w-[80px] flex items-center"
                                onClick={() => setRecycleDialogOpen(true)}
                            >
                                <Coins className="h-3 w-3 mr-1" />
                                RECYCLE
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className={cn(
                                "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 rounded-full px-4 text-sm h-8 min-w-[80px] flex items-center",
                                showActivity && "bg-gray-200"
                            )}
                            onClick={handleActivityClick}
                        >
                            <UploadCloud className="h-3 w-3 mr-1" />
                            {loading ? 'Loading...' : 'ACTIVITY'}
                        </Button>
                        {isOwner && station.level < 5 && (
                            <Button
                                variant="outline"
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 rounded-full px-4 text-sm h-8 min-w-[80px] flex items-center"
                                onClick={handleUpgradeClick}
                            >
                                <Zap className="h-3 w-3 mr-1" />
                                UPGRADE
                            </Button>
                        )}
                    </div>

                    {/* Edit and Delete buttons in a separate container */}
                    {isOwner && (onEdit || onDelete) && (
                        <div className="flex justify-center gap-1 order-1">
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-gray-100 h-8 w-8"
                                    onClick={() => onEdit(station)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-gray-100 h-8 w-8"
                                    onClick={() => onDelete(station.id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Special features badges for official stations */}
                {isOfficial && station.special_features && station.special_features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {station.special_features.map((feature, index) => (
                            <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                {feature}
                            </span>
                        ))}
                    </div>
                )}

                {/* Activity Panel */}
                {showActivity && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b">
                            <h3 className="text-sm font-medium">Recent Activity</h3>
                        </div>
                        <StationActivity stationId={station.id} />
                    </div>
                )}
            </div>

            <RecycleCoinsDialog
                stationId={station.id}
                isOpen={recycleDialogOpen}
                onClose={() => setRecycleDialogOpen(false)}
            />
        </Card>
    );
} 