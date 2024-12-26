/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "olrroljvdxkccfqdxeis.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

// module.exports = {
//   reactStrictMode: false,
// };
