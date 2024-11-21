import { AuthController } from '@/controllers/auth.controller';

const authController = new AuthController();

export async function POST(req: Request) {
  return await authController.register(req);
}