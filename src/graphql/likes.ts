// graphql/likes.ts
export const LIKE_TREASURE = `
  mutation LikeTreasure($treasure_id: uuid!, $user_id: uuid!) {
    insert_treasure_likes_one(object: {
      treasure_id: $treasure_id,
      user_id: $user_id
    }) {
      id
    }
  }
`;

export const UNLIKE_TREASURE = `
  mutation UnlikeTreasure($treasure_id: uuid!, $user_id: uuid!) {
    delete_treasure_likes(where: {
      treasure_id: { _eq: $treasure_id },
      user_id: { _eq: $user_id }
    }) {
      affected_rows
    }
  }
`;

export const GET_USER_LIKES = `
  query GetUserLikes($user_id: uuid!) {
    treasure_likes(where: { user_id: { _eq: $user_id }}) {
      treasure_id
    }
  }
`;