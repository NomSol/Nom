"use client";

import { useState, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { DEFAULT_PROFILE } from '@/types/defualt-profile';
import { PostCard } from '@/components/post-card';
import { Post } from '@/types/post';

export function MainContent() {
    const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // 获取个人资料
                const profileResponse = await fetch('/api/profile');
                const profileData = await profileResponse.json();
                setProfile(profileData);

                // 获取帖子列表
                const postsResponse = await fetch('/api/posts');
                const postsData = await postsResponse.json();
                setPosts(postsData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setProfile(DEFAULT_PROFILE);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <div>加载中...</div>;
    }

    return (
        <div className="user-info flex items-start p-6">
            {/* 头像区域 */}
            <div className="avatar flex-shrink-0 w-36 h-36 rounded-full overflow-hidden border border-gray-200 ml-10">
                <img
                    src={profile.avatarUrl}
                    alt={`${profile.nickname}的头像`}
                    className="user-image w-full h-full object-cover"
                />
            </div>

            <div className="info-part flex-1 ml-10 text-left">
                {/* 基本信息 */}
                <div className="basic-info">
                    <div className="user-nickname text-2xl font-bold">{profile.nickname}</div>
                    <div className="user-content text-gray-600 mt-1">
                        <span className="user-redId">小红书号：{profile.redBookId}</span>
                        <span className="user-IP ml-4">IP属地：{profile.ipLocation}</span>
                    </div>
                </div>

                {/* 描述信息 */}
                {profile.description && (
                    <div className="user-desc text-gray-600 mt-4">
                        {profile.description}
                        {profile.personalUrl && (
                            <span>，个人：<a href={profile.personalUrl} className="text-blue-600 hover:underline">{profile.personalUrl}</a></span>
                        )}
                    </div>
                )}

                {/* 数据统计 */}
                <div className="data-info flex gap-6 text-gray-600 mt-4">
                    <div>
                        <span className="count font-medium">{profile.stats.following}</span>
                        <span className="shows ml-1">关注</span>
                    </div>
                    <div>
                        <span className="count font-medium">{profile.stats.followers}</span>
                        <span className="shows ml-1">粉丝</span>
                    </div>
                    <div>
                        <span className="count font-medium">{profile.stats.likes}</span>
                        <span className="shows ml-1">获赞与收藏</span>
                    </div>
                </div>
            </div>
        </div>
    );
}