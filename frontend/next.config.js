/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 http://backend:8000 https:" },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },
  async rewrites() {
    // BACKEND_URL is the server-side rewrite target.
    // In production on Vercel, set BACKEND_URL to the deployed backend public URL.
    // Locally it falls back to http://127.0.0.1:8000.
    const backendUrl =
      process.env.BACKEND_URL ||
      (process.env.DOCKER_CONTAINER ? 'http://backend:8000' : 'http://127.0.0.1:8000');
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
  images: {
    domains: ['localhost', 'logo.clearbit.com', 'images.unsplash.com'],
  },
}

module.exports = nextConfig
