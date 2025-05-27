import React from 'react';
import { Coins, Eye, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock activity data - in a real app, this would come from a hook
const mockActivities = [
    {
        id: '1',
        user_id: 'user1',
        station_id: 'station1',
        interaction_type: 'RECYCLE',
        coins_recycled: 3,
        points_earned: 50,
        tokens_earned: 10,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        user_nickname: 'CryptoWhale'
    },
    {
        id: '2',
        user_id: 'user2',
        station_id: 'station1',
        interaction_type: 'VISIT',
        coins_recycled: 0,
        points_earned: 5,
        tokens_earned: 0,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        user_nickname: 'TokenHunter'
    },
    {
        id: '3',
        user_id: 'user3',
        station_id: 'station1',
        interaction_type: 'UPGRADE',
        coins_recycled: 0,
        points_earned: 0,
        tokens_earned: 0,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        user_nickname: 'StationOwner'
    },
    {
        id: '4',
        user_id: 'user4',
        station_id: 'station1',
        interaction_type: 'RECYCLE',
        coins_recycled: 5,
        points_earned: 80,
        tokens_earned: 16,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
        user_nickname: 'MemeCollector'
    }
];

interface StationActivityProps {
    stationId: string;
}

export function StationActivity({ stationId }: StationActivityProps) {
    // In a real app, we would fetch the activities based on stationId
    // For now, we'll just filter the mock data
    const activities = mockActivities.filter(activity => activity.station_id === stationId);

    // Format the timestamp relative to now
    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    // Get icon based on interaction type
    const getInteractionIcon = (type: string) => {
        switch (type) {
            case 'RECYCLE':
                return <Coins className="h-3 w-3" />;
            case 'VISIT':
                return <Eye className="h-3 w-3" />;
            case 'UPGRADE':
                return <ArrowUp className="h-3 w-3" />;
            default:
                return <Eye className="h-3 w-3" />;
        }
    };

    // Get text color based on interaction type
    const getInteractionColor = (type: string) => {
        switch (type) {
            case 'RECYCLE':
                return 'text-green-600';
            case 'VISIT':
                return 'text-blue-600';
            case 'UPGRADE':
                return 'text-purple-600';
            default:
                return 'text-gray-600';
        }
    };

    if (activities.length === 0) {
        return (
            <div className="text-center py-4 text-sm text-gray-500">
                No activity recorded yet
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-48 overflow-y-auto">
            {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                    <div className={cn("p-1.5 rounded-full",
                        activity.interaction_type === 'RECYCLE' ? "bg-green-100" :
                            activity.interaction_type === 'VISIT' ? "bg-blue-100" : "bg-purple-100"
                    )}>
                        {getInteractionIcon(activity.interaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <p className="font-medium truncate">
                                @{activity.user_nickname}
                            </p>
                            <span className="text-xs text-gray-500">
                                {formatTimeAgo(activity.created_at)}
                            </span>
                        </div>
                        <p className={cn("text-xs", getInteractionColor(activity.interaction_type))}>
                            {activity.interaction_type === 'RECYCLE' && (
                                <>Recycled coins and earned {activity.points_earned} points</>
                            )}
                            {activity.interaction_type === 'VISIT' && (
                                <>Visited and earned {activity.points_earned} points</>
                            )}
                            {activity.interaction_type === 'UPGRADE' && (
                                <>Upgraded the station</>
                            )}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
} 