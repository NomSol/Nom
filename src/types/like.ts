// types/like.ts
export interface TreasureLikesCount {
  treasures_by_pk: {
    id: string;
    likes_count: number;
  } | null;
}

export interface LikeResponse {
  insert_treasure_likes_one: {
    treasure_id: string;
    user_id: string;
  };
}

export interface UnlikeResponse {
  delete_treasure_likes: {
    affected_rows: number;
  };
}

export interface UserLikesResponse {
  treasure_likes: Array<{
    treasure_id: string;
  }>;
}