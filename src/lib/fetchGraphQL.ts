const fetchGraphQL = async (query: string, variables: any = {}) => {
    if (!process.env.NEXT_PUBLIC_HASURA_ENDPOINT) {
        throw new Error('HASURA_ENDPOINT is not defined');
    }
    const response = await fetch(process.env.NEXT_PUBLIC_HASURA_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    const responseBody = await response.json();
    if (responseBody.errors) {
        throw new Error(responseBody.errors.map((error: any) => error.message).join('\n'));
    }
    return responseBody.data;
};

export default fetchGraphQL; 