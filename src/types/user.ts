// src/types/user.ts
export interface User {
  id: string;
  nickname: string;
  avatar_url: string;
  cath_id: string;
  ip_location?: string;
  description?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}