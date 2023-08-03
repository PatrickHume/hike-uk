const dotenvExpand = require("dotenv-expand");
dotenvExpand.expand({ parsed: { ...process.env } });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    serverActions: true
  },
  supabase: {
    client: {
        auth: {
            persistSession: true //or true
        }
    }
  },
  eslint: {
      ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
