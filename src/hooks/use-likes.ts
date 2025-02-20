// hooks/use-likes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from 'graphql-ws';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/use-user';
import { graphqlClient } from '@/lib/graphql-client';
import { 
  LIKE_TREASURE, 
  UNLIKE_TREASURE, 
  GET_USER_LIKES
} from '@/graphql/likes';

import type {
  LikeResponse,
  UnlikeResponse,
  UserLikesResponse
} from '@/types/like'

import { useState } from 'react';

export const wsClient = createClient({
  url: process.env.NEXT_PUBLIC_HASURA_WS_URL || 'ws://your-hasura-endpoint/v1/graphql',
  connectionParams: {
    headers: {
      'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET
    }
  }
});

export function useLikes(treasureId?: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { profile } = useUserProfile({ enabled: !!session?.user?.email });
  const [likesCount, setLikesCount] = useState<number>(0);

  // 获取用户点赞列表
  const { data: userLikes } = useQuery<UserLikesResponse>({
    queryKey: ['userLikes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('No user ID found');
      const response = await graphqlClient.request<UserLikesResponse>(GET_USER_LIKES, {
        user_id: profile.id
      });
      return response;
    },
    enabled: !!profile?.id,
  });

  // 点赞操作
  const likeTreasure = useMutation<LikeResponse, Error, string>({
    mutationFn: async (treasureId: string) => {
      if (!profile?.id) throw new Error('No user ID found');
      return graphqlClient.request<LikeResponse>(LIKE_TREASURE, {
        treasure_id: treasureId,
        user_id: profile.id,
      });
    },
    onMutate: async (treasureId) => {
      await queryClient.cancelQueries({ queryKey: ['userLikes', profile?.id] });
      await queryClient.cancelQueries({ queryKey: ['treasures'] });

      const previousUserLikes = queryClient.getQueryData<UserLikesResponse>(['userLikes', profile?.id]);
      const previousTreasures = queryClient.getQueryData(['treasures']);

      queryClient.setQueryData<UserLikesResponse>(['userLikes', profile?.id], (old) => ({
        treasure_likes: [...(old?.treasure_likes || []), { treasure_id: treasureId }],
      }));

      return { previousUserLikes, previousTreasures };
    },
    onError: (err, treasureId, context: any) => {
      if (context?.previousUserLikes) {
        queryClient.setQueryData(['userLikes', profile?.id], context.previousUserLikes);
      }
      if (context?.previousTreasures) {
        queryClient.setQueryData(['treasures'], context.previousTreasures);
      }
    }
  });

  // 取消点赞操作
  const unlikeTreasure = useMutation<UnlikeResponse, Error, string>({
    mutationFn: async (treasureId: string) => {
      if (!profile?.id) throw new Error('No user ID found');
      return graphqlClient.request<UnlikeResponse>(UNLIKE_TREASURE, {
        treasure_id: treasureId,
        user_id: profile.id,
      });
    },
    onMutate: async (treasureId) => {
      await queryClient.cancelQueries({ queryKey: ['userLikes', profile?.id] });
      await queryClient.cancelQueries({ queryKey: ['treasures'] });

      const previousUserLikes = queryClient.getQueryData<UserLikesResponse>(['userLikes', profile?.id]);
      const previousTreasures = queryClient.getQueryData(['treasures']);

      queryClient.setQueryData<UserLikesResponse>(['userLikes', profile?.id], (old) => ({
        treasure_likes: (old?.treasure_likes || []).filter(
          like => like.treasure_id !== treasureId
        ),
      }));

      return { previousUserLikes, previousTreasures };
    },
    onError: (err, treasureId, context: any) => {
      if (context?.previousUserLikes) {
        queryClient.setQueryData(['userLikes', profile?.id], context.previousUserLikes);
      }
      if (context?.previousTreasures) {
        queryClient.setQueryData(['treasures'], context.previousTreasures);
      }
    }
  });

  const isLiked = (id: string) => {
    return userLikes?.treasure_likes.some(like => like.treasure_id === id) ?? false;
  };

  return {
    isLiked,
    likeTreasure,
    unlikeTreasure,
    userLikes,
    likesCount: treasureId ? likesCount : undefined
  };
}