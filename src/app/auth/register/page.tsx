import { RegisterForm } from '@/components/features/auth/register-form';

 function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">注册账户</h1>
        <RegisterForm />
      </div>
    </div>
  );
}

export default RegisterPage