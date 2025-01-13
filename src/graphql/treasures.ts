// graphql/treasures.ts
import { gql } from 'graphql-request';

export const CREATE_TREASURE = gql`
  mutation CreateTreasure($object: treasures_insert_input!) {
    insert_treasures_one(object: $object) {
      id
      name
      description
      points
      hint
      latitude
      longitude
      status
      image_url
      created_at
      verification_code
      creator_id
    }
  }
`;

export const DELETE_TREASURE = gql`
  mutation DeleteTreasure($id: uuid!) {
    delete_treasures_by_pk(id: $id) {
      id
    }
  }
`;

export const GET_TREASURES = gql`
  query GetTreasures {
    treasures(order_by: { created_at: desc }) {
      id
      name
      description
      points
      hint
      latitude
      longitude
      status
      image_url
      created_at
      creator_id
      finder_id
      likes_count
    }
  }
`;

export const UPDATE_TREASURE = gql`
  mutation UpdateTreasure($id: uuid!, $set: treasures_set_input!) {
    update_treasures_by_pk(pk_columns: {id: $id}, _set: $set) {
      id
      name
      description
      points
      hint
      latitude
      longitude
      status
      image_url
      updated_at
    }
  }
`;

export const GET_TREASURE_BY_ID = gql`
  query GetTreasureById($id: uuid!) {
    treasures_by_pk(id: $id) {
      id
      name
      description
      points
      hint
      latitude
      longitude
      status
      image_url
      created_at
      updated_at
    }
  }
`;

export const VERIFY_TREASURE = gql`
  mutation VerifyTreasure($id: uuid!, $verification_code: String!, $finder_id: uuid!) {
    update_treasures(
      where: { 
        id: { _eq: $id },
        verification_code: { _eq: $verification_code },
        finder_id: { _is_null: true }
      },
      _set: { 
        finder_id: $finder_id 
      }
    ) {
      returning {
        id
        name
        points
        verification_code
        finder_id
      }
      affected_rows
    }
  }
`;

export const GET_USER_PLACEMENTS = gql`
  query GetUserPlacements($creator_id: uuid!) {
    treasures(where: { creator_id: { _eq: $creator_id } }) {
      id
      name
      description
      points
      hint
      latitude
      longitude
      status
      image_url
      created_at
      verification_code
      finder_id
      likes_count
    }
  }
`;

export const GET_USER_FINDINGS = gql`
  query GetUserFindings($finder_id: uuid!) {
    treasures(where: { finder_id: { _eq: $finder_id } }) {
      id
      name
      description
      points
      hint
      latitude
      longitude
      status
      image_url
      created_at
      creator_id
      likes_count
    }
  }
`;