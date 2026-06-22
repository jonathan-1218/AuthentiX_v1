/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["mongoose", "firebase-admin"],

  images: {
    remotePatterns: [],
  },

  // OWASP-recommended HTTP security headers applied to every response.
  // CSP is intentionally broad here — tighten per-page with <meta> tags if needed.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME-type sniffing (stops browsers treating text/plain as JS)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Block this site from being embedded in iframes (clickjacking defence)
          { key: "X-Frame-Options", value: "DENY" },
          // Enforce HTTPS for 1 year on Sepolia/prod
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Only send the origin in the Referer header (no path/query leakage)
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable browser features we don't need
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          // Content Security Policy:
          //   - self for scripts/styles (Next.js inline chunks are covered by 'self' + nonce in prod)
          //   - unsafe-inline for styles only (Tailwind's runtime requires it)
          //   - images from self + Unsplash CDN (used on landing page)
          //   - connect to self + Infura (blockchain RPC)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval'",   // unsafe-eval needed by Next.js dev HMR; remove in prod build
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://images.unsplash.com",
              "connect-src 'self' https://sepolia.infura.io",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
