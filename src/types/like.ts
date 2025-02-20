export interface LikeResponse {
    insert_treasure_likes_one: {
      treasure_id: string;
      user_id: string;
    };
  }
  
export  interface UnlikeResponse {
    delete_treasure_likes: {
      affected_rows: number;
    };
  }
  
export  interface UserLikesResponse {
    treasure_likes: Array<{
      treasure_id: string;
    }>;
  }