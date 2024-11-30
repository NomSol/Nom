import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";
import DiscordProvider from "next-auth/providers/discord";

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "凭证",
            credentials: {
                email: { label: "电子邮件", type: "text", placeholder: "your-email@example.com" },
                password: { label: "密码", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("请提供有效的电子邮件和密码");
                }
                const res = await fetch("https://yourbackend.com/api/auth/login", {
                    method: "POST",
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                    headers: { "Content-Type": "application/json" },
                });

                const user = await res.json();

                if (res.ok && user) {
                    return user;
                }

                return null;
            },
        }),

        // Google Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),

        // Twitter Provider
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID || "",
            clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
        }),

        // Facebook Provider
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID || "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
        }),

        // Discord Provider
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID || "",
            clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
        })

        // 你可以添加微信的提供商配置
    ],
    secret: process.env.NEXTAUTH_SECRET,
    debug: true, // 启用调试

    // 可以添加其他配置选项
});