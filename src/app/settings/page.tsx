"use client";
import { SettingForm } from "@/components/settings/setting_form";

export default function SettingProfilePage() {
    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">用户信息设置</h1>
            <SettingForm />
        </div>
    );
}
