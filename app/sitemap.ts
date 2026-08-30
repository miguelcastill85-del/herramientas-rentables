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
      url: `${siteUrl}/radar`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.1,
    },
    {
      url: `${siteUrl}/pro`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/guias/cuanto-cobrar-como-freelance-chile`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/cotizacion-freelance-chile`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.95,
    },
    ...tools.map((tool) => ({
      url: `${siteUrl}${tool.path}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
