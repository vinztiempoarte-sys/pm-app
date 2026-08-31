import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite probar el servidor de desarrollo desde un túnel público (móvil real)
  allowedDevOrigins: ["*.loca.lt", "*.trycloudflare.com"],
};

export default nextConfig;
