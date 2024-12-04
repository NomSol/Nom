// hooks/use-treasure.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_TREASURES, GET_TREASURE_BY_ID, CREATE_TREASURE, UPDATE_TREASURE, DELETE_TREASURE } from '@/graphql/treasures';

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
}

interface GetTreasuresResponse {
  treasures: Treasure[];
}

interface GetTreasureResponse {
  treasures_by_pk: Treasure;
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

export function useTreasure(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['treasure', id],
    queryFn: async () => {
      const response = await graphqlClient.request<GetTreasureResponse>(
        GET_TREASURE_BY_ID,
        { id }
      );
      return response.treasures_by_pk;
    },
    enabled: !!id
  });

  return {
    treasure: data,
    isLoading
  };
}

export function useTreasures() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<GetTreasuresResponse>({
    queryKey: ['treasures'],
    queryFn: async () => {
      const response = await graphqlClient.request<GetTreasuresResponse>(GET_TREASURES);
      return response;
    }
  });

  const createTreasure = useMutation({
    mutationFn: async (input: CreateTreasureInput) => {
      const variables = {
        object: {
          name: input.name,
          description: input.description,
          points: input.points,
          hint: input.hint,
          latitude: input.latitude,
          longitude: input.longitude,
          status: 'ACTIVE',
          image_url: input.image_url 
        }
      };

      return graphqlClient.request(CREATE_TREASURE, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
    }
  });

  const updateTreasure = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTreasureInput> }) =>
      graphqlClient.request(UPDATE_TREASURE, { id, set: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
      queryClient.invalidateQueries({ queryKey: ['treasure'] });
    }
  });

  const deleteTreasure = useMutation({
    mutationFn: (id: string) =>
      graphqlClient.request(DELETE_TREASURE, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasures'] });
    }
  });

  return {
    treasures: data?.treasures,
    isLoading,
    error,
    createTreasure,
    updateTreasure,
    deleteTreasure
  };
}