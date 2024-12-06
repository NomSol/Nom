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