export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  createdAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserInput {
  name?: string;
  points?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}