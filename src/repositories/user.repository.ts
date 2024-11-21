import { prisma } from '@/lib/prisma';
import { User } from '@/types/models/user.model';
import type { CreateUserDTO } from '@/types/models/user.model';

export class UserRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async create(data: CreateUserDTO) {
    return await prisma.user.create({
      data: {
        ...data,
        //默认值
        points: 0,
      }
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  async updatePoints(id: string, points: number) {
    return await prisma.user.update({
      where: { id },
      data: { points }
    });
  }
}