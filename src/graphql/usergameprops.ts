import { gql } from "graphql-request";

// Query to get user game properties
export const GET_USER_GAME_PROPS = gql`
  query GetUserGameProps($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      energy
      xp
      coins
      balance
    }
  }
`;

// Mutation to update user game properties
export const UPDATE_USER_GAME_PROPS = gql`
  mutation UpdateUserGameProps(
    $userId: uuid!
    $energy: Int
    $xp: Int
    $coins: Int
    $balance: numeric
  ) {
    update_users_by_pk(
      pk_columns: { id: $userId }
      _set: { energy: $energy, xp: $xp, coins: $coins, balance: $balance }
    ) {
      id
      energy
      xp
      coins
      balance
    }
  }
`;

// Mutation to increment user game properties
export const INCREMENT_USER_GAME_PROPS = gql`
  mutation IncrementUserGameProps(
    $userId: uuid!
    $energyInc: Int
    $xpInc: Int
    $coinsInc: Int
    $balanceInc: numeric
  ) {
    update_users_by_pk(
      pk_columns: { id: $userId }
      _inc: {
        energy: $energyInc
        xp: $xpInc
        coins: $coinsInc
        balance: $balanceInc
      }
    ) {
      id
      energy
      xp
      coins
      balance
    }
  }
`;
