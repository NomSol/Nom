import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types/user';

export function useUserProfile() {
    const { data: session } = useSession();
    const email = session?.user?.email;

    const {
        data: profile,
        isLoading,
        error
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
            return data.users[0] as UserProfile;
        },
        enabled: !!email, // 只在有 email 时执行查询
    });

    return {
        profile,
        isLoading,
        error
    };
}