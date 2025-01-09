// import { fetchApi } from './api';
// import type { User } from '@/types/user';

// export const userService = {
//   getAll: (params?: PaginationParams) =>
//     fetchApi<User[]>('/api/users', {
//       method: 'GET',
//       ...params && {
//         body: JSON.stringify(params)
//       }
//     }),
//
//   getById: (id: string) =>
//     fetchApi<User>(`/api/users/${id}`),
//
//   create: (data: CreateUserInput) =>
//     fetchApi<User>('/api/users', {
//       method: 'POST',
//       body: JSON.stringify(data),
//     }),
//
//   update: (id: string, data: UpdateUserInput) =>
//     fetchApi<User>(`/api/users/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     }),
//
//   delete: (id: string) =>
//     fetchApi<void>(`/api/users/${id}`, {
//       method: 'DELETE',
//     }),
// };