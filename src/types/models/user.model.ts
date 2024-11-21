export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  image?: string;
  points: number; 
  createdAt: Date;
  updatedAt: Date;
}

// 添加一个创建用户的DTO类型
export type CreateUserDTO = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'points'>;