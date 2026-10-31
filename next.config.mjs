/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A long live recording is sent as raw fixes (the server recomputes the
  // stats); the 1 MB default would reject a multi-hour hike.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
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
