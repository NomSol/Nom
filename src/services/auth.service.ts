import { UserRepository } from '@/repositories/user.repository';
import { LoginDTO, RegisterDTO } from '@/types/dtos/auth.dto';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterDTO) {
    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // 密码加密
    const hashedPassword = await hash(data.password, 12);

    // 创建用户
    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    // 生成 token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        // 返回积分信息
        points: user.points,
      },
      token,
    };
  }

  async login(data: LoginDTO) {
    // 查找用户
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 验证密码
    const isValid = await compare(data.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // 生成 token
    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        // 返回积分信息
        points: user.points,
      },
      token,
    };
  }

  private generateToken(userId: string): string {
    return sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
  }
}