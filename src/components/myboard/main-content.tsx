"use client";

import { useUserProfile } from '@/hooks/use-user';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Badge } from "@/components/ui/badge";

export function MainContent() {
    const router = useRouter();
    const pathname = usePathname() ?? "";
    const { profile, isLoading, error, refetch } = useUserProfile({ enabled: true });

    // 监听路由返回并刷新数据
    useEffect(() => {
        if (pathname === '/dashboard') { // 替换为实际路径
            refetch(); // 强制刷新用户数据
        }
    }, [pathname, refetch]);


    if (error) {
        return (
            <div className="w-full p-6 text-center text-red-500">
                Failed to load profile
            </div>
        );
    }

    if (!profile) {
        return null; // 让 Suspense fallback 处理加载状态
    }

    return (
        <div className="w-full space-y-2 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl">
                {/* 头像区域 */}
                <div className="relative group w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000" />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-800">
                        <img
                            src={profile.avatar_url || '/default-avatar.png'}
                            alt={`${profile.nickname}'s avatar`}
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>
                </div>

                {/* 用户信息区域 */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                            {profile.nickname}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="border-pink-500 text-pink-500">
                                CATH ID: {profile.cath_id || "0x56F*****539a"}
                            </Badge>
                            {profile.ip_location && (
                                <Badge variant="outline" className="border-violet-500 text-violet-500">
                                    {profile.ip_location}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {profile.description && (
                        <div className="text-sm sm:text-base text-gray-300">
                            {profile.description}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <span>📧</span>
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>🕒</span>
                            <span>加入于 {new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* 设置按钮 */}
                <button
                    onClick={() => router.push('/settings')}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg text-white text-sm hover:opacity-90 transition-opacity"
                >
                    Setting
                </button>
            </div>
        </div>
    );
}
