declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    clientsClaim?: boolean;
    runtimeCaching?: any[];
    [key: string]: any;
  }

  function withPWAInit(
    pwaConfig: PWAConfig
  ): (nextConfig: NextConfig) => NextConfig;

  export default withPWAInit;
}
