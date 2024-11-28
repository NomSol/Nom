export interface ApiResponse<T = any> {
    data: T;
    error?: string;
  }
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
  }