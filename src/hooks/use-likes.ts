import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/use-user';
import { graphqlClient } from '@/lib/graphql-client';
import { 
  LIKE_TREASURE, 
  UNLIKE_TREASURE, 
  GET_USER_LIKES,
  GET_TREASURE_LIKES_COUNT
} from '@/graphql/likes';

import type {
  LikeResponse,
  TreasureLikesCount,
  UnlikeResponse,
  UserLikesResponse
} from '@/types/like'

interface LikeEvent {
  type: 'LIKE' | 'UNLIKE';
  treasureId: string;
  userId: string;
}

export function useLikes(treasureId?: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { profile } = useUserProfile({ enabled: !!session?.user?.email });
  const [optimisticLikesCount, setOptimisticLikesCount] = useState<Record<string, number>>({});

  // 获取宝藏的初始点赞数
  const { data: initialLikesCount } = useQuery<TreasureLikesCount, Error, number>({
    queryKey: ['treasureLikesCount', treasureId],
    queryFn: async () => {
      if (!treasureId) throw new Error('No treasure ID provided');
      const response = await graphqlClient.request<TreasureLikesCount>(GET_TREASURE_LIKES_COUNT, {
        treasure_id: treasureId
      });
      return response;
    },
    select: (data) => data.treasures_by_pk?.likes_count ?? 0,
    enabled: !!treasureId,
  });

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
      const response = await graphqlClient.request<LikeResponse>(LIKE_TREASURE, {
        treasure_id: treasureId,
        user_id: profile.id,
      });
      
      // 广播点赞事件
      broadcastLikeEvent({
        type: 'LIKE',
        treasureId,
        userId: profile.id
      });
      
      return response;
    },
    onMutate: async (treasureId) => {
      // 取消相关查询
      await queryClient.cancelQueries({ queryKey: ['userLikes', profile?.id] });
      await queryClient.cancelQueries({ queryKey: ['treasureLikesCount', treasureId] });

      // 保存之前的状态
      const previousState = {
        userLikes: queryClient.getQueryData<UserLikesResponse>(['userLikes', profile?.id]),
        likesCount: optimisticLikesCount[treasureId] || initialLikesCount || 0
      };

      // 乐观更新点赞状态
      queryClient.setQueryData<UserLikesResponse>(['userLikes', profile?.id], (old) => ({
        treasure_likes: [...(old?.treasure_likes || []), { treasure_id: treasureId }],
      }));

      // 乐观更新点赞数
      setOptimisticLikesCount(prev => ({
        ...prev,
        [treasureId]: (prev[treasureId] || initialLikesCount || 0) + 1
      }));

      return previousState;
    },
    onError: (err, treasureId, context: any) => {
      // 发生错误时回滚状态
      if (context) {
        queryClient.setQueryData(['userLikes', profile?.id], context.userLikes);
        setOptimisticLikesCount(prev => ({
          ...prev,
          [treasureId]: context.likesCount
        }));
      }
    }
  });

  // 取消点赞操作
  const unlikeTreasure = useMutation<UnlikeResponse, Error, string>({
    mutationFn: async (treasureId: string) => {
      if (!profile?.id) throw new Error('No user ID found');
      const response = await graphqlClient.request<UnlikeResponse>(UNLIKE_TREASURE, {
        treasure_id: treasureId,
        user_id: profile.id,
      });

      // 广播取消点赞事件
      broadcastLikeEvent({
        type: 'UNLIKE',
        treasureId,
        userId: profile.id
      });

      return response;
    },
    onMutate: async (treasureId) => {
      // 取消相关查询
      await queryClient.cancelQueries({ queryKey: ['userLikes', profile?.id] });
      await queryClient.cancelQueries({ queryKey: ['treasureLikesCount', treasureId] });

      // 保存之前的状态
      const previousState = {
        userLikes: queryClient.getQueryData<UserLikesResponse>(['userLikes', profile?.id]),
        likesCount: optimisticLikesCount[treasureId] || initialLikesCount || 0
      };

      // 乐观更新点赞状态
      queryClient.setQueryData<UserLikesResponse>(['userLikes', profile?.id], (old) => ({
        treasure_likes: (old?.treasure_likes || []).filter(
          like => like.treasure_id !== treasureId
        ),
      }));

      // 乐观更新点赞数
      setOptimisticLikesCount(prev => ({
        ...prev,
        [treasureId]: Math.max(0, (prev[treasureId] || initialLikesCount || 0) - 1)
      }));

      return previousState;
    },
    onError: (err, treasureId, context: any) => {
      // 发生错误时回滚状态
      if (context) {
        queryClient.setQueryData(['userLikes', profile?.id], context.userLikes);
        setOptimisticLikesCount(prev => ({
          ...prev,
          [treasureId]: context.likesCount
        }));
      }
    }
  });

  // 监听点赞事件的 BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('likes-channel');
    
    channel.addEventListener('message', (event) => {
      const { type, treasureId, userId } = event.data as LikeEvent;
      
      // 忽略自己发出的事件
      if (userId === profile?.id) return;

      // 更新本地点赞数
      setOptimisticLikesCount(prev => ({
        ...prev,
        [treasureId]: Math.max(0, (prev[treasureId] || initialLikesCount || 0) + (type === 'LIKE' ? 1 : -1))
      }));
    });

    return () => channel.close();
  }, [profile?.id, initialLikesCount]);

  // 广播点赞事件函数
  const broadcastLikeEvent = (event: LikeEvent) => {
    const channel = new BroadcastChannel('likes-channel');
    channel.postMessage(event);
    channel.close();
  };

  const isLiked = (id: string) => {
    return userLikes?.treasure_likes.some(like => like.treasure_id === id) ?? false;
  };

  const getLikesCount = (id: string) => {
    return optimisticLikesCount[id] ?? initialLikesCount ?? 0;
  };

  return {
    isLiked,
    likeTreasure,
    unlikeTreasure,
    userLikes,
    getLikesCount
  };
}