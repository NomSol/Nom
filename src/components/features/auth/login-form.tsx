"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button_login";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaSquareXTwitter } from "react-icons/fa6";
import { BsFacebook, BsDiscord } from "react-icons/bs";
import { RiWechatFill } from "react-icons/ri";
import { IconType } from "react-icons";

type LoginProvider = "google" | "twitter" | "facebook" | "discord" | "wechat";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (provider: LoginProvider) => {
    setLoading(true);
    setError("");

    try {
      //oAuth will automatically redirect
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/main/dashboard", // 设置固定的回调 URL
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  const loginButtons: {
    provider: LoginProvider;
    icon: IconType;
    text: string;
    color: string;
  }[] = [
      {
        provider: "google",
        icon: FcGoogle,
        text: "Gmail",
        color: "bg-white hover:bg-gray-100 text-gray-700",
      },
      {
        provider: "twitter",
        icon: FaSquareXTwitter,
        text: "Twitter",
        color: "bg-white hover:bg-gray-100 text-gray-700",
      },

    ];

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {loginButtons.map(({ provider, icon: Icon, text, color }) => (
        <Button
          key={provider}
          onClick={() => handleLogin(provider)}
          className={`w-full flex items-center justify-center space-x-2 ${color} border border-gray-300`}
          disabled={loading}
        >
          <Icon className="w-5 h-5" />
          <span>{text}</span>
        </Button>
      ))}
    </div>
  );
}
