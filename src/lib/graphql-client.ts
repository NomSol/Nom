import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_HASURA_ENDPOINT!;

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET!,
  },
});