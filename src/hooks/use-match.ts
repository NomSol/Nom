// src/hooks/use-match.ts
import { useQuery, useMutation, useQueryClient, type QueryKey, QueryFunctionContext } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import {
  GET_MATCH_DETAILS,
  CREATE_MATCH,
  CREATE_TEAM,
  ADD_TEAM_MEMBER,
  RECORD_DISCOVERY,
  UPDATE_MATCH_STATUS,
  UPDATE_TEAM_SCORE,
  GET_USER_MATCH_HISTORY,
  GET_WAITING_MATCHES,
} from "@/graphql/matches";
import type {
  Match,
  MatchTeam,
  CreateMatchInput,
  CreateTeamInput,
  AddTeamMemberInput,
  RecordDiscoveryInput,
  UpdateMatchStatusInput,
  CreateMatchResponse,
  CreateTeamResponse,
  AddTeamMemberResponse,
  RecordDiscoveryResponse,
  UpdateMatchStatusResponse,
  GetMatchDetailsResponse,
  GetWaitingMatchesResponse,
  GetUserMatchHistoryResponse,
} from "@/types/matches";

type MatchQueryKey = readonly ["match", string];
type WaitingMatchesQueryKey = readonly ["waiting-matches", string];

export function useMatch(id: string) {
  return useQuery({
    queryKey: ["match", id] as const,
    queryFn: async ({ queryKey }: QueryFunctionContext<MatchQueryKey>) => {
      try {
        const [_, matchId] = queryKey;
        const response = await graphqlClient.request<GetMatchDetailsResponse>(
          GET_MATCH_DETAILS,
          { id: matchId }
        );
        
        if (!response.treasure_matches_by_pk) {
          throw new Error('Match not found');
        }
        
        return response.treasure_matches_by_pk;
      } catch (error) {
        console.error('Error fetching match:', error);
        throw error;
      }
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data as Match | undefined;
      if (!data) return false;
      return (data.status === 'matching' || data.status === 'playing') 
        ? 1000 
        : false;
    },
  });
}

export function useWaitingMatches(matchType: string) {
  return useQuery({
    queryKey: ["waiting-matches", matchType] as const,
    queryFn: async ({ queryKey }: QueryFunctionContext<WaitingMatchesQueryKey>) => {
      const [_, type] = queryKey;
      const response = await graphqlClient.request<GetWaitingMatchesResponse>(
        GET_WAITING_MATCHES,
        { matchType: type }
      );
      return response.treasure_matches;
    },
  });
}

export function useUserMatchHistory(userId: string) {
  return useQuery({
    queryKey: ['match-history', userId] as const,
    queryFn: async () => {
      const response = await graphqlClient.request<GetUserMatchHistoryResponse>(
        GET_USER_MATCH_HISTORY,
        { userId }
      );
      return response.match_members;
    },
    enabled: Boolean(userId),
  });
}

export function useMatchActions() {
  const queryClient = useQueryClient();

  const createMatch = useMutation<
    CreateMatchResponse["insert_treasure_matches_one"],
    Error,
    { object: CreateMatchInput }
  >({
    mutationFn: async (variables) => {
      // 1. 创建对局
      const matchResponse = await graphqlClient.request<CreateMatchResponse>(
        CREATE_MATCH,
        {
          object: {
            match_type: variables.object.match_type,
            status: variables.object.status
          }
        }
      );

      const match = matchResponse.insert_treasure_matches_one;

      // 2. 创建两个队伍
      const teams = await Promise.all([
        graphqlClient.request<CreateTeamResponse>(
          CREATE_TEAM,
          {
            object: {
              match_id: match.id,
              team_number: 1
            }
          }
        ),
        graphqlClient.request<CreateTeamResponse>(
          CREATE_TEAM,
          {
            object: {
              match_id: match.id,
              team_number: 2
            }
          }
        )
      ]);

      return {
        ...match,
        match_teams: teams.map(t => t.insert_match_teams_one)
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-matches"] });
    },
  });

  const addTeamMember = useMutation<
    AddTeamMemberResponse["insert_match_members_one"], 
    Error, 
    { object: AddTeamMemberInput }
  >({
    mutationFn: async (variables) => {
      const response = await graphqlClient.request<AddTeamMemberResponse>(
        ADD_TEAM_MEMBER,
        variables
      );
      return response.insert_match_members_one;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["match", variables.object.match_id],
      });
    },
  });

  const recordDiscovery = useMutation<
    RecordDiscoveryResponse["insert_match_discoveries_one"],
    Error,
    { object: RecordDiscoveryInput }
  >({
    mutationFn: async (variables) => {
      const response = await graphqlClient.request<RecordDiscoveryResponse>(
        RECORD_DISCOVERY,
        variables
      );
      return response.insert_match_discoveries_one;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["match", variables.object.match_id],
      });
    },
  });

  const updateMatchStatus = useMutation<
    UpdateMatchStatusResponse["update_treasure_matches_by_pk"],
    Error,
    UpdateMatchStatusInput
  >({
    mutationFn: async (variables) => {
      const response = await graphqlClient.request<UpdateMatchStatusResponse>(
        UPDATE_MATCH_STATUS,
        variables
      );
      return response.update_treasure_matches_by_pk;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["match", variables.id],
      });
    },
  });

  return {
    createMatch,
    addTeamMember,
    recordDiscovery,
    updateMatchStatus,
  };
}