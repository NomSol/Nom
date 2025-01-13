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
  ipfs_hash?: string;
  ipfs_metadata_hash?: string;
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
  ipfs_hash?: string;
  ipfs_metadata_hash?: string; 
}