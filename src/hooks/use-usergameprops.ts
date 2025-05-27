import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import {
  GET_USER_GAME_PROPS,
  UPDATE_USER_GAME_PROPS,
  INCREMENT_USER_GAME_PROPS,
} from "@/graphql/usergameprops";
import { useWalletUser } from "./use-wallet-user";

interface UserGameProps {
  energy: number;
  xp: number;
  coins: number;
  balance: number;
}

interface UserGamePropsResponse {
  users_by_pk: UserGameProps;
}

export function useUserGameProps() {
  const queryClient = useQueryClient();
  const { profile } = useWalletUser();
  const userId = profile?.id;

  // Get user game properties
  const { data, isLoading, error } = useQuery<UserGamePropsResponse>({
    queryKey: ["userGameProps", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not logged in");

      const response = await graphqlClient.request<UserGamePropsResponse>(
        GET_USER_GAME_PROPS,
        { userId }
      );

      return response;
    },
    enabled: !!userId,
  });

  // Update user game properties
  const updateGameProps = useMutation({
    mutationFn: async (props: Partial<UserGameProps>) => {
      if (!userId) throw new Error("User not logged in");

      return graphqlClient.request(UPDATE_USER_GAME_PROPS, {
        userId,
        ...props,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userGameProps", userId] });
    },
  });

  // Increment user game properties
  const incrementGameProps = useMutation({
    mutationFn: async (increments: {
      energyInc?: number;
      xpInc?: number;
      coinsInc?: number;
      balanceInc?: number;
    }) => {
      if (!userId) throw new Error("User not logged in");

      return graphqlClient.request(INCREMENT_USER_GAME_PROPS, {
        userId,
        energyInc: increments.energyInc || 0,
        xpInc: increments.xpInc || 0,
        coinsInc: increments.coinsInc || 0,
        balanceInc: increments.balanceInc || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userGameProps", userId] });
    },
  });

  // Default values if data is not available
  const gameProps: UserGameProps = data?.users_by_pk || {
    energy: 0,
    xp: 0,
    coins: 0,
    balance: 0,
  };

  return {
    gameProps,
    isLoading,
    error,
    updateGameProps,
    incrementGameProps,
  };
}

export type { UserGameProps };
