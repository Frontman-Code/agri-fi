const createNextIntlPlugin = require('next-intl/plugin');
const { withSentryConfig } = require('@sentry/nextjs');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
};

const withIntl = withNextIntl(nextConfig);

module.exports = withSentryConfig(withIntl, {
  // Sentry organisation and project (set in CI / Vercel env vars)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for source map uploads — set SENTRY_AUTH_TOKEN in CI
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps only during production builds
  silent: true,
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements in production
  disableLogger: true,

  // Widen the tunnel route to avoid ad-blocker interference
  tunnelRoute: '/monitoring',

  // Automatically instrument Next.js data fetching methods
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,
});
