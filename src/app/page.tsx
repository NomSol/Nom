"use client";
import { initializeServices } from '@/services/init';
import { useRouter } from 'next/navigation';

// Initialize services when running on server side
initializeServices();

export default function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  const handleRegisterClick = () => {
    router.push('/auth/register');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">寻宝游戏</h1>
      <div className="flex gap-4">
        <button onClick={handleLoginClick} className="btn">
          登录
        </button>
        <button onClick={handleRegisterClick} className="btn">
          注册
        </button>
      </div>
    </main>
  );
}
