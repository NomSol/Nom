'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuth(state => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setAuth(data.user, data.token);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      <div>
        <Input
          type="text"
          placeholder="姓名"
          value={formData.name}
          onChange={(e) => setFormData({
            ...formData,
            name: e.target.value
          })}
          disabled={loading}
          required
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="邮箱"
          value={formData.email}
          onChange={(e) => setFormData({
            ...formData,
            email: e.target.value
          })}
          disabled={loading}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="密码"
          value={formData.password}
          onChange={(e) => setFormData({
            ...formData,
            password: e.target.value
          })}
          disabled={loading}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? '注册中...' : '注册'}
      </Button>
    </form>
  );
}