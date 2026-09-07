import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hassan-alsanan-store-98nk.vercel.app';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    }
    // يمكنك إضافة باقي الصفحات الرئيسية هنا مثل /checkout أو الصفحات الأخرى
  ];
}


