// src/components/treasures/treasure-comments.tsx
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { useTreasureComments } from '@/hooks/use-treasure-comments';
import { useUserProfile } from '@/hooks/use-user';
import { useAuth } from '@/utils/auth';
import { useWallet } from '@/context/WalletContext';

export function TreasureComments({ treasureId }: { treasureId: string }) {
  const { isAuthenticated, user } = useAuth();
  const { walletAddress } = useWallet();
  const { profile, isLoading: profileLoading } = useUserProfile({ enabled: !!walletAddress });
  const { comments, loading, addComment } = useTreasureComments(treasureId);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Auth state:', {
      isAuthenticated,
      walletAddress,
      profile,
      profileLoading
    });
  }, [isAuthenticated, walletAddress, profile, profileLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !walletAddress) {
      setError('Please connect your wallet to comment');
      return;
    }

    if (profileLoading) {
      setError('Loading user profile...');
      return;
    }

    if (!profile) {
      setError('User profile not found');
      return;
    }

    if (!input.trim()) {
      setError('Please enter a comment');
      return;
    }

    try {
      await addComment(
        input.trim(),
        profile.id,
        profile.nickname || `User_${walletAddress.slice(0, 6)}`,
        profile.avatar_url
      );
      setInput('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError('Failed to add comment');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAuthenticated ? "Write a comment..." : "Please connect your wallet to comment"}
          className="min-h-[60px] text-sm resize-none"
          disabled={!isAuthenticated || !profile}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || !isAuthenticated || !profile}
          >
            Comment
          </Button>
        </div>
      </form>

      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 text-sm">
              <Avatar className="h-6 w-6">
                {comment.userAvatar ? (
                  <AvatarImage src={comment.userAvatar} alt={comment.userNickname} />
                ) : (
                  <AvatarFallback>{comment.userNickname[0]}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.userNickname}</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}