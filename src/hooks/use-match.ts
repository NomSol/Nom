// hooks/use-match.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// 基础类型定义
export interface Match {
  id: string;
  match_type: string;
  status: string;
  start_time: string;
  end_time: string;
  match_teams: MatchTeam[];
}

interface MatchTeam {
  id: string;
  team_number: number;
  total_score: number;
  match_members: MatchMember[];
  match_discoveries: MatchDiscovery[];
}

interface MatchMember {
    id: string;
    user_id: string;
    individual_score: number;
    user: {
      nickname: string;
      avatar_url: string;
    };
    team: {
      id: string;
      team_number: number;
      total_score: number;
    };
    match: {
      id: string;
      match_type: string;
      status: string;
      start_time: string;
      end_time: string;
      match_teams: {
        id: string;
        team_number: number;
        total_score: number;
      }[];
    };
  }

interface MatchDiscovery {
  id: string;
  treasure_id: string;
  score: number;
  discovered_at: string;
  treasure: {
    name: string;
    points: number;
  };
}

// 请求和响应类型定义
interface CreateMatchInput {
  match_type: string;
  status: string;
  match_teams: {
    data: { team_number: number }[];
  };
}

interface CreateMatchResponse {
  insert_treasure_matches_one: Match & {
    match_teams: MatchTeam[];
  };
}

interface GetMatchDetailsResponse {
  treasure_matches_by_pk: Match;
}

interface GetWaitingMatchesResponse {
  treasure_matches: Match[];
}

interface GetUserMatchHistoryResponse {
    match_members: MatchMember[];
  }

interface AddTeamMemberResponse {
  insert_match_members_one: MatchMember;
}

interface RecordDiscoveryResponse {
  insert_match_discoveries_one: MatchDiscovery;
}

interface UpdateMatchStatusResponse {
  update_treasure_matches_by_pk: Match;
}

interface UpdateTeamScoreResponse {
  update_match_teams_by_pk: MatchTeam;
}

// Hook 实现
export function useMatch(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["match", id],
    queryFn: async () => {
      const response = await graphqlClient.request<GetMatchDetailsResponse>(
        GET_MATCH_DETAILS,
        { id }
      );
      console.log('Match details response:', response);
      return response.treasure_matches_by_pk;
    },
    enabled: !!id,
  });

  return {
    match: data,
    isLoading,
  };
}

export function useWaitingMatches(matchType: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["waiting-matches", matchType],
    queryFn: async () => {
      const response = await graphqlClient.request<GetWaitingMatchesResponse>(
        GET_WAITING_MATCHES,
        { matchType }
      );
      return response.treasure_matches;
    },
  });

  return {
    waitingMatches: data,
    isLoading,
  };
}

export function useUserMatchHistory(userId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["match-history", userId],
    queryFn: async () => {
      const response = await graphqlClient.request<GetUserMatchHistoryResponse>(
        GET_USER_MATCH_HISTORY,
        { userId }
      );
      return response.match_members;
    },
    enabled: !!userId,
  });

  return {
    matchHistory: data,
    isLoading,
  };
}

export function useMatchActions() {
    const queryClient = useQueryClient();
  
    // 为 mutation 定义返回类型和变量类型
    type CreateMatchResult = Match & { match_teams: MatchTeam[] };
    type CreateMatchVariables = {
      object: {
        match_type: string;
        status: string;
        match_teams: {
          data: { team_number: number }[];
        };
      };
    };
  
    type AddTeamMemberResult = MatchMember;
    type AddTeamMemberVariables = {
      object: {
        match_id: string;
        team_id: string;
        user_id: string;
      };
    };
  
    type RecordDiscoveryResult = MatchDiscovery;
    type RecordDiscoveryVariables = {
      object: {
        match_id: string;
        team_id: string;
        treasure_id: string;
        score: number;
      };
    };
  
    type UpdateMatchStatusResult = Match;
    type UpdateMatchStatusVariables = {
      id: string;
      status: string;
    };
  
    const createMatch = useMutation({
      mutationFn: async (variables: { object: CreateMatchInput }) => {
        // 1. 创建对局
        const matchResponse = await graphqlClient.request<{ insert_treasure_matches_one: Match }>(
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
          graphqlClient.request<{ insert_match_teams_one: MatchTeam }>(
            CREATE_TEAM,
            {
              object: {
                match_id: match.id,
                team_number: 1
              }
            }
          ),
          graphqlClient.request<{ insert_match_teams_one: MatchTeam }>(
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
  
    const addTeamMember = useMutation<AddTeamMemberResult, Error, AddTeamMemberVariables>({
      mutationFn: async (variables) => {
        const response = await graphqlClient.request<{ insert_match_members_one: AddTeamMemberResult }>(
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
  
    const recordDiscovery = useMutation<RecordDiscoveryResult, Error, RecordDiscoveryVariables>({
      mutationFn: async (variables) => {
        const response = await graphqlClient.request<{ insert_match_discoveries_one: RecordDiscoveryResult }>(
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
  
    const updateMatchStatus = useMutation<UpdateMatchStatusResult, Error, UpdateMatchStatusVariables>({
      mutationFn: async (variables) => {
        const response = await graphqlClient.request<{ update_treasure_matches_by_pk: UpdateMatchStatusResult }>(
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