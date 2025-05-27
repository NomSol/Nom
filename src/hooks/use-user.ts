import { useQuery } from '@tanstack/react-query';
import { UserProfile } from '@/types/user';
import { UserProfileInput } from '@/types/user';
import { GET_USER_BY_NICKNAME } from '@/graphql/user';
import { graphqlClient } from '@/lib/graphql-client';
import { useWallet } from '@/context/WalletContext';
import { firebaseApiClient } from '@/lib/firebase-api-client';

export function useUserProfile(p0?: { enabled?: boolean; }) {
  const { walletAddress } = useWallet();

  const {
    data: profile,
    isLoading,
    error,
    refetch // Extract refetch method
  } = useQuery({
    queryKey: ['walletUser', walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error('No wallet connected');

      try {
        const data = await firebaseApiClient.getWalletUser(walletAddress);

        // Check if user data exists, if not throw error
        if (!data.users || data.users.length === 0) {
          throw new Error('No user profile found');
        }

        return data.users[0] as UserProfile;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw new Error('Failed to fetch profile');
      }
    },
    enabled: !!walletAddress && (p0?.enabled !== false), // Only execute query when wallet is connected
  });

  return {
    profile,
    isLoading,
    error,
    refetch // Expose refetch method
  };
}

export async function createUserProfile(userProfile: UserProfileInput) {
  const apiUrl = `${process.env.NEXT_PUBLIC_HASURA_REST_API}/createuserprofile`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret":
        process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || "",
    },
    body: JSON.stringify(userProfile),
  });

  if (!response.ok) {
    throw new Error("创建用户配置失败");
  }

  return await response.json();
}

export async function modifyUserProfile(
  wallet_address: string,
  updates: Partial<UserProfileInput>
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HASURA_REST_API}/modifyuserprofile`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret":
          process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || "",
      },
      body: JSON.stringify({
        wallet_address, // 用于标识用户
        ...updates, // 将更新的字段直接展开
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to modify user profile");
  }

  const data = await response.json();
  return data;
}

export async function getUserByNickname(
  nickname: string
): Promise<any[]> {
  try {
    console.log('nickname in function:', nickname);
    const response = await graphqlClient.request<any>(GET_USER_BY_NICKNAME, { nickname });
    console.log('GraphQL query response:', response);

    // 直接返回匹配到的用户数组
    if (!response || !response.users) {
      console.error('响应数据中没有 users 属性', response);
      throw new Error('查询返回数据格式不正确');
    }

    return response.users;
  } catch (error) {
    console.error('检查昵称时出错:', error);
    throw new Error('查询昵称失败');
  }
};
