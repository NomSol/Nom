import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import type { 
  Match, 
  CreateMatchInput, 
  AddTeamMemberInput,
  UpdateTeamPlayersInput,
  GetMatchDetailsResponse,
  GetWaitingMatchesResponse,
  CreateMatchResponse,
  AddTeamMemberResponse,
  UpdateTeamPlayersResponse,
  UpdateMatchStatusResponse,
  CreateTeamResponse
} from "@/types/matches";

import { 
  ADD_TEAM_MEMBER, 
  CREATE_MATCH, 
  CREATE_TEAMS, 
  GET_MATCH_DETAILS, 
  GET_WAITING_MATCHES, 
  UPDATE_MATCH_STATUS, 
  UPDATE_TEAM_PLAYERS 
} from "@/graphql/matches";

const CURRENT_MATCH_KEY = ['current-match'] as const;

export function useCurrentMatch() {
  const queryClient = useQueryClient();
  
  return {
    currentMatchId: queryClient.getQueryData<string>(CURRENT_MATCH_KEY),
    setCurrentMatch: (matchId: string) => {
      queryClient.setQueryData(CURRENT_MATCH_KEY, matchId);
    },
    clearCurrentMatch: () => {
      queryClient.setQueryData(CURRENT_MATCH_KEY, null);
    }
  };
}

// 使用单个对战详情
export function useMatch(id: string) {
  return useQuery({
    queryKey: ["match", id],
    queryFn: async () => {
      const response = await graphqlClient.request<GetMatchDetailsResponse>(
        GET_MATCH_DETAILS, 
        { id }
      );
      
      // 添加数据校验和转换
      const match = response.treasure_matches_by_pk;
      if (!match) {
        throw new Error('Match not found');
      }
      
      // 确保 match_teams 是数组
      return {
        ...match,
        match_teams: match.match_teams || []
      };
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data as Match | undefined;
      return (data?.status === 'matching' || data?.status === 'playing') 
        ? 1000 
        : false;
    },
  });
}


export function useWaitingMatches(matchType: string) {
  return useQuery({
    queryKey: ["waiting-matches", matchType] as const,
    queryFn: async () => {
      const response = await graphqlClient.request<GetWaitingMatchesResponse>(
        GET_WAITING_MATCHES, 
        { matchType }
      );
      return response.treasure_matches;
    },
    enabled: Boolean(matchType),
    refetchInterval: 1000,
  });
}

export function useMatchActions() {
  const queryClient = useQueryClient();
  const { setCurrentMatch } = useCurrentMatch();

  const createMatch = useMutation({
    mutationFn: async (variables: { object: CreateMatchInput }) => {
      // 1. 创建对局
      const matchResponse = await graphqlClient.request<CreateMatchResponse>(
        CREATE_MATCH,
        {
          match_type: variables.object.match_type,
          required_players_per_team: variables.object.required_players_per_team
        }
      );

      const match = matchResponse.insert_treasure_matches_one;

      // 2. 创建两个队伍
      const teamsResponse = await graphqlClient.request<CreateTeamResponse>(
        CREATE_TEAMS,
        {
          teams: [
            {
              match_id: match.id,
              team_number: 1,
              max_players: variables.object.required_players_per_team,
              current_players: 1
            },
            {
              match_id: match.id,
              team_number: 2,
              max_players: variables.object.required_players_per_team,
              current_players: 0
            }
          ]
        }
      );

      return {
        ...match,
        match_teams: teamsResponse.insert_match_teams.returning
      };
    },
    onSuccess: (data) => {
      setCurrentMatch(data.id);
      queryClient.invalidateQueries({ queryKey: ["waiting-matches"] });
    },
  });

  const addTeamMember = useMutation({
    mutationFn: async (variables: { object: AddTeamMemberInput }) => {
      const response = await graphqlClient.request<AddTeamMemberResponse>(
        ADD_TEAM_MEMBER, 
        variables
      );
      return response.insert_match_members_one;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["match", variables.object.match_id]
      });
      queryClient.invalidateQueries({ 
        queryKey: ["waiting-matches"]
      });
    },
  });

  const updateTeamPlayers = useMutation({
    mutationFn: async (variables: UpdateTeamPlayersInput) => {
      const response = await graphqlClient.request<UpdateTeamPlayersResponse>(
        UPDATE_TEAM_PLAYERS, 
        variables
      );
      return response.update_match_teams_by_pk;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waiting-matches"] });
    },
  });

  const updateMatchStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await graphqlClient.request<UpdateMatchStatusResponse>(
        UPDATE_MATCH_STATUS,
        {
          id,
          status,
        }
      );
      return response.update_treasure_matches_by_pk;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["match", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["waiting-matches"] });
    },
  });

  return {
    createMatch,
    addTeamMember,
    updateTeamPlayers,
    updateMatchStatus,
  };
}

// 添加匹配超时清理函数
export function useMatchCleanup() {
  const { updateMatchStatus } = useMatchActions();
  
  return useMutation({
    mutationFn: async (matchId: string) => {
      await updateMatchStatus.mutateAsync({
        id: matchId,
        status: 'cancelled'
      });
    },
  });
}