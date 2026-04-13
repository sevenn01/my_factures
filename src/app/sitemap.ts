import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invoiceme.app';

  // Add the base public routes
  const routes = ['', '/login', '/signup', '/pricing'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // You can also dynamically fetch public blog posts or feature pages here
  // and map them similarly.

  return [...routes];
}
