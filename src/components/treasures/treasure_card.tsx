import { Card} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit, Heart, Trash } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/use-user';
import { useLikes } from '@/hooks/use-likes';
import { Treasure } from '@/types/treasure';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { VerifyTreasureDialog } from './verify-dialog';
import { createClient } from 'graphql-ws';
import { TREASURE_LIKES_SUBSCRIPTION } from '@/graphql/likes';

interface SubscriptionData {
  treasures_by_pk: {
    id: string;
    likes_count: number;
  } | null;
}

export const wsClient = createClient({
  url: process.env.NEXT_PUBLIC_HASURA_WS_URL || 'wss://treasure-hunt.hasura.app/v1/graphql',
  connectionParams: {
    headers: {
      'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET
    }
  }
});

export function useTreasureSubscription(treasureId: string) {
  const [likesCount, setLikesCount] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = wsClient.subscribe<SubscriptionData>(
      {
        query: TREASURE_LIKES_SUBSCRIPTION,
        variables: { treasure_id: treasureId },
      },
      {
        next: (result) => {
          const count = result.data?.treasures_by_pk?.likes_count;
          if (typeof count === 'number') {
            setLikesCount(count);
          }
        },
        error: (error) => {
          console.error('Subscription error:', error);
        },
        complete: () => {
          console.log('Subscription completed');
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [treasureId]);

  return likesCount;
}

interface TreasureCardProps {
  treasure: Treasure;
  onEdit?: (treasure: Treasure) => void;
  onDelete?: (id: string) => void;
}

export function TreasureCard({ treasure, onEdit, onDelete }: TreasureCardProps) {
  const { data: session } = useSession();
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const { profile } = useUserProfile({ enabled: !!session?.user?.email });
  const { isLiked, likeTreasure, unlikeTreasure } = useLikes();
  const liked = isLiked(treasure.id);
  const isCreator = treasure.creator_id === profile?.id;
  const isFound = treasure.finder_id === profile?.id;
  const realTimeLikesCount = useTreasureSubscription(treasure.id);

  // Format treasure ID to show only first 6 digits
  const shortId = treasure.id.slice(0, 6);

  const handleLikeClick = async () => {
    if (!profile?.id) {
      console.log('No profile or cath_id found, cannot like/unlike');
      return;
    }
    
    try {
      if (liked) {
        await unlikeTreasure.mutateAsync(treasure.id);
      } else {
        await likeTreasure.mutateAsync(treasure.id);
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  const handleLogsClick = () => {
    setShowLogs(!showLogs);
    console.log('Logs clicked for treasure:', treasure.id);
  };

  return (
    <Card className="w-full overflow-hidden bg-white border-2 border-gray-200 rounded-xl">
      <div className="p-3">
        {/* Header - Creator Info */}
        <div className="text-xs text-gray-600 text-center border-b border-gray-100 pb-2">
          Placed by: @user
          <br />
          on {new Date(treasure.created_at).toLocaleDateString()}
        </div>

        {/* Image Section */}
        <div className="relative w-full aspect-[4/3] my-2">
          {treasure.image_url && (
            <Image
              src={treasure.image_url}
              alt={treasure.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          )}
        </div>

        {/* ID and Type */}
        <div className="text-center mb-2">
          <p className="text-sm font-mono">#{shortId} | {treasure.status}</p>
        </div>

        {/* Stats Row */}
        <div className="flex justify-center items-center space-x-6 mb-3">
          <div className="flex items-center space-x-1">
            <span role="img" aria-label="views" className="text-lg">👁️</span>
            <span className="font-mono">{treasure.points}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLikeClick}
              disabled={!profile?.id}
              className="p-0 h-auto hover:bg-transparent"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  liked ? "fill-red-500 text-red-500" : "text-gray-500"
                )}
              />
            </Button>
            <span className="font-mono">{realTimeLikesCount}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-2">
          <div className="flex justify-center gap-2 order-2 w-full">
            {!isCreator && !isFound && (
              <Button 
                variant="outline"
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 rounded-full px-4 text-sm h-8 min-w-[80px]"
                onClick={() => setVerifyDialogOpen(true)}
              >
                MINT
              </Button>
            )}
            <Button 
              variant="outline"
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 rounded-full px-4 text-sm h-8 min-w-[80px]"
              onClick={handleLogsClick}
            >
              Logs
            </Button>
          </div>
          
          {/* Edit and Delete buttons in a separate container */}
          {(onEdit || onDelete) && (
            <div className="flex justify-center gap-1 order-1">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-gray-100 h-8 w-8"
                  onClick={() => onEdit(treasure)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-gray-100 h-8 w-8"
                  onClick={() => onDelete(treasure.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Found Status */}
        {isFound && (
          <div className="flex items-center justify-center gap-2 text-green-600 mt-2">
            <Check className="w-4 h-4" />
            <span className="text-sm">Found</span>
          </div>
        )}

        {/* Logs Panel */}
        {showLogs && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg text-sm">
            <p className="text-gray-600">Treasure activity logs...</p>
          </div>
        )}
      </div>

      <VerifyTreasureDialog
        treasureId={treasure.id}
        isOpen={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
      />
    </Card>
  );
}