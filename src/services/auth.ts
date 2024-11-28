import { fetchApi } from './api';
import type { User } from '@/types/user';

interface LoginInput {
 email: string;
 password: string;
}

interface RegisterInput {
 email: string;
 password: string;
 name: string;
}

interface AuthResponse {
 token: string;
 user: User;
}

export const authService = {
 // 登录
 login: (data: LoginInput) =>
   fetchApi<AuthResponse>('/api/auth/login', {
     method: 'POST',
     body: JSON.stringify(data),
   }),

 // 注册
 register: (data: RegisterInput) =>
   fetchApi<AuthResponse>('/api/auth/register', {
     method: 'POST',
     body: JSON.stringify(data),
   }),

 // 获取当前用户信息
 getCurrentUser: () =>
   fetchApi<User>('/api/auth/me', {
     method: 'GET',
   }),

 // 登出
 logout: () => {
   localStorage.removeItem('token');
   // 可以选择调用后端登出接口
   return fetchApi<void>('/api/auth/logout', {
     method: 'POST',
   });
 },

 // 刷新token
 refreshToken: () =>
   fetchApi<{ token: string }>('/api/auth/refresh-token', {
     method: 'POST',
   }),

 // 检查是否已登录
 isAuthenticated: (): boolean => {
   const token = localStorage.getItem('token');
   return !!token;
 },

 // 保存token
 setToken: (token: string): void => {
   localStorage.setItem('token', token);
 },

 // 获取token
 getToken: (): string | null => {
   return localStorage.getItem('token');
 },
};

// 错误类型定义
export class AuthenticationError extends Error {
 constructor(message: string) {
   super(message);
   this.name = 'AuthenticationError';
 }
}

// 使用示例：
/*
try {
 // 登录
 const { token, user } = await authService.login({
   email: 'user@example.com',
   password: 'password123'
 });
 
 // 保存token
 authService.setToken(token);
 
 // 获取当前用户信息
 const currentUser = await authService.getCurrentUser();
 
} catch (error) {
 if (error instanceof AuthenticationError) {
   // 处理认证错误
   console.error('Authentication failed:', error.message);
 } else {
   // 处理其他错误
   console.error('An error occurred:', error);
 }
}
*/