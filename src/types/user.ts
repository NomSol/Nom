// src/types/user.ts
export interface UserProfile {
  id: string;
  nickname: string;
  avatar_url: string;
  cath_id: number;
  ip_location?: string;
  description?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

// src/types/user.ts
export interface UserProfileInput {
  nickname: string;
  avatar_url: string;
  ip_location?: string;
  description?: string;
  email: string;
}
