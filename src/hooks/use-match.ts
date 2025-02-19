import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql-client";
import { createClient } from 'graphql-ws';
import { useEffect } from 'react';
import type { 
  Match, 
  CreateMatchInput, 
  AddTeamMemberInput,
  UpdateTeamPlayersInput,
  GetMatchDetailsResponse,
  GetWaitingMatchesResponse,
  CreateMatchResponse,
  CreateTeamResponse,
  AddTeamMemberResponse,
  MatchSubscriptionResponse,
  WaitingMatchesSubscriptionResponse,
  UpdateTeamPlayersResponse,
  MatchStatusResponse,
  SettleMatchInput,
  SettleMatchResponse
} from "@/types/matches";

import { 
  ADD_TEAM_MEMBER, 
  CHECK_EXISTING_MATCH, 
  CREATE_MATCH, 
  CREATE_TEAMS, 
  DELETE_MATCH, 
  GET_MATCH_DETAILS, 
  GET_WAITING_MATCHES, 
  LEAVE_MATCH, 
  UPDATE_TEAM_PLAYERS,
  MATCH_SUBSCRIPTION,
  WAITING_MATCHES_SUBSCRIPTION,
  GET_MATCH_RESULT,
  SETTLE_MATCH
} from "@/graphql/matches";

// WebSocket client
const wsClient = createClient({
  url: process.env.NEXT_PUBLIC_HASURA_ENDPOINT?.replace('https://', 'wss://').replace('/v1/graphql', '/v1/graphql') ?? '',
  connectionParams: {
    headers: {
      'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET ?? ''
    }
  }
});

// Current match management
export function useCurrentMatch() {
  const queryClient = useQueryClient();
  const currentMatchKey = ['current-match'] as const;

  const getSavedMatchId = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('currentMatchId');
  };

  const saveMatchId = (matchId: string | null) => {
    if (typeof window === 'undefined') return;
    if (matchId) {
      localStorage.setItem('currentMatchId', matchId);
    } else {
      localStorage.removeItem('currentMatchId');
    }
  };
  
  return {
    currentMatchId: queryClient.getQueryData<string>(currentMatchKey) || getSavedMatchId(),
    setCurrentMatch: (matchId: string) => {
      queryClient.setQueryData(currentMatchKey, matchId);
      saveMatchId(matchId);
    },
    clearCurrentMatch: () => {
      queryClient.setQueryData(currentMatchKey, null);
      saveMatchId(null);
    }
  };
}

export function useCheckMatchStatus(matchId: string | null) {
  return useQuery<MatchStatusResponse, Error>({
    queryKey: ['match-status', matchId],
    queryFn: async () => {
      if (!matchId) {
        throw new Error('No match ID provided');
      }
      
      const response = await graphqlClient.request<MatchStatusResponse>(`
        query CheckMatchStatus($id: uuid!) {
          treasure_matches_by_pk(id: $id) {
            id
            status
            match_teams {
              id
              current_players
              max_players
            }
          }
        }
      `, { id: matchId });

      if (!response.treasure_matches_by_pk) {
        throw new Error('Match not found');
      }

      return response;
    },
    enabled: Boolean(matchId),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.treasure_matches_by_pk?.status === 'matching' ? 1000 : false;
    }
  });
}

// Enhanced match hook with subscription
export function useMatch(matchId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = wsClient.subscribe(
      {
        query: MATCH_SUBSCRIPTION,
        variables: { matchId },
      },
      {
        next: (data: { data?: MatchSubscriptionResponse }) => {
          if (data.data?.treasure_matches_by_pk) {
            queryClient.setQueryData(["match", matchId], data.data.treasure_matches_by_pk);
          }
        },
        error: (err: Error) => {
          console.error('Match subscription error:', err);
        },
        complete: () => {
          console.log('Match subscription completed');
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [matchId, queryClient]);

  return useQuery({
    queryKey: ["match", matchId],
    queryFn: async () => {
      try {
        const response = await graphqlClient.request<GetMatchDetailsResponse>(
          GET_MATCH_DETAILS, 
          { matchId }
        );
        
        const match = response.treasure_matches_by_pk;
        if (!match) {
          throw new Error('Match not found');
        }
        
        return {
          ...match,
          match_teams: match.match_teams || []
        };
      } catch (error) {
        console.error('Error fetching match details:', error);
        throw error;
      }
    },
    enabled: Boolean(matchId),
    retry: false,
    staleTime: 0
  });
}

// Enhanced waiting matches hook with subscription
export function useWaitingMatches(matchType: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchType) return;

    const unsubscribe = wsClient.subscribe(
      {
        query: WAITING_MATCHES_SUBSCRIPTION,
        variables: { matchType },
      },
      {
        next: (data: { data?: WaitingMatchesSubscriptionResponse }) => {
          if (data.data?.treasure_matches) {
            queryClient.setQueryData(
              ["waiting-matches", matchType],
              data.data.treasure_matches
            );
          }
        },
        error: (err: Error) => {
          console.error('Waiting matches subscription error:', err);
        },
        complete: () => {
          console.log('Waiting matches subscription completed');
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [matchType, queryClient]);

  return useQuery({
    queryKey: ["waiting-matches", matchType] as const,
    queryFn: async () => {
      const response = await graphqlClient.request<GetWaitingMatchesResponse>(
        GET_WAITING_MATCHES, 
        { matchType }
      );
      return response.treasure_matches;
    },
    enabled: Boolean(matchType)
  });
}

// Match actions
export function useMatchActions() {
  const queryClient = useQueryClient();
  const { setCurrentMatch, clearCurrentMatch } = useCurrentMatch();

  const createMatch = useMutation({
    mutationFn: async (variables: { object: CreateMatchInput }) => {
      const matchResponse = await graphqlClient.request<CreateMatchResponse>(
        CREATE_MATCH,
        {
          match_type: variables.object.match_type,
          required_players_per_team: variables.object.required_players_per_team
        }
      );
  
      const match = matchResponse.insert_treasure_matches_one;
  
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
  
      const firstTeam = teamsResponse.insert_match_teams.returning[0];
      await graphqlClient.request<AddTeamMemberResponse>(ADD_TEAM_MEMBER, {
        object: {
          match_id: match.id,
          team_id: firstTeam.id,
          user_id: variables.object.user_id
        }
      });
  
      return match;
    },
    onSuccess: (data) => {
      setCurrentMatch(data.id);
    },
  });

  const addTeamMember = useMutation({
    mutationFn: async (variables: { object: AddTeamMemberInput }) => {
      const response = await graphqlClient.request<AddTeamMemberResponse>(
        ADD_TEAM_MEMBER, 
        variables
      );
      return response.insert_match_members_one;
    }
  });

  const updateTeamPlayers = useMutation({
    mutationFn: async (variables: UpdateTeamPlayersInput) => {
      const response = await graphqlClient.request<UpdateTeamPlayersResponse>(
        UPDATE_TEAM_PLAYERS, 
        variables
      );
      if (!response.update_match_teams_by_pk) {
        throw new Error('Failed to update team players');
      }
      return response.update_match_teams_by_pk;
    }
  });

  const leaveMatch = useMutation({
    mutationFn: async ({ match_id, user_id }: { match_id: string; user_id: string }) => {
      return graphqlClient.request(LEAVE_MATCH, { match_id, user_id });
    }
  });

  const deleteMatch = useMutation({
    mutationFn: async (match_id: string) => {
      return graphqlClient.request(DELETE_MATCH, { match_id });
    }
  });

  // Update the cancelMatch mutation in useMatchActions
const cancelMatch = useMutation({
  mutationFn: async ({ matchId, userId }: { matchId: string; userId: string }) => {
    try {
      // Get match details
      const matchResponse = await graphqlClient.request<GetMatchDetailsResponse>(
        GET_MATCH_DETAILS, 
        { matchId } // Updated from 'id' to 'matchId'
      );

      console.log('Match response:', matchResponse);

      const match = matchResponse?.treasure_matches_by_pk;
      if (!match) {
        throw new Error('Match not found');
      }

      // Try to delete the match
      console.log('Attempting to delete match:', matchId);
      const deleteResponse = await graphqlClient.request(DELETE_MATCH, { 
        matchId // Updated from 'match_id' to 'matchId'
      });
      console.log('Delete response:', deleteResponse);

      return { success: true };
    } catch (error) {
      console.error('Cancel match error:', error);
      // If delete fails, try to leave the match
      try {
        console.log('Delete failed, attempting to leave match');
        await graphqlClient.request(LEAVE_MATCH, {
          matchId,
          userId
        });
        return { success: true };
      } catch (leaveError) {
        console.error('Leave match error:', leaveError);
        throw leaveError instanceof Error 
          ? leaveError 
          : new Error('Failed to cancel match');
      }
    }
  },
  onSuccess: () => {
    clearCurrentMatch();
    queryClient.invalidateQueries({ queryKey: ['match-status'] });
    queryClient.invalidateQueries({ queryKey: ['waiting-matches'] });
  },
  onError: (error: Error) => {
    console.error('Mutation error:', error.message);
  }
});

  
  const checkExistingMatch = async (userId: string): Promise<Match | null> => {
    try {
      const response = await graphqlClient.request<{ treasure_matches: Match[] }>(
        CHECK_EXISTING_MATCH, 
        { userId }
      );
      return response.treasure_matches?.[0] || null;
    } catch (error) {
      console.error("Error checking for existing match:", error);
      return null;
    }
  };

  return {
    createMatch,
    addTeamMember,
    updateTeamPlayers,
    leaveMatch,
    deleteMatch,
    checkExistingMatch,
    cancelMatch
  };
}

export function useMatchSettlement(matchId?: string) {
  const queryClient = useQueryClient();

  // 计算获胜队伍
  const calculateWinnerTeam = (match: Match) => {
    if (!match.match_teams?.length) return null;
    return [...match.match_teams].sort((a, b) => b.total_score - a.total_score)[0];
  };

  // 手动结算比赛
  const settleMatch = useMutation({
    mutationFn: async ({ match_id, winner_team_id }: SettleMatchInput) => {
      const response = await graphqlClient.request<SettleMatchResponse>(
        SETTLE_MATCH,
        { match_id, winner_team_id }
      );
      return response.update_treasure_matches_by_pk;
    },
    onSuccess: (data) => {
      // 更新相关查询缓存
      queryClient.invalidateQueries({ queryKey: ['match', data.id] });
      queryClient.invalidateQueries({ queryKey: ['match-result', data.id] });
    }
  });

  // 获取比赛结果
  const matchResult = useQuery({
    queryKey: ['match-result', matchId],
    queryFn: async () => {
      if (!matchId) throw new Error('Match ID is required');
      
      const response = await graphqlClient.request<{
        treasure_matches_by_pk: Match;
      }>(
        GET_MATCH_RESULT,
        { match_id: matchId }
      );
      
      if (!response?.treasure_matches_by_pk) {
        throw new Error('Match not found');
      }
      
      return response.treasure_matches_by_pk;
    },
    enabled: !!matchId 
  });

  return {
    settleMatch,
    matchResult,
    calculateWinnerTeam
  };
}