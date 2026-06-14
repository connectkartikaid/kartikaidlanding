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
    "id": 1,
    "slug": "mengenal-kartika-komunitas-perempuan-teknik-indonesia-timur",
    "title": "Mengenal Kartika.id: Komunitas Perempuan Teknik dari Indonesia Timur",
    "category": "Program",
    "excerpt": "Kartika.id hadir sebagai ruang tumbuh bagi mahasiswi teknik dari Indonesia Timur — mempertemukan mereka dengan mentor, program beasiswa, dan komunitas yang saling menguatkan.",
    "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
    "date": "2025-06-01",
    "author": "Tim Kartika.id",
    "status": "synced"
  },
  {
    "id": 2,
    "slug": "tes",
    "title": "tes",
    "category": "Tips and Trick",
    "excerpt": "Menavigasi karir di bidang teknik bagi perempuan menghadirkan tantangan unik sekaligus peluang luar biasa. Artikel ini membahas strategi dan pengalaman inspiratif yang bisa menjadi referensi.",
    "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
    "date": "2026-06-14 10:17",
    "author": "Tim Kartika.id",
    "status": "draft",
    "customContent": {
      "introduction": "<p>Dunia keteknikan sering kali dianggap sebagai ranah yang didominasi oleh laki-laki. Namun, perlahan tapi pasti, batasan ini mulai ditembus oleh para perempuan tangguh yang membuktikan bahwa kompetensi tidak mengenal gender.</p>\n<p>Topik tentang <strong>tes</strong> menjadi semakin relevan saat kita berbicara tentang pembangunan inklusif. Di berbagai industri, mulai dari pertambangan, sipil, hingga teknologi informasi, kehadiran insinyur perempuan membawa perspektif baru yang lebih komprehensif dalam pemecahan masalah.</p>",
      "keyPoints": [
        "Pentingnya membangun jejaring (networking) dengan sesama insinyur perempuan.",
        "Mengatasi imposter syndrome di lingkungan kerja yang didominasi laki-laki.",
        "Peran mentorship dalam akselerasi karir profesional."
      ],
      "language": "id",
      "sections": [
        {
          "heading": "Membangun Kepercayaan Diri di Lapangan",
          "content": "<p>Salah satu tantangan terbesar bagi perempuan di bidang teknik adalah membangun kepercayaan diri, terutama saat harus mengambil keputusan di lapangan kerja. Berdasarkan pengalaman dari berbagai mentor di Kartika.id, kunci utamanya adalah persiapan teknis yang matang dan kemampuan komunikasi yang asertif.</p><p>Ketika seorang perempuan mampu menyampaikan ide teknisnya dengan jelas dan berlandaskan data, respek dari rekan kerja—baik laki-laki maupun perempuan—akan tumbuh dengan sendirinya.</p>"
        },
        {
          "heading": "Mencari Mentor yang Tepat",
          "content": "<p>Tidak ada yang lebih berharga dibandingkan belajar dari mereka yang sudah lebih dulu melewati jalan yang sama. Program seperti Kartiship memberikan wadah bagi mahasiswi teknik untuk terhubung dengan profesional wanita. Mereka tidak hanya memberikan bimbingan teknis, tetapi juga insight tentang <em>work-life balance</em> dan negosiasi gaji.</p>"
        }
      ],
      "conclusion": "<p>Perjalanan karir di bidang teknik bagi perempuan memang memiliki tantangannya tersendiri. Namun, dengan dukungan komunitas, mentorship yang tepat, serta kepercayaan diri yang kuat, setiap hambatan dapat diubah menjadi pijakan untuk mencapai kesuksesan yang lebih tinggi.</p>"
    }
  }
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
