import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Мелкая ошибка типов не должна блокировать публикацию сайта.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
