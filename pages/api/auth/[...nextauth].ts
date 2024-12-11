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
            authorization: {
                params: {
                    prompt: "login"
                }
            }
        }),

        // Twitter Provider
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID || "",
            clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
            version: '2.0',
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
            authorization: {
                params: {
                    scope: 'identify email', // 请求权限：获取用户的基本信息和电子邮件
                }
            }
        }),

        // You can add WeChat provider here if necessary
    ],
    secret: process.env.NEXTAUTH_SECRET,
});
