import type { NextConfig } from "next"

const rawBackendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://supportiq-backend-2690.onrender.com"
const backendUrl = rawBackendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "")


const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig

