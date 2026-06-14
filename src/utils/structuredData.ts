// Structured Data utilities for Kartika.id

export const DEFAULT_IMAGE_RIGHTS_METADATA = {
  copyrightNotice: "Copyright 2026 Kartika.id. All rights reserved.",
  creator: {
    "@type": "Organization",
    "name": "Kartika.id",
    "url": "https://kartika.id"
  }
} as const

export const generateImageObjectSchema = (image: {
  url: string
  alt?: string
  title?: string
  width?: number
  height?: number
  contentUrl?: string
  description?: string
  caption?: string
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "url": image.url,
    "contentUrl": image.contentUrl || image.url,
    "caption": image.caption || image.alt || image.title || "Kartini Teknik Berdaya - Kartika.id",
    "description": image.description || image.alt || image.title || "Empowering Female Engineers in Indonesia",
    ...(image.width && { "width": image.width }),
    ...(image.height && { "height": image.height }),
    "creditText": "Kartika.id",
    "copyrightHolder": {
      "@type": "Organization",
      "name": "Kartika.id"
    },
    ...DEFAULT_IMAGE_RIGHTS_METADATA,
    "publisher": {
      "@type": "Organization",
      "name": "Kartika.id",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kartika.id/images/Kartika-logo.png",
        ...DEFAULT_IMAGE_RIGHTS_METADATA
      }
    }
  }
}

// Generate BlogPosting Schema for SEO
export const generateBlogPostingSchema = (post: {
  title: string
  excerpt: string
  slug: string
  date: string
  image: string
  category: string
  author?: string
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author || "Tim Kartika.id"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kartika.id",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kartika.id/images/Kartika-logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://kartika.id/blog/${post.slug}`
    },
    "articleSection": post.category,
    "inLanguage": "id-ID",
    "keywords": [
      "women in engineering",
      "perempuan teknik",
      "kartini teknik berdaya",
      "pendidikan teknik",
      "pemberdayaan perempuan",
      "STEM indonesia"
    ]
  }
}

export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": ["NGO", "EducationalOrganization", "Organization"],
    "name": "Kartika.id - Kartini Teknik Berdaya",
    "alternateName": "Kartika.id",
    "url": "https://kartika.id",
    "logo": "https://kartika.id/images/Kartika-logo.png",
    "image": "https://kartika.id/images/Kartika-logo.png",
    "description": "Kartika.id (Kartini Teknik Berdaya) is a community and NGO dedicated to empowering female engineering students in Indonesia through mentorship, networking, and skill development.",
    "foundingDate": "2023",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "email": "hello@kartika.id",
        "contactType": "customer support",
        "availableLanguage": ["Indonesian", "English"],
        "areaServed": "ID"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/connect.kartika.id",
      "https://www.linkedin.com/company/kartika-id"
    ],
    "keywords": "women in engineering, perempuan teknik, kartika.id, kartini teknik berdaya, female engineers indonesia, teknik mesin, STEM indonesia, komunitas perempuan teknik"
  }
}
