export interface Treasure {
    id: string;
    name: string;
    description: string;
    points: number;
    hint: string;
    latitude: number;
    longitude: number;
    status: string;
    created_at: string;
    updated_at?: string;
  }
  
  export interface CreateTreasureInput {
    name: string;
    description: string;
    points: number;
    hint: string;
    latitude: number;
    longitude: number;
    status?: string;
  }