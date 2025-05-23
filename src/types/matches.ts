// 基础实体类型
export interface Match {
  id: string;
  match_type: string;
  status: string;
  start_time: string;
  end_time: string;
  duration: string;          
  required_players_per_team: number;
  winner_team_id?: string;         
  is_finished?: boolean;    
  match_teams: MatchTeam[];
}

export interface MatchTeam {
  id: string;
  team_number: number;
  total_score: number;
  current_players: number;
  max_players: number;
  match_members: MatchMember[];
  match_discoveries: MatchDiscovery[];
}

export interface MatchMember {
  id: string;
  user_id: string;
  individual_score: number;
  user: {
    id: string;
    nickname: string;
    avatar_url: string;
  };
  team: {
    id: string;
    team_number: number;
    total_score: number;
  };
}

export interface MatchDiscovery {
  id: string;
  treasure_id: string;
  score: number;
  discovered_at: string;
  treasure: {
    id: string;
    name: string;
    points: number;
  };
}

// ===== 结算相关类型定义 =====

// 结算输入类型
export interface SettleMatchInput {
  match_id: string;
  winner_team_id: string;
  end_time?: string;
}

// 结算响应类型
export interface SettleMatchResponse {
  update_treasure_matches_by_pk: {
    id: string;
    status: string;
    end_time: string;
    winner_team_id: string;
    match_teams: {
      id: string;
      team_number: number;
      total_score: number;
      match_members: {
        id: string;
        user_id: string;
        individual_score: number;
      }[];
    }[];
  };
}

// Mutation 输入类型
export interface CreateMatchInput {
  match_type: string;
  required_players_per_team: number;
  status?: string;
  user_id: string;
}

export interface CreateTeamInput {
  match_id: string;
  team_number: number;
  max_players: number;
  current_players: number;
}

export interface CreateMemberInput {
  user_id: string;
  individual_score?: number;
}

export interface AddTeamMemberInput {
  match_id: string;
  team_id: string;
  user_id: string;
  individual_score?: number;
}

export interface UpdateTeamPlayersInput {
  team_id: string;
  current_players: number;
}


export interface UpdateMatchStatusInput {
  id: string;
  status: string;
}

export interface UpdateTeamScoreInput {
  id: string;
  total_score: number;
}

// GraphQL 响应类型
export interface CreateMatchResponse {
  insert_treasure_matches_one: {
    id: string;
    match_type: string;
    status: string;
    match_teams: {
      id: string;
      team_number: number;
      current_players: number;
      max_players: number;
      match_members: {
        id: string;
        user_id: string;
      }[];
    }[];
  };
}

export interface CreateTeamResponse {
  insert_match_teams: {
    returning: Array<{
      id: string;
      team_number: number;
      current_players: number;
      max_players: number;
    }>;
  };
}

export interface AddTeamMemberResponse {
  insert_match_members_one: MatchMember;
}

export interface RecordDiscoveryResponse {
  insert_match_discoveries_one: MatchDiscovery;
}

export interface UpdateMatchStatusResponse {
  update_treasure_matches_by_pk: Match;
}

export interface MatchStatus {
  id: string;
  status: string;
  match_teams: {
    id: string;
    current_players: number;
    max_players: number;
  }[];
}

export interface MatchStatusResponse {
  treasure_matches_by_pk: MatchStatus;
}


export interface UpdateTeamScoreResponse {
  update_match_teams_by_pk: MatchTeam;
}

export interface GetMatchDetailsResponse {
  treasure_matches_by_pk: Match;
}

export interface GetWaitingMatchesResponse {
  treasure_matches: Match[];
}

export interface GetUserMatchHistoryResponse {
  match_members: MatchMember[];
}

export interface MatchSubscriptionResponse {
  treasure_matches_by_pk: Match;
}

export interface WaitingMatchesSubscriptionResponse {
  treasure_matches: Match[];
}

export interface UpdateTeamPlayersResponse {
  update_match_teams_by_pk: {
    id: string;
    current_players: number;
    max_players: number;
  };
}

export interface CheckExistingMatchResponse {
  match_members: {
    match_id: string;
  }[];
}