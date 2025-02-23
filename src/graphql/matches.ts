import { gql } from 'graphql-request';

//
// 创建对局
export const CREATE_MATCH = gql`
  mutation CreateMatch($match_type: String!, $required_players_per_team: Int!) {
    insert_treasure_matches_one(
      object: {
        match_type: $match_type,
        status: "matching",
        required_players_per_team: $required_players_per_team
      }
    ) {
      id
      match_type
      status
    }
  }
`;

// 创建队伍
export const CREATE_TEAMS = gql`
  mutation CreateTeams($teams: [match_teams_insert_input!]!) {
    insert_match_teams(objects: $teams) {
      returning {
        id
        team_number
        current_players
        max_players
      }
    }
  }
`;

// 添加队伍成员
export const ADD_TEAM_MEMBER = gql`
  mutation AddTeamMember($object: match_members_insert_input!) {
    insert_match_members_one(object: $object) {
      id
      match_id
      team_id
      user_id
      individual_score
      user {                  
        id
        nickname
        avatar_url
      }
      team {              
        id
        team_number
        total_score
      }
    }
  }
`;


// 更新对战状态
export const UPDATE_MATCH_STATUS = gql`
  mutation UpdateMatchStatus($id: uuid!, $status: String!) {
    update_treasure_matches_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
    }
  }
`;

// 更新队伍人数
export const UPDATE_TEAM_PLAYERS = gql`
  mutation UpdateTeamPlayers($team_id: uuid!, $current_players: Int!) {
    update_match_teams_by_pk(
      pk_columns: { id: $team_id }
      _set: { current_players: $current_players }
    ) {
      id
      current_players
      max_players         
    }
  }
`;

// 更新队伍分数
export const UPDATE_TEAM_SCORE = gql`
  mutation UpdateTeamScore($id: uuid!, $score: Int!) {
    update_match_teams_by_pk(
      pk_columns: { id: $id }
      _set: { total_score: $score }
    ) {
      id
      total_score
    }
  }
`;

// 记录宝藏发现
export const RECORD_DISCOVERY = gql`
  mutation RecordDiscovery($object: match_discoveries_insert_input!) {
    insert_match_discoveries_one(object: $object) {
      id
      match_id
      team_id
      user_id
      treasure_id
      score
      discovered_at
    }
  }
`;

// 获取对战详情
export const GET_MATCH_DETAILS = gql`
  query GetMatchDetails($matchId: uuid!) {
    treasure_matches_by_pk(id: $matchId) {
      id
      match_type
      status
      start_time
      end_time
      duration
      winner_team_id
      is_finished
      required_players_per_team
      match_teams {
        id
        team_number
        total_score
        current_players
        max_players
        match_members {
          id
          user_id
          individual_score
          user {
            id
            nickname
            avatar_url
          }
        }
        match_discoveries {
          id
          treasure_id
          score
          discovered_at
          treasure {
            id
            name
            points
          }
        }
      }
    }
  }
`;

// 获取用户的对战历史
export const GET_USER_MATCH_HISTORY = gql`
  query GetUserMatchHistory($userId: uuid!) {
    match_members(
      where: { user_id: { _eq: $userId } }
      order_by: { created_at: desc }
    ) {
      match {
        id
        match_type
        status
        start_time
        end_time
        match_teams {
          id
          team_number
          total_score
        }
      }
      team {
        team_number
        total_score
      }
      individual_score
    }
  }
`;

export const CHECK_EXISTING_MATCH = gql`
  query CheckExistingMatch($userId: uuid!) {
    treasure_matches(
      where: {
        status: { _eq: "matching" },
        match_teams: {
          match_members: {
            user_id: { _eq: $userId }
          }
        }
      }
    ) {
      id
      match_type
      status
      start_time
      end_time
      required_players_per_team
      match_teams {
        id
        team_number
        current_players
        max_players
        match_members {
          id
          user_id
        }
      }
    }
  }
`;

// 获取正在等待的对战
export const GET_WAITING_MATCHES = gql`
  query GetWaitingMatches($matchType: String!) {
    treasure_matches(
      where: {
        status: { _eq: "matching" },
        match_type: { _eq: $matchType }
      }
    ) {
      id
      match_type
      status                   
      start_time              
      end_time                 
      required_players_per_team
      match_teams {
        id
        team_number
        current_players
        max_players
        match_members {
          id
          user_id
        }
      }
    }
  }
`;

// Subscription documents
export const MATCH_SUBSCRIPTION = gql`
  subscription OnMatchUpdate($matchId: uuid!) {
    treasure_matches_by_pk(id: $matchId) {
      id
      match_type
      status
      start_time
      end_time
      duration
      winner_team_id
      is_finished
      required_players_per_team
      match_teams {
        id
        team_number
        total_score
        current_players
        max_players
        match_members {
          id
          user_id
          individual_score
          user {
            id
            nickname
            avatar_url
          }
        }
        match_discoveries {
          id
          treasure_id
          score
          discovered_at
          treasure {
            id
            name
            points
          }
        }
      }
    }
  }
`;

export const WAITING_MATCHES_SUBSCRIPTION = gql`
  subscription OnWaitingMatchesUpdate($matchType: String!) {
    treasure_matches(
      where: {
        status: { _eq: "matching" }
        match_type: { _eq: $matchType }
      }
    ) {
      id
      match_type
      status
      required_players_per_team
      match_teams(order_by: { team_number: asc }) {
        id
        team_number
        current_players
        max_players
        match_members {
          id
          user_id
          user {
            nickname
            avatar_url
          }
        }
      }
    }
  }
`;

export const DELETE_MATCH = gql`
  mutation DeleteMatch($matchId: uuid!) {
    delete_treasure_matches_by_pk(id: $matchId) {
      id
    }
  }
`;

export const LEAVE_MATCH = gql`
  mutation LeaveMatch($matchId: uuid!, $userId: uuid!) {
    delete_match_members(
      where: { 
        match_id: { _eq: $matchId },
        user_id: { _eq: $userId }
      }
    ) {
      affected_rows
    }
  }
`;

// 手动结算比赛（主要用于测试或特殊情况）
export const SETTLE_MATCH = gql`
  mutation SettleMatch($match_id: uuid!, $winner_team_id: uuid!) {
    update_treasure_matches_by_pk(
      pk_columns: { id: $match_id }
      _set: {
        status: "finished",
        end_time: "now()",
        winner_team_id: $winner_team_id,
        is_finished: true
      }
    ) {
      id
      status
      end_time
      winner_team_id
      match_teams {
        id
        team_number
        total_score
        match_members {
          id
          user_id
          individual_score
        }
      }
    }
  }
`;

// 获取结算结果
export const GET_MATCH_RESULT = gql`
  query GetMatchResult($match_id: uuid!) {
    treasure_matches_by_pk(id: $match_id) {
      id
      status
      start_time
      end_time
      duration
      winner_team_id
      match_teams {
        id
        team_number
        total_score
        match_members {
          id
          user_id
          individual_score
          user {
            nickname
            avatar_url
          }
        }
        match_discoveries {
          id
          treasure_id
          score
          discovered_at
          treasure {
            name
            points
          }
        }
      }
    }
  }
`;