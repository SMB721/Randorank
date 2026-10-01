/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // French is served at "/", so "/fr" would be a duplicate of the home page.
  async redirects() {
    return [{ source: "/fr", destination: "/", permanent: true }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
    ],
  },
};

export default nextConfig;
