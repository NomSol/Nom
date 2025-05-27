import { gql } from 'graphql-request';

export const CREATE_STATION = gql`
  mutation CreateStation($object: recycling_stations_insert_input!) {
    insert_recycling_stations_one(object: $object) {
      id
      name
      description
      capacity
      level
      latitude
      longitude
      status
      image_url
      created_at
      owner_id
      current_usage
      earnings
      is_official
      special_features
    }
  }
`;

export const DELETE_STATION = gql`
  mutation DeleteStation($id: uuid!) {
    delete_recycling_stations_by_pk(id: $id) {
      id
    }
  }
`;

export const GET_STATIONS = gql`
  query GetStations {
    recycling_stations(order_by: { created_at: desc }) {
      id
      name
      description
      capacity
      level
      latitude
      longitude
      status
      image_url
      created_at
      owner_id
      current_usage
      earnings
      is_official
      special_features
    }
  }
`;

export const UPDATE_STATION = gql`
  mutation UpdateStation($id: uuid!, $set: recycling_stations_set_input!) {
    update_recycling_stations_by_pk(pk_columns: {id: $id}, _set: $set) {
      id
      name
      description
      capacity
      level
      latitude
      longitude
      status
      image_url
      updated_at
      current_usage
      earnings
    }
  }
`;

export const GET_STATION_BY_ID = gql`
  query GetStationById($id: uuid!) {
    recycling_stations_by_pk(id: $id) {
      id
      name
      description
      capacity
      level
      latitude
      longitude
      status
      image_url
      created_at
      updated_at
      owner_id
      current_usage
      earnings
      is_official
      special_features
    }
  }
`;

export const RECYCLE_COINS = gql`
  mutation RecycleCoins($object: dead_coins_insert_input!) {
    insert_dead_coins_one(object: $object) {
      id
      user_id
      station_id
      coin_name
      coin_symbol
      coin_contract
      amount
      usdt_value
      death_index
      rewards {
        nom_tokens
        points
      }
      transaction_hash
      created_at
    }
  }
`;

export const GET_USER_STATIONS = gql`
  query GetUserStations($owner_id: uuid!) {
    recycling_stations(where: { owner_id: { _eq: $owner_id } }) {
      id
      name
      description
      capacity
      level
      latitude
      longitude
      status
      image_url
      created_at
      current_usage
      earnings
      is_official
      special_features
    }
  }
`;

export const UPGRADE_STATION = gql`
  mutation UpgradeStation($id: uuid!, $level: int!) {
    update_recycling_stations_by_pk(
      pk_columns: { id: $id },
      _set: { level: $level }
    ) {
      id
      level
      capacity
      updated_at
    }
  }
`;

export const GET_STATION_EARNINGS = gql`
  query GetStationEarnings($station_id: uuid!) {
    dead_coins_aggregate(where: { station_id: { _eq: $station_id } }) {
      aggregate {
        sum {
          usdt_value
        }
        count
      }
    }
  }
`;

export const GET_NEARBY_STATIONS = gql`
  query GetNearbyStations($latitude: float8!, $longitude: float8!, $distance: float8!) {
    recycling_stations(
      where: {
        _and: [
          { latitude: { _gte: $latitude - $distance } },
          { latitude: { _lte: $latitude + $distance } },
          { longitude: { _gte: $longitude - $distance } },
          { longitude: { _lte: $longitude + $distance } }
        ]
      }
    ) {
      id
      name
      description
      capacity
      level
      latitude
      longitude
      status
      image_url
      created_at
      owner_id
      current_usage
      earnings
      is_official
      special_features
    }
  }
`; 