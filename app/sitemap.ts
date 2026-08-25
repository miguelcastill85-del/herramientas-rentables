import type { MetadataRoute } from 'next';
import { siteUrl, tools } from './lib/tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/pro`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...tools.map((tool) => ({
      url: `${siteUrl}${tool.path}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
