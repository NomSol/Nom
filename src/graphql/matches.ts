import { gql } from 'graphql-request';

// 创建对战
export const CREATE_MATCH = gql`
  mutation CreateMatch($object: treasure_matches_insert_input!) {
    insert_treasure_matches_one(object: $object) {
      id
      match_type
      status
      start_time
      end_time
      created_at
    }
  }
`;

// 创建队伍
export const CREATE_TEAM = gql`
  mutation CreateTeam($object: match_teams_insert_input!) {
    insert_match_teams_one(object: $object) {
      id
      match_id
      team_number
      total_score
      created_at
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
      created_at
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
  query GetMatchDetails($id: uuid!) {
    treasure_matches_by_pk(id: $id) {
      id
      match_type
      status
      start_time
      end_time
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
      created_at
      match_teams {
        match_members_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`;