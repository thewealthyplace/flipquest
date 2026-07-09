/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (cfg) => {
    cfg.resolve.fallback = { fs: false, net: false, tls: false };
    return cfg;
  },
};
export default config;
