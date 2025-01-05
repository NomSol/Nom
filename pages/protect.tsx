// components/Protect.tsx
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect, usePathname } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user'; // 用户信息的自定义 Hook

export function ProtectPage({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname() ?? "";
    const unprotectedPaths = ['/auth/login', '/auth/register', '/'];
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const { profile, isLoading: isProfileLoading, error: profileError } = useUserProfile({
        enabled: isAuthenticated && pathname !== '/settings', // 只有用户登录完成后才启用 useUserProfile
    });


    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }


        if (status === 'loading' || session === undefined) return;

        // 如果是未保护的路径，直接跳过
        if (unprotectedPaths.includes(pathname)) {
            // 已经登录了
            if (status === 'authenticated' && session) {
                redirect("/main/dashboard");
            }

            // 未登录，保持页面不变
            setIsReady(true);
            return;
        }

        //在当前非过滤的目录下，如果未登录不需要跳转
        if (status === "unauthenticated" || !session) {
            redirect("/auth/login");
        } else {
            setIsReady(true); // 如果用户已通过验证，设置为已准备好渲染
        }

    }, [status, pathname, session]);



    // 如果组件未准备好，返回 null，避免渲染内容
    if (!isReady || status === 'loading') {
        return <></>; // 或者可以显示一个加载指示
    }

    // 如果用户信息不存在，跳转到设置页面
    if (isAuthenticated) {
        if (isProfileLoading && pathname !== '/settings') {
            return <>loading user profile....</>;
        }
        if (profileError && pathname !== '/settings') {
            redirect('/settings');
        }
    }


    // 如果通过验证，渲染子组件
    return <>{children}</>;
}
