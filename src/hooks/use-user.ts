import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types/user';
import { UserProfileInput } from '@/types/user';

export function useUserProfile(p0?: { enabled?: boolean; }) {
    const { data: session } = useSession();
    const email = session?.user?.email;

    const {
        data: profile,
        isLoading,
        error,
        refetch // 解构 refetch 方法
    } = useQuery({
        queryKey: ['userProfile', email],
        queryFn: async () => {
            if (!email) throw new Error('No email found in session');

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_HASURA_REST_API}/userprofile?email=${encodeURIComponent(email)}`,
                {
                    headers: {
                        'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }


            const data = await response.json();

            // 检查用户数据是否存在，如果不存在抛出错误
            if (!data.users[0] || data.users.length === 0) {
                throw new Error('No user profile found');
            }
            console.log("11111111111111111111111111111", data.users[0]);
            return data.users[0] as UserProfile; // 返回用户数据

        },
        enabled: !!email, // 只在有 email 时执行查询
    });

    return {
        profile,
        isLoading,
        error,
        refetch // 暴露 refetch 方法
    };
}



export async function createUserProfile(userProfile: UserProfileInput) {
    const apiUrl = `${process.env.NEXT_PUBLIC_HASURA_REST_API}/createuserprofile`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
        },
        body: JSON.stringify(userProfile),
    });

    if (!response.ok) {
        throw new Error('创建用户配置失败');
    }

    return await response.json();
};


export async function modifyUserProfile(email: string, updates: Partial<UserProfileInput>) {

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_HASURA_REST_API}/modifyuserprofile`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
            },
            body: JSON.stringify({
                email,        // 用于标识用户
                ...updates,   // 将更新的字段直接展开
            }),
        }
    );

    if (!response.ok) {
        throw new Error('Failed to modify user profile');
    }

    const data = await response.json();
    return data;
}
