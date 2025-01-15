// hooks/use-treasure.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import {
  GET_TREASURES,
  GET_TREASURE_BY_ID,
  CREATE_TREASURE,
  UPDATE_TREASURE,
  DELETE_TREASURE,
  GET_USER_PLACEMENTS,
  VERIFY_TREASURE,
  GET_USER_FINDINGS,
} from "@/graphql/treasures";
import { Treasure, VerifyTreasureInput } from "@/types/treasure";
import { useUserProfile } from "./use-user";

interface GetTreasuresResponse {
  treasures: Treasure[];
}

interface GetTreasureResponse {
  treasures_by_pk: Treasure;
}

interface UserPlacementsResponse {
  treasures: Treasure[];
}

interface UserFindingsResponse {
  treasures: Treasure[];
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
    queryKey: ["treasure", id],
    queryFn: async () => {
      const response = await graphqlClient.request<GetTreasureResponse>(
        GET_TREASURE_BY_ID,
        { id }
      );
      return response.treasures_by_pk;
    },
    enabled: !!id,
  });

  return {
    treasure: data,
    isLoading,
  };
}

export function useTreasures() {
  const queryClient = useQueryClient();
  const { profile } = useUserProfile({ enabled: true });

  // 获取所有宝藏
  const { data, isLoading, error } = useQuery<GetTreasuresResponse>({
    queryKey: ["treasures"],
    queryFn: async () => {
      const response = await graphqlClient.request<GetTreasuresResponse>(
        GET_TREASURES
      );
      return response;
    },
  });

  // 生成6位随机数验证码
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 创建宝藏
  const createTreasure = useMutation({
    mutationFn: async (input: CreateTreasureInput) => {
      const verification_code = generateVerificationCode();
      const variables = {
        object: {
          ...input,
          verification_code,
          creator_id: profile?.id,
          status: 'ACTIVE',
        }
      };
      return graphqlClient.request(CREATE_TREASURE, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
      queryClient.invalidateQueries({ queryKey: ["userPlacements"] });
    },
  });

  // 更新宝藏
  const updateTreasure = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateTreasureInput>;
    }) => graphqlClient.request(UPDATE_TREASURE, { id, set: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
      queryClient.invalidateQueries({ queryKey: ["treasure"] });
    },
  });

  // 删除宝藏
  const deleteTreasure = useMutation({
    mutationFn: (id: string) => graphqlClient.request(DELETE_TREASURE, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
    },
  });

  // 验证宝藏
  const verifyTreasure = useMutation({
    mutationFn: async ({ id, verification_code }: VerifyTreasureInput) => {
      if (!profile?.id) throw new Error('User not logged in');
      
      return graphqlClient.request(VERIFY_TREASURE, {
        id,
        verification_code,
        finder_id: profile.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
      queryClient.invalidateQueries({ queryKey: ["userFindings"] });
    },
  });

  // 获取用户放置的宝藏
  const userPlacements = useQuery<UserPlacementsResponse>({
    queryKey: ["userPlacements", profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('User not logged in');
      return graphqlClient.request(GET_USER_PLACEMENTS, { creator_id: profile.id });
    },
    enabled: !!profile?.id,
  });

  // 获取用户找到的宝藏
  const userFindings = useQuery<UserFindingsResponse>({
    queryKey: ["userFindings", profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('User not logged in');
      return graphqlClient.request(GET_USER_FINDINGS, { finder_id: profile.id });
    },
    enabled: !!profile?.id,
  });

  return {
    treasures: data?.treasures || [],
    userPlacements: userPlacements.data?.treasures || [],
    userFindings: userFindings.data?.treasures || [],
    isLoading,
    error,
    createTreasure,
    verifyTreasure,
    updateTreasure,
    deleteTreasure,
  };
}

export type { Treasure };
