// hooks/use-likes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/use-user';
import { graphqlClient } from '@/lib/graphql-client';
import { LIKE_TREASURE, UNLIKE_TREASURE, GET_USER_LIKES } from '@/graphql/likes';

interface LikeResponse {
  insert_treasure_likes_one?: {
    id: string;
    treasure_id: string;
  };
  delete_treasure_likes?: {
    affected_rows: number;
  };
}

interface UserLikesResponse {
  treasure_likes: Array<{
    treasure_id: string;
  }>;
}

export function useLikes() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { profile } = useUserProfile({ enabled: !!session?.user?.email });

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
      // 取消任何传出的重新获取
      await queryClient.cancelQueries({ queryKey: ['userLikes', profile?.id] });
      await queryClient.cancelQueries({ queryKey: ['treasures'] });

      // 保存当前状态以便回滚
      const previousUserLikes = queryClient.getQueryData<UserLikesResponse>(['userLikes', profile?.id]);
      const previousTreasures = queryClient.getQueryData(['treasures']);

      // 乐观更新用户点赞列表
      queryClient.setQueryData<UserLikesResponse>(['userLikes', profile?.id], (old) => ({
        treasure_likes: [...(old?.treasure_likes || []), { treasure_id: treasureId }],
      }));

      // 乐观更新宝藏列表中的点赞数
      queryClient.setQueryData(['treasures'], (old: any) => {
        if (!old?.treasures) return old;
        return {
          ...old,
          treasures: old.treasures.map((t: any) =>
            t.id === treasureId ? { ...t, likes_count: (t.likes_count || 0) + 1 } : t
          ),
        };
      });

      return { previousUserLikes, previousTreasures };
    },
    onError: (err, treasureId, context: any) => {
      // 发生错误时回滚到乐观更新之前的状态
      if (context?.previousUserLikes) {
        queryClient.setQueryData(['userLikes', profile?.id], context.previousUserLikes);
      }
      if (context?.previousTreasures) {
        queryClient.setQueryData(['treasures'], context.previousTreasures);
      }
    },
    onSettled: () => {
      // 完成后，无论成功还是失败都重新获取数据
      queryClient.invalidateQueries({ queryKey: ['userLikes', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
    },
  });

  // 取消点赞操作
  const unlikeTreasure = useMutation<LikeResponse, Error, string>({
    mutationFn: async (treasureId: string) => {
      if (!profile?.id) throw new Error('No user ID found');
      return graphqlClient.request<LikeResponse>(UNLIKE_TREASURE, {
        treasure_id: treasureId,
        user_id: profile.id,
      });
    },
    onMutate: async (treasureId) => {
      await queryClient.cancelQueries({ queryKey: ['userLikes', profile?.id] });
      await queryClient.cancelQueries({ queryKey: ['treasures'] });

      const previousUserLikes = queryClient.getQueryData<UserLikesResponse>(['userLikes', profile?.id]);
      const previousTreasures = queryClient.getQueryData(['treasures']);

      // 乐观更新用户点赞列表 - 移除该点赞
      queryClient.setQueryData<UserLikesResponse>(['userLikes', profile?.id], (old) => ({
        treasure_likes: (old?.treasure_likes || []).filter(
          like => like.treasure_id !== treasureId
        ),
      }));

      // 乐观更新宝藏列表中的点赞数
      queryClient.setQueryData(['treasures'], (old: any) => {
        if (!old?.treasures) return old;
        return {
          ...old,
          treasures: old.treasures.map((t: any) =>
            t.id === treasureId ? { ...t, likes_count: Math.max((t.likes_count || 0) - 1, 0) } : t
          ),
        };
      });

      return { previousUserLikes, previousTreasures };
    },
    onError: (err, treasureId, context: any) => {
      if (context?.previousUserLikes) {
        queryClient.setQueryData(['userLikes', profile?.id], context.previousUserLikes);
      }
      if (context?.previousTreasures) {
        queryClient.setQueryData(['treasures'], context.previousTreasures);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userLikes', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
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