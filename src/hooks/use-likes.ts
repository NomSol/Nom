import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '@/utils/auth';
import { useUserProfile } from '@/hooks/use-user';
import { useWallet } from '@/context/WalletContext';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LikeEvent {
  type: 'LIKE' | 'UNLIKE';
  itemId: string;
  userId: string;
  itemType: 'treasure' | 'station';
}

interface UserLike {
  id: string;
  user_id: string;
  [key: string]: any; // For dynamic field names like 'station_id' or 'treasure_id'
}

export function useLikes(itemId?: string, itemType: 'treasure' | 'station' = 'station') {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { walletAddress } = useWallet();
  const { profile } = useUserProfile({ enabled: !!walletAddress });
  const [optimisticLikesCount, setOptimisticLikesCount] = useState<Record<string, number>>({});

  // Get the initial likes count for a station/treasure
  const { data: initialLikesCount } = useQuery({
    queryKey: [`${itemType}LikesCount`, itemId],
    queryFn: async () => {
      if (!itemId) return 0;

      const likesRef = collection(db, 'likes');
      const q = query(likesRef, where(`${itemType}_id`, '==', itemId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    },
    enabled: !!itemId,
  });

  // Get user likes list
  const { data: userLikes, isLoading: userLikesLoading } = useQuery({
    queryKey: ['userLikes', profile?.id, itemType],
    queryFn: async () => {
      if (!profile?.id) return { likes: [] as UserLike[] };

      const likesRef = collection(db, 'likes');
      const q = query(
        likesRef,
        where('user_id', '==', profile.id),
        where(`${itemType}_id`, '!=', null)
      );
      const snapshot = await getDocs(q);

      const likes: UserLike[] = [];
      snapshot.forEach((doc) => {
        likes.push({ id: doc.id, ...doc.data() } as UserLike);
      });

      return { likes };
    },
    enabled: !!profile?.id,
  });

  // Check if the current user has liked a specific item
  const isLiked = (id: string): boolean => {
    if (!userLikes?.likes || !profile?.id) return false;
    return userLikes.likes.some(like => like[`${itemType}_id`] === id);
  };

  // Find the like document for an item
  const findLikeDocument = async (userId: string, itemId: string) => {
    const likesRef = collection(db, 'likes');
    const q = query(
      likesRef,
      where('user_id', '==', userId),
      where(`${itemType}_id`, '==', itemId)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  };

  // Like a station/treasure
  const likeStation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!profile?.id) throw new Error('User not authenticated');

      // Check if already liked
      const existingLike = await findLikeDocument(profile.id, itemId);
      if (existingLike) return existingLike;

      // Optimistic update
      setOptimisticLikesCount(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1
      }));

      // Create new like
      const likeData = {
        user_id: profile.id,
        [`${itemType}_id`]: itemId,
        created_at: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'likes'), likeData);
      return { id: docRef.id, ...likeData };
    },
    onSuccess: (_, itemId) => {
      queryClient.invalidateQueries({ queryKey: ['userLikes', profile?.id, itemType] });
      queryClient.invalidateQueries({ queryKey: [`${itemType}LikesCount`, itemId] });
    },
    onError: (_, itemId) => {
      // Rollback optimistic update on error
      setOptimisticLikesCount(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 1) - 1
      }));
    }
  });

  // Unlike a station/treasure
  const unlikeStation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!profile?.id) throw new Error('User not authenticated');

      // Find the like document
      const existingLike = await findLikeDocument(profile.id, itemId);
      if (!existingLike) throw new Error('Like not found');

      // Optimistic update
      setOptimisticLikesCount(prev => ({
        ...prev,
        [itemId]: Math.max((prev[itemId] || 1) - 1, 0)
      }));

      // Delete the like
      await deleteDoc(doc(db, 'likes', existingLike.id));
      return existingLike;
    },
    onSuccess: (_, itemId) => {
      queryClient.invalidateQueries({ queryKey: ['userLikes', profile?.id, itemType] });
      queryClient.invalidateQueries({ queryKey: [`${itemType}LikesCount`, itemId] });
    },
    onError: (_, itemId) => {
      // Rollback optimistic update on error
      setOptimisticLikesCount(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + 1
      }));
    }
  });

  // Toggle like function (like/unlike)
  const toggleLike = (itemId: string) => {
    if (!isAuthenticated || !profile?.id) {
      // Handle not authenticated case
      return;
    }

    if (isLiked(itemId)) {
      unlikeStation.mutate(itemId);
    } else {
      likeStation.mutate(itemId);
    }
  };

  // Get the actual likes count, including optimistic updates
  const getLikesCount = (itemId: string): number => {
    if (optimisticLikesCount[itemId] !== undefined) {
      return optimisticLikesCount[itemId];
    }
    return initialLikesCount || 0;
  };

  useEffect(() => {
    // Initialize optimistic counts with actual data when it becomes available
    if (itemId && initialLikesCount !== undefined) {
      setOptimisticLikesCount(prev => ({
        ...prev,
        [itemId]: initialLikesCount
      }));
    }
  }, [itemId, initialLikesCount]);

  return {
    isLiked,
    toggleLike,
    // Return both individual like/unlike functions and likesCount for compatibility
    likeStation,
    unlikeStation,
    getLikesCount,
    likesCount: itemId ? getLikesCount(itemId) : 0,
    userLikes: userLikes?.likes || [],
    isLoading: likeStation.isPending || unlikeStation.isPending || userLikesLoading,
  };
}