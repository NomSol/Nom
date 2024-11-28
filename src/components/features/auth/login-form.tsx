'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { signIn } from "next-auth/react";
import { FcGoogle } from 'react-icons/fc';
import { FaSquareXTwitter } from "react-icons/fa6";
import { BsTwitter, BsFacebook, BsDiscord } from 'react-icons/bs';
import { RiWechatFill } from 'react-icons/ri';
import { IconType } from 'react-icons';

type LoginProvider = 'google' | 'twitter' | 'facebook' | 'discord' | 'wechat';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuth(state => state.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider: LoginProvider) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn(provider, {
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const loginButtons: {
    provider: LoginProvider;
    icon: IconType;
    text: string;
    color: string;
  }[] = [
      { provider: 'google', icon: FcGoogle, text: 'Gmail登录', color: 'bg-white hover:bg-gray-100 text-gray-700' },
      { provider: 'twitter', icon: FaSquareXTwitter, text: 'Twitter登录', color: 'bg-white hover:bg-gray-100 text-gray-700' },
      { provider: 'facebook', icon: BsFacebook, text: 'Facebook登录', color: 'bg-[#4267B2] hover:bg-[#365899] text-white' },
      { provider: 'discord', icon: BsDiscord, text: 'Discord登录', color: 'bg-[#7289DA] hover:bg-[#677bc4] text-white' },
      { provider: 'wechat', icon: RiWechatFill, text: '微信登录', color: 'bg-[#7BB32E] hover:bg-[#6b9e29] text-white' },
    ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      {loginButtons.map(({ provider, icon: Icon, text, color }) => (
        <Button
          key={provider}
          onClick={() => handleLogin(provider)}
          className={`w-full flex items-center justify-center space-x-2 ${color} border border-gray-300`}
          disabled={loading}
        >
          <Icon className="w-5 h-5" />
          <span>{text}</span>
        </Button>
      ))}
    </div>
  );
}