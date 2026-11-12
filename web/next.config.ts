import type { NextConfig } from 'next';

// O domínio do CDN das fotos muda por stage (saída MediaCDNDomainName da api). O next.config não lê o src/config/.
const mediaCdnHostname = process.env.MEDIA_CDN_HOSTNAME;

if (!mediaCdnHostname) {
  throw new Error('MEDIA_CDN_HOSTNAME não definido: veja o .env.example.');
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  // O <Link> pré-carrega o App Shell da rota, um por rota e não um por link. Sem a opção, o Next usa false e avisa.
  partialPrefetching: true,
  typedRoutes: true,
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: mediaCdnHostname, pathname: '/uploads/**' }],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // A Vercel já envia o HSTS. CSP completa fica para quando houver scripts de terceiros (pagamento, analytics).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
