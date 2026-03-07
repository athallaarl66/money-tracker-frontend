/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint errors won't block production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors won't block production build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
