import { gql } from 'graphql-request';

export const GET_USER_PROFILE_BY_EMAIL = gql`
  query GetUserProfileByEmail($email: String!) {
    users(where: { email: { _eq: $email } }) {
      id
      nickname
      avatar_url
      cath_id
      ip_location
      description
      email
      created_at
      updated_at
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $email: String!,
    $nickname: String,
    $avatar_url: String,
    $description: String
  ) {
    update_users(
      where: { email: { _eq: $email } },
      _set: {
        nickname: $nickname,
        avatar_url: $avatar_url,
        description: $description
      }
    ) {
      returning {
        id
        updated_at
      }
    }
  }
`;