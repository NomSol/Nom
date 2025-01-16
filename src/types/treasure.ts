// types/treasure.ts
export interface Treasure {
  id: string;
  name: string;
  description: string;
  points: number;
  hint: string;
  latitude: number;
  longitude: number;
  status: string;
  image_url?: string;
  created_at: string;
  updated_at?: string;
  creator_id?: string;
  finder_id?: string;
  verification_code: string;
  likes_count: number;
}

export interface CreateTreasureInput {
  name: string;
  description: string;
  points: number;
  hint: string;
  latitude: number;
  longitude: number;
  status?: string;
  image_url?: string;
}

export interface VerifyTreasureInput {
  id: string;
  verification_code: string;
  finder_id: string;
}