import { DEFAULT_IMAGE_RIGHTS_METADATA } from './structuredData'

// Advanced SEO Enhancement Utilities for Kartika.id

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://kartika.id${item.url}`
    }))
  }
}

export const generateWebPageSchema = (page: {
  title: string
  description: string
  url: string
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": page.title,
    "description": page.description,
    "url": `https://kartika.id${page.url}`,
    "inLanguage": "id-ID",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Kartika.id",
      "url": "https://kartika.id"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kartika.id",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kartika.id/images/Kartika-logo.png"
      }
    }
  }
}

export const generateMetaDescription = (type: 'home' | 'blog' | 'page') => {
  const descriptions = {
    home: "Kartika.id (Kartini Teknik Berdaya) adalah komunitas pemberdayaan perempuan di bidang teknik (STEM) Indonesia. Kami mendukung mahasiswi teknik melalui mentoring dan networking.",
    blog: "Baca artikel inspiratif tentang peran perempuan di bidang teknik, tips karir STEM, dan cerita sukses female engineers dari Kartika.id.",
    page: "Komunitas Kartini Teknik Berdaya (Kartika.id). Membangun masa depan yang lebih baik untuk perempuan di bidang teknik dan STEM."
  }
  return descriptions[type]
}

export const generateOGTags = (params: {
  title: string
  description: string
  image?: string
  url: string
  type?: 'website' | 'article'
}) => {
  return {
    'og:type': params.type || 'website',
    'og:title': params.title,
    'og:description': params.description,
    'og:image': params.image || 'https://kartika.id/images/Kartika-logo.png',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:url': `https://kartika.id${params.url}`,
    'og:site_name': 'Kartika.id',
    'og:locale': 'id_ID'
  }
}

export const calculateReadingTime = (content: string): string => {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `PT${minutes}M`
}

export default {
  generateBreadcrumbSchema,
  generateWebPageSchema,
  generateMetaDescription,
  generateOGTags,
  calculateReadingTime
}
