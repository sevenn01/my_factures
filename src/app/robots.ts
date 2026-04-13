import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://invoiceme.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/signup', '/pricing'],
      disallow: ['/dashboard/', '/settings/', '/clients/', '/products/', '/invoices/', '/company-setup/', '/test-signup/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
