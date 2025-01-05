'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { UserProfileInput } from '@/types/user';
import { useSession } from "next-auth/react";
import { useUserProfile, createUserProfile, modifyUserProfile } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';


export function SettingForm() {
    // 在组件中
    const router = useRouter();
    const { data: session, status } = useSession();
    const { profile, isLoading, error } = useUserProfile({ enabled: true });
    const [isUpdating, setIsUpdating] = useState(false);


    const [formData, setFormData] = useState<UserProfileInput>({
        nickname: session?.user?.name || "treasure_hunter",
        avatar_url: session?.user?.image || "",
        cath_id: "a12345678",
        ip_location: "Canberra, Australia",
        description: "",
        email: session?.user?.email || "",
    });


    //初始化或更新 formData
    useEffect(() => {
        if (!error && profile) {
            setFormData((prev) => ({
                ...prev,
                nickname: profile.nickname || "treasure_hunter",
                avatar_url: profile.avatar_url || session?.user?.image || "",
                cath_id: profile.cath_id || "a12345678",
                ip_location: profile.ip_location || "Canberra, Australia",
                description: profile.description || "",
                email: profile.email || session?.user?.email || "",
            }));
        }
    }, [profile, error, session]);

    const handleSubmit = async (e: React.FormEvent) => {
        setIsUpdating(true); // 开始更新
        e.preventDefault();

        try {
            if (profile) {
                // 更新用户信息
                if (formData.email) {
                    await modifyUserProfile(formData.email, formData);
                    console.log('User profile modify successfully');
                } else {
                    throw new Error('Email is required to modify user profile');
                }
            } else {
                // 创建用户信息
                await createUserProfile(formData);
                console.log('User profile created successfully');
            }
        } catch (error) {
            console.error('Failed to save user profile:', error);
        } finally {
            setIsUpdating(false); // 更新完成
        }
    };
    //处理提交逻辑

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (isLoading || !session) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-2xl font-bold">Loading...</p>
            </div>
        );
    }

    if (isUpdating) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-2xl font-bold">Updating...</p>
            </div>
        );
    }

    return (
        <Card className="p-2">
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
            </CardHeader>

            {/* 显示头像和邮箱 */}
            <div className="flex flex-col justify-center items-center py-4 space-y-2">
                <img
                    src={formData.avatar_url}
                    alt="avatar"
                    className="w-32 h-32 rounded-full object-cover"
                />
                <label className="text-sm font-medium">
                    {formData.email}
                </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nickname *</label>
                    <Input
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleChange}
                        placeholder="Enter your nickname"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Cath ID *</label>
                    <Input
                        name="cath_id"
                        value={formData.cath_id}
                        onChange={handleChange}
                        placeholder="Enter your Cath ID"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">IP Location</label>
                    <Input
                        name="ip_location"
                        value={formData.ip_location || ""}
                        onChange={handleChange}
                        placeholder="Enter your IP location (optional)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                        placeholder="Enter a short description about yourself (optional)"
                    />
                </div>


                <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline"
                        onClick={() => router.push('/dashboard')}>
                        Return
                    </Button>

                    <Button type="submit">Save</Button>
                </div>
            </form>

        </Card >
    );
}
