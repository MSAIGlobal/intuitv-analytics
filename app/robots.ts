import { MetadataRoute } from 'next';

// Explicit crawl policy — search + the major AI crawlers welcomed; app/API
// surfaces with no SEO value disallowed. Points crawlers at the sitemap.
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://analytics.intuitv.app';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ["/api/"] },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
