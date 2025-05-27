import { GraphQLClient } from 'graphql-request';
import { useState, useEffect } from 'react';

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://nomnom-api.hasura.app/v1/graphql';

// Create a client creator function
export const createClient = (token?: string) => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return new GraphQLClient(endpoint, { headers });
};

// Hook to use the GraphQL client
export const useClient = () => {
    const [client, setClient] = useState<GraphQLClient>(() => createClient());

    useEffect(() => {
        // Here you could get the auth token from localStorage or a context
        const token = localStorage.getItem('auth_token');
        setClient(createClient(token || undefined));
    }, []);

    return client;
}; 