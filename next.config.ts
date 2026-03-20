import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BETA_PASSCODE: process.env.BETA_PASSCODE || "contentforge2026",
    ADMIN_PASSCODE: process.env.ADMIN_PASSCODE || "cfadmin2026",
  },
};

export default nextConfig;
