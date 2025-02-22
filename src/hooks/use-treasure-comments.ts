// src/hooks/use-treasure-comments.ts
import { useEffect, useState, useCallback } from 'react';
import { ref, onValue, push } from 'firebase/database';
import { db } from '@/lib/firebase';

interface Comment {
  id: string;
  content: string;
  userId: string;
  userNickname: string;
  userAvatar?: string;
  timestamp: number;
}

export function useTreasureComments(treasureId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!treasureId) {
      setComments([]);
      return;
    }

    setLoading(true);
    const commentsRef = ref(db, `treasure-comments/${treasureId}`);
    
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const commentList = Object.entries(data)
          .map(([id, comment]) => ({
            id,
            ...(comment as Omit<Comment, 'id'>)
          }))
          .sort((a, b) => b.timestamp - a.timestamp);
        
        setComments(commentList);
      } else {
        setComments([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading comments:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [treasureId]);

  const addComment = useCallback(async (
    content: string, 
    userId: string, 
    userNickname: string,
    userAvatar?: string
  ) => {
    if (!treasureId || !userId || !userNickname || !content.trim()) {
      throw new Error('Missing required fields for comment');
    }
    
    try {
      const commentsRef = ref(db, `treasure-comments/${treasureId}`);
      const newComment = {
        content: content.trim(),
        userId,
        userNickname,
        userAvatar,
        timestamp: Date.now()
      };
      
      await push(commentsRef, newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }, [treasureId]);

  return {
    comments,
    loading,
    addComment
  };
}