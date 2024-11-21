import { LoginForm } from '@/components/features/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">登录账户</h1>
        <LoginForm />
        <div className="mt-4 text-center text-sm text-gray-600">
          <Link 
            href="/register"
            className="text-blue-500 hover:text-blue-600"
          >
            没有账号？立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}