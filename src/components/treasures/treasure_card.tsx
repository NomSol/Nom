import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Edit, Heart, Trash } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/use-user';
import { useLikes } from '@/hooks/use-likes';
import { Treasure } from '@/types/treasure';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { VerifyTreasureDialog } from './verify-dialog';


interface TreasureCardProps {
  treasure: Treasure;
  onEdit?: (treasure: Treasure) => void;
  onDelete?: (id: string) => void;
}

export function TreasureCard({ treasure, onEdit, onDelete }: TreasureCardProps) {
  const { data: session } = useSession();
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const { profile } = useUserProfile({ enabled: !!session?.user?.email });
  const { isLiked, likeTreasure, unlikeTreasure } = useLikes();
  const liked = isLiked(treasure.id);
  // Check if this treasure is created by the current user
  const isCreator = treasure.creator_id === profile?.id;
  // Check if this treasure is already found by the current user
  const isFound = treasure.finder_id === profile?.id;

  console.log('TreasureCard render:', {
    treasureId: treasure.id,
    liked,
    hasProfile: !!profile,
    cathId: profile?.cath_id,
    likesCount: treasure.likes_count
  });

  const handleLikeClick = async () => {
    if (!profile?.id) {
      console.log('No profile or cath_id found, cannot like/unlike');
      return;
    }
    
    try {
      console.log('Attempting to', liked ? 'unlike' : 'like', 'treasure:', treasure.id);
      
      if (liked) {
        const result = await unlikeTreasure.mutateAsync(treasure.id);
        console.log('Unlike result:', result);
      } else {
        const result = await likeTreasure.mutateAsync(treasure.id);
        console.log('Like result:', result);
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {treasure.image_url && (
        <div className="relative w-full h-48">
          <Image
            src={treasure.image_url}
            alt={treasure.name}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{treasure.name}</CardTitle>
        <div className="flex space-x-2">
            <Button
            variant="ghost"
            size="icon"
            onClick={handleLikeClick}
            disabled={!profile?.id}
            className="relative"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                liked ? "fill-red-500 text-red-500" : "text-gray-500"
              )}
            />
            <span className="absolute -bottom-4 text-xs">
              {treasure.likes_count || 0}
            </span>
          </Button>
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(treasure)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" onClick={() => onDelete(treasure.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-500 mb-4">{treasure.description}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Points: {treasure.points}</div>
          <div>Status: {treasure.status}</div>
          <div>Lat: {treasure.latitude.toFixed(6)}</div>
          <div>Long: {treasure.longitude.toFixed(6)}</div>
          
          {/* Add verify button if not creator and not found */}
          {!isCreator && !isFound && (
            <Button 
              className="col-span-2 mt-2"
              onClick={() => setVerifyDialogOpen(true)}
            >
              验证宝藏
            </Button>
          )}
          
          {/* Show found status if found */}
          {isFound && (
            <div className="col-span-2 flex items-center justify-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span>已找到</span>
            </div>
          )}
        </div>
      </CardContent>

      <VerifyTreasureDialog
        treasureId={treasure.id}
        isOpen={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
      />
    </Card>
  );
}
