// hooks/use-likes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/use-user';

interface LikeResponse {
  insert_treasure_likes_one?: {
    id: string;
    treasure_id: string;
  };
  delete_treasure_likes?: {
    affected_rows: number;
  };
}

interface UserLikes {
  treasure_likes: { treasure_id: string }[];
}

export function useLikes() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { profile } = useUserProfile({ enabled: !!session?.user?.email });

  // 获取用户点赞列表
  const { data: userLikes } = useQuery<UserLikes>({
    queryKey: ['userLikes', profile?.cath_id],
    queryFn: async () => {
      if (!profile?.cath_id) throw new Error('No user ID found');
      console.log('Fetching likes for user:', profile.cath_id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HASURA_REST_API}/userlikes?cath_id=${encodeURIComponent(profile.cath_id)}`,
        {
          headers: {
            'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user likes');
      }

      const data = await response.json();
      console.log('Fetched user likes:', data);
      return data;
    },
    enabled: !!profile?.cath_id,
  });

  // 点赞操作
  const likeTreasure = useMutation<LikeResponse, Error, string>({
    mutationFn: async (treasureId: string) => {
      if (!profile?.cath_id) throw new Error('No user ID found');
      console.log('Liking treasure:', treasureId, 'by user:', profile.cath_id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HASURA_REST_API}/liketreasure`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
          },
          body: JSON.stringify({
            treasure_id: treasureId,
            cath_id: profile.cath_id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Like operation failed:', errorData);
        throw new Error(errorData.message || 'Failed to like treasure');
      }

      const data = await response.json();
      console.log('Like operation successful:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLikes'] });
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
    },
    onError: (error) => {
      console.error('Like mutation error:', error);
    },
  });

  // 取消点赞操作
  const unlikeTreasure = useMutation<LikeResponse, Error, string>({
    mutationFn: async (treasureId: string) => {
      if (!profile?.cath_id) throw new Error('No user ID found');
      console.log('Unliking treasure:', treasureId, 'by user:', profile.cath_id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HASURA_REST_API}/unliketreasure`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
          },
          body: JSON.stringify({
            treasure_id: treasureId,
            cath_id: profile.cath_id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Unlike operation failed:', errorData);
        throw new Error(errorData.message || 'Failed to unlike treasure');
      }

      const data = await response.json();
      console.log('Unlike operation successful:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLikes'] });
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
    },
    onError: (error) => {
      console.error('Unlike mutation error:', error);
    },
  });

  const isLiked = (treasureId: string) => {
    return userLikes?.treasure_likes.some(like => like.treasure_id === treasureId) ?? false;
  };

  return {
    isLiked,
    likeTreasure,
    unlikeTreasure,
    userLikes,
  };
}