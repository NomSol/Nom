'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { UserProfileInput } from '@/types/user';
import { useAuth } from "@/utils/auth";
import { useWallet } from "@/context/WalletContext";
import { useUserProfile, createUserProfile, modifyUserProfile, getUserByNickname } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';


export function SettingForm() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const { walletAddress, walletType } = useWallet();
    const { refetch, profile, isLoading, error } = useUserProfile({ enabled: !!walletAddress });
    const [isUpdating, setIsUpdating] = useState(false);
    const [nicknameError, setNicknameError] = useState('');         // For nickname error to show on the page
    const [settingResult, setSettingResult] = useState('');         // For setting result to show on the page


    const [formData, setFormData] = useState<UserProfileInput>({
        nickname: user?.name || `User_${walletAddress?.substring(0, 6)}` || "treasure_hunter",
        avatar_url: user?.image || "",
        ip_location: "Canberra, Australia",
        description: "",
        email: user?.email || `${walletAddress}@wallet.user` || "",
        wallet_address: walletAddress || "",
    });


    // Initialize or update formData
    useEffect(() => {
        if (!error && profile) {
            setFormData((prev) => ({
                ...prev,
                nickname: profile.nickname || `User_${walletAddress?.substring(0, 6)}` || "treasure_hunter",
                avatar_url: profile.avatar_url || user?.image || "",
                ip_location: profile.ip_location || "Canberra, Australia",
                description: profile.description || "",
                email: profile.email || `${walletAddress}@wallet.user` || "",
                wallet_address: walletAddress || profile.wallet_address || "",
            }));
        } else if (walletAddress && !profile) {
            // If we have a wallet but no profile yet, update the formData with wallet info
            setFormData((prev) => ({
                ...prev,
                nickname: `User_${walletAddress.substring(0, 6)}`,
                email: `${walletAddress}@wallet.user`,
                wallet_address: walletAddress,
            }));
        }
    }, [profile, error, user, walletAddress]);

    const handleSubmit = async (e: React.FormEvent) => {
        setIsUpdating(true); // Start updating
        e.preventDefault();

        if (!walletAddress) {
            setSettingResult('failed');
            setNicknameError('Wallet not connected');
            setIsUpdating(false);
            return;
        }

        try {
            // Check if nickname already exists
            console.log('formData:', formData.nickname);
            const usersWithNickname = await getUserByNickname(formData.nickname);
            console.log('usersWithNickname:', usersWithNickname);

            // If nickname exists and isn't current user
            if (usersWithNickname.length > 0 && (!profile || usersWithNickname[0].id !== profile.id)) {
                setNicknameError('Nickname already exists');
                setIsUpdating(false);
                setSettingResult('failed');
                return; // Exit, prevent further execution
            }

            // Ensure wallet address is included in the form data
            const updatedFormData = {
                ...formData,
                wallet_address: walletAddress
            };

            if (profile) {
                // Update user information
                await modifyUserProfile(walletAddress, updatedFormData);
                setNicknameError('');
                console.log('User profile modified successfully');
                setSettingResult('success');
                // Refresh user data after successful update
                await refetch();
            } else {
                // Create user information
                await createUserProfile(updatedFormData);
                setNicknameError('');
                console.log('User profile created successfully');
                setSettingResult('success');
                // Refresh user data after successful creation
                await refetch();
            }
        } catch (error) {
            console.error('Failed to save user profile:', error);
            setSettingResult('failed');
        } finally {
            setIsUpdating(false); // Update complete
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-2xl font-bold">Loading profile...</p>
            </div>
        );
    }

    if (!isAuthenticated || !walletAddress) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-2xl font-bold mb-4">Wallet not connected</p>
                    <Button onClick={() => router.push('/auth/connect-wallet')}>
                        Connect Wallet
                    </Button>
                </div>
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

            {/* Display avatar and wallet */}
            <div className="flex flex-col justify-center items-center py-4 space-y-2">
                <img
                    src={formData.avatar_url || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                    alt="avatar"
                    className="w-32 h-32 rounded-full object-cover"
                />
                <label className="text-sm font-medium">
                    Wallet: {walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)}
                </label>

                {/* cath id: created after profile exists */}
                {profile?.cath_id && (
                    <label className="text-sm font-medium">
                        cathid: {profile.cath_id}
                    </label>
                )}

                {/* When settingResult is not empty, show success or failure message */}
                {settingResult !== '' &&
                    <div
                        className={`text-sm font-medium ${settingResult === 'success' ? 'text-green-600' : 'text-red-600'}`}
                    >
                        {settingResult === 'success' ? 'Settings saved successfully' : 'Failed to save settings'}
                    </div>
                }
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
                    {nicknameError && <div className="mt-1 text-sm text-red-600">{nicknameError}</div>}
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
