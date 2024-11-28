export class ApiError extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  }
  
  export const fetchApi = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const token = localStorage.getItem('token');
    const baseUrl = process.env.NEXT_PUBLIC_HASURA_REST_URL;
  
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });
  
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
  
    return response.json();
  };
  