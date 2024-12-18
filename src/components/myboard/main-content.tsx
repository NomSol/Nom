"use client";

import { useUserProfile } from '@/hooks/use-user';

export function MainContent() {
    const { profile, isLoading, error } = useUserProfile();

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
        <div className="w-full user-info flex items-start p-6">
            {/* 头像区域 */}
            <div className="avatar flex-shrink-0 w-36 h-36 rounded-full overflow-hidden border border-gray-200">
                <img
                    src={profile.avatar_url || '/default-avatar.png'}
                    alt={`${profile.nickname}'s avatar`}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="info-part flex-1 ml-10 text-left">
                {/* 基本信息 */}
                <div className="basic-info">
                    <div className="user-nickname text-2xl font-bold">
                        {profile.nickname}
                    </div>
                    <div className="user-content text-gray-600 mt-1">
                        <span className="user-redId">cath号：{profile.cath_id}</span>
                        {profile.ip_location && (
                            <span className="user-IP ml-4">IP属地：{profile.ip_location}</span>
                        )}
                    </div>
                </div>

                {/* 描述信息 */}
                {profile.description && (
                    <div className="user-desc text-gray-600 mt-4">
                        {profile.description}
                    </div>
                )}

                {/* 邮箱信息 */}
                <div className="user-email text-gray-600 mt-4">
                    邮箱：{profile.email}
                </div>

                {/* 创建时间 */}
                <div className="user-created text-gray-500 text-sm mt-4">
                    加入时间：{new Date(profile.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}