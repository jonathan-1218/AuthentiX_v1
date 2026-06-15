/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mongoose", "firebase-admin"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
