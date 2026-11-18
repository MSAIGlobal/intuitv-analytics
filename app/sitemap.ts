import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://analytics.intuitv.app';
  const now = new Date();
  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
  ];
}
