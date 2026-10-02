import { ToolDef } from '../types/tools';
import { SEO_METADATA } from '../data/seoMeta';

export function updatePageSeo(tool: ToolDef | null, lang: string) {
  const isArabic = lang === 'ar';
  const baseUrl = 'https://kantopdf.com';
  const canonicalPath = tool ? `/${lang}/${tool.id}` : `/${lang}/`;
  const alternateEnPath = tool ? `/en/${tool.id}` : `/en/`;
  const alternateArPath = tool ? `/ar/${tool.id}` : `/ar/`;

  // 1. Title & Description
  let title = isArabic
    ? 'كانتو PDF — منظومة معالجة PDF الآمنة والسيادية | 30 أداة سريعة'
    : 'Kanto PDF — The Pure, Private In-Browser PDF Suite | 30 Free Tools';

  let description = isArabic
    ? 'مجموعة أدوات PDF الشاملة والمجانية — دمج، تقسيم، ضغط، تعديل، وتحويل ملفات PDF إلى Word و Excel وصور بسرعة وأمان تام داخل المتصفح دون رفع بياناتك.'
    : 'Free, All-in-One Online PDF Editor & Converter — Merge, Split, Compress, OCR, and Convert PDF to Word, Excel, JPG, and PowerPoint instantly with 100% private, client-side browser processing.';

  if (tool && SEO_METADATA[tool.id]) {
    const meta = SEO_METADATA[tool.id];
    title = isArabic ? meta.titleAr : meta.titleEn;
    description = isArabic ? meta.descAr : meta.descEn;
  }

  document.title = title;

  // Helper to set or update meta tag
  const setMetaTag = (attrName: string, attrValue: string, content: string) => {
    let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attrName, attrValue);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  // Standard Description
  setMetaTag('name', 'description', description);

  // Open Graph Social Tags
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', `${baseUrl}${canonicalPath}`);
  setMetaTag('property', 'og:type', tool ? 'article' : 'website');
  setMetaTag('property', 'og:image', `${baseUrl}/og/${tool ? tool.id : 'home'}-${lang}.png`);
  setMetaTag('property', 'og:site_name', 'Kanto PDF');

  // Twitter Card Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  setMetaTag('name', 'twitter:image', `${baseUrl}/og/${tool ? tool.id : 'home'}-${lang}.png`);

  // Canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', `${baseUrl}${canonicalPath}`);

  // Hreflang links
  let altEn = document.querySelector('link[rel="alternate"][hreflang="en"]') as HTMLLinkElement;
  if (!altEn) {
    altEn = document.createElement('link');
    altEn.setAttribute('rel', 'alternate');
    altEn.setAttribute('hreflang', 'en');
    document.head.appendChild(altEn);
  }
  altEn.setAttribute('href', `${baseUrl}${alternateEnPath}`);

  let altAr = document.querySelector('link[rel="alternate"][hreflang="ar"]') as HTMLLinkElement;
  if (!altAr) {
    altAr = document.createElement('link');
    altAr.setAttribute('rel', 'alternate');
    altAr.setAttribute('hreflang', 'ar');
    document.head.appendChild(altAr);
  }
  altAr.setAttribute('href', `${baseUrl}${alternateArPath}`);

  // 2. Structured Data (JSON-LD) with Organization, WebApplication, BreadcrumbList, HowTo
  const existingJsonLd = document.getElementById('kanto-dynamic-jsonld');
  if (existingJsonLd) {
    existingJsonLd.remove();
  }

  const schemas: Record<string, unknown>[] = [
    // Global Organization Schema (E-E-A-T)
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Kanto PDF',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: 'Sovereign in-browser client-side PDF tool engine providing 100% data privacy and offline zero-leak execution.',
      sameAs: [
        'https://github.com/kanto-pdf',
        'https://twitter.com/kantopdf'
      ]
    },
    // WebApplication Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool ? (isArabic ? SEO_METADATA[tool.id]?.titleAr : SEO_METADATA[tool.id]?.titleEn) || 'Kanto PDF' : 'Kanto PDF',
      url: `${baseUrl}${canonicalPath}`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'All',
      description: description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      }
    }
  ];

  if (tool && SEO_METADATA[tool.id]) {
    const meta = SEO_METADATA[tool.id];
    const steps = isArabic ? meta.howToStepsAr : meta.howToStepsEn;

    // BreadcrumbList Schema (Home -> Category -> Tool)
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: isArabic ? 'الرئيسية' : 'Home',
          item: `${baseUrl}/${lang}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: isArabic ? meta.titleAr : meta.titleEn,
          item: `${baseUrl}${canonicalPath}`
        }
      ]
    });

    // HowTo Schema
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: isArabic ? `كيفية استخدام ${meta.titleAr}` : `How to use ${meta.titleEn}`,
      description: description,
      step: steps.map((step, idx) => ({
        '@type': 'HowToStep',
        position: idx + 1,
        name: step.name,
        text: step.text
      }))
    });
  }

  const scriptTag = document.createElement('script');
  scriptTag.id = 'kanto-dynamic-jsonld';
  scriptTag.type = 'application/ld+json';
  scriptTag.textContent = JSON.stringify(schemas);
  document.head.appendChild(scriptTag);
}
