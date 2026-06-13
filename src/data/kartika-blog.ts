// Kartika.id Blog Data
// Identik dengan interface BlogPost di blog.ts agar kompatibel dengan AdminBlogManager
// Admin bisa menambahkan artikel melalui /admin/blog dan akan muncul di halaman ini

import type { LanguageCode } from '../utils/languageManager'

export interface KartikaBlogPost {
  id: number
  slug: string
  title: string
  category: string
  excerpt: string
  image: string
  date: string
  author?: string
  status?: 'draft' | 'synced'
  customContent?: {
    introduction?: string
    keyPoints?: string[]
    language?: LanguageCode
    sections?: Array<{
      heading: string
      content: string
      image?: string
      imageAlt?: string
    }>
    conclusion?: string
  }
}

// Starter article — tambah lebih banyak artikel melalui /admin/blog
export const KARTIKA_BLOG_POSTS: KartikaBlogPost[] = [
  {
    id: 1,
    slug: 'mengenal-kartika-komunitas-perempuan-teknik-indonesia-timur',
    title: 'Mengenal Kartika.id: Komunitas Perempuan Teknik dari Indonesia Timur',
    category: 'Program',
    excerpt:
      'Kartika.id hadir sebagai ruang tumbuh bagi mahasiswi teknik dari Indonesia Timur — mempertemukan mereka dengan mentor, program beasiswa, dan komunitas yang saling menguatkan.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop',
    date: '2025-06-01',
    author: 'Tim Kartika.id',
    status: 'synced',
  },
]

// ─── Helper functions (identik dengan blog.ts punya Mangala) ──────────────────

export function getAllKartikaBlogPosts(): KartikaBlogPost[] {
  return [...KARTIKA_BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getKartikaPostsByPage(
  page: number,
  postsPerPage: number
): KartikaBlogPost[] {
  const sorted = getAllKartikaBlogPosts()
  const start = (page - 1) * postsPerPage
  return sorted.slice(start, start + postsPerPage)
}

export function getKartikaTotalPages(postsPerPage: number): number {
  return Math.max(1, Math.ceil(KARTIKA_BLOG_POSTS.length / postsPerPage))
}

export function getKartikaPostBySlug(slug: string): KartikaBlogPost | undefined {
  return KARTIKA_BLOG_POSTS.find((p) => p.slug === slug)
}
