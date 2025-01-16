
"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { redirect, usePathname } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user'; // 用户信息的自定义 Hook

// 全局状态模拟，用于标记用户数据检查状态
let hasCheckedUserProfile = false; // 使用上下文或状态管理工具可更安全


export default function ProtectPage({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname() ?? "";
    const unprotectedPaths = ['/auth/login', '/auth/register', '/'];
    const [isReady, setIsReady] = useState(false);
    const [shouldQueryUser, setShouldQueryUser] = useState(false); // 标志是否需要查询用户信息

    // 初始化标志，检查是否需要查询用户信息
    useEffect(() => {
        if (status === 'authenticated') {
            const userChecked = sessionStorage.getItem("userChecked") === "true";
            if (!userChecked) {
                setShouldQueryUser(true); // 未检查过用户信息，设置查询标志
            }
        }
    }, [status]);


    // 用户信息加载逻辑
    const { profile, isLoading: isProfileLoading, error: profileError } = useUserProfile({
        enabled: shouldQueryUser, // 只有刚登录时才查询用户信息
    });


    useEffect(() => {
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

    // 查询用户信息完成后更新标志
    useEffect(() => {
        if (shouldQueryUser && !isProfileLoading && profile && !profileError) {
            sessionStorage.setItem("userChecked", "true"); // 标记用户信息已查询
            setShouldQueryUser(false); // 停止查询
        }
    }, [shouldQueryUser, isProfileLoading, profile]);


    // 如果组件未准备好，返回 null，避免渲染内容
    if (!isReady || status === 'loading') {
        return <>Loading..</>; // 或者可以显示一个加载指示
    }

    // 如果用户信息不存在，跳转到设置页面
    if (status === 'authenticated' && session && shouldQueryUser) {
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
