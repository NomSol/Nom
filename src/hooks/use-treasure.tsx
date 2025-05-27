// hooks/use-treasure.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Treasure, VerifyTreasureInput } from "@/types/treasure";
import { useUserProfile } from "./use-user";
import { firebaseApiClient } from "@/lib/firebase-api-client";

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
      const response = await firebaseApiClient.getTreasureById(id);
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

  // Get all treasures
  const { data, isLoading, error } = useQuery<GetTreasuresResponse>({
    queryKey: ["treasures"],
    queryFn: async () => {
      return firebaseApiClient.getAllTreasures();
    },
  });

  // Generate a 6-digit random verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Create treasure
  const createTreasure = useMutation({
    mutationFn: async (input: CreateTreasureInput) => {
      const verification_code = generateVerificationCode();
      const treasureData = {
        ...input,
        verification_code,
        creator_id: profile?.id,
        status: 'ACTIVE',
      };

      return firebaseApiClient.createTreasure(treasureData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
      queryClient.invalidateQueries({ queryKey: ["userPlacements"] });
    },
  });

  // Update treasure
  const updateTreasure = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateTreasureInput>;
    }) => firebaseApiClient.updateTreasure(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
      queryClient.invalidateQueries({ queryKey: ["treasure"] });
    },
  });

  // Delete treasure
  const deleteTreasure = useMutation({
    mutationFn: (id: string) => firebaseApiClient.deleteTreasure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
    },
  });

  // Verify treasure
  const verifyTreasure = useMutation({
    mutationFn: async ({ id, verification_code }: VerifyTreasureInput) => {
      if (!profile?.id) throw new Error('User not logged in');

      return firebaseApiClient.verifyTreasure(id, verification_code, profile.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treasures"] });
      queryClient.invalidateQueries({ queryKey: ["userFindings"] });
    },
  });

  // Get user placements
  const userPlacements = useQuery<UserPlacementsResponse>({
    queryKey: ["userPlacements", profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('User not logged in');
      return firebaseApiClient.getUserPlacements(profile.id);
    },
    enabled: !!profile?.id,
  });

  // Get user findings
  const userFindings = useQuery<UserFindingsResponse>({
    queryKey: ["userFindings", profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error('User not logged in');
      return firebaseApiClient.getUserFindings(profile.id);
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
