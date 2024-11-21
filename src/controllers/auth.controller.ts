import { AuthService } from '@/services/auth.service';
import { BaseController } from './base.controller';
import { RegisterDTO, LoginDTO } from '@/types/dtos/auth.dto';

export class AuthController extends BaseController {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  async register(req: Request) {
    try {
      const data = await req.json() as RegisterDTO;
      const result = await this.authService.register(data);
      return this.success(result, 201);
    } catch (error: any) {
      return this.error(error.message);
    }
  }

  async login(req: Request) {
    try {
      const data = await req.json() as LoginDTO;
      const result = await this.authService.login(data);
      return this.success(result);
    } catch (error: any) {
      return this.error(error.message);
    }
  }
}