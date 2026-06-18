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
    "status": "synced",
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
  },
  {
    "id": 3,
    "slug": "pemberdayaan-wanita",
    "title": "Pemberdayaan Wanita",
    "category": "Tips and Trick",
    "excerpt": "Pemberdayaan wanita adalah kunci untuk mencapai kesetaraan gender",
    "image": "https://images.unsplash.com/photo-1646579217809-7dbcd8120402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU2ODd8MHwxfHNlYXJjaHwxfHx3YW5pdGElMjBiZXJkYXlhfGVufDB8MHx8fDE3ODE0OTkzNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "date": "2026-06-15 04:55",
    "author": "Tim Kartika.id",
    "status": "synced",
    "customContent": {
      "introduction": "Pemberdayaan wanita adalah proses yang sangat penting untuk mencapai kesetaraan gender dan meningkatkan kualitas hidup wanita. Dalam artikel ini, kita akan membahas beberapa tips dan trik untuk meningkatkan pemberdayaan wanita, terutama dalam konteks komunitas Kartika.id. <br> Dengan menjadi bagian dari komunitas yang mendukung, wanita dapat memperoleh pengetahuan, keterampilan, dan kepercayaan diri untuk mencapai tujuan mereka. <br> Mari kita mulai dengan memahami pentingnya pemberdayaan wanita.",
      "keyPoints": [
        "Pentingnya pemberdayaan wanita",
        "Meningkatkan kesadaran dan keterampilan",
        "Membangun kepercayaan diri dan jaringan dukungan"
      ],
      "language": "id",
      "sections": [
        {
          "heading": "Memahami Pemberdayaan Wanita",
          "content": "Pemberdayaan wanita adalah proses yang membantu wanita untuk meningkatkan kualitas hidup mereka, baik secara ekonomi, sosial, maupun politik. Dengan pemberdayaan, wanita dapat memperoleh akses ke sumber daya, informasi, dan peluang yang lebih luas. <br> Pemberdayaan wanita juga membantu mengurangi kesenjangan gender dan meningkatkan kesetaraan dalam masyarakat. <br> Oleh karena itu, pemberdayaan wanita sangat penting untuk mencapai tujuan pembangunan yang berkelanjutan.",
          "image": "https://images.unsplash.com/photo-1545693315-85b6be26a3d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU2ODd8MHwxfHNlYXJjaHwxfHxrZXNldGFyYWFuJTIwZ2VuZGVyfGVufDB8MHx8fDE3ODE0OTkzNTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
          "imageAlt": "kesetaraan gender"
        },
        {
          "heading": "Meningkatkan Kesadaran dan Keterampilan",
          "content": "Salah satu cara untuk meningkatkan pemberdayaan wanita adalah dengan meningkatkan kesadaran dan keterampilan mereka. <br> Dengan memperoleh pengetahuan dan keterampilan yang tepat, wanita dapat meningkatkan kemampuan mereka untuk mengambil keputusan dan mengelola sumber daya. <br> Kartika.id menawarkan berbagai program dan sumber daya untuk membantu wanita meningkatkan kesadaran dan keterampilan mereka, termasuk pelatihan, mentoring, dan akses ke jaringan dukungan."
        },
        {
          "heading": "Membangun Kepercayaan Diri dan Jaringan Dukungan",
          "content": "Kepercayaan diri dan jaringan dukungan sangat penting untuk pemberdayaan wanita. <br> Dengan memiliki kepercayaan diri yang tinggi, wanita dapat mengambil risiko dan mencapai tujuan mereka dengan lebih mudah. <br> Jaringan dukungan juga membantu wanita untuk tetap termotivasi dan tidak merasa sendirian dalam perjalanan mereka. <br> Kartika.id menyediakan platform untuk wanita untuk terhubung dengan wanita lain yang memiliki tujuan dan minat yang sama, sehingga mereka dapat membangun jaringan dukungan yang kuat dan mendukung."
        }
      ],
      "conclusion": "Pemberdayaan wanita adalah proses yang sangat penting untuk mencapai kesetaraan gender dan meningkatkan kualitas hidup wanita. <br> Dengan memahami pentingnya pemberdayaan, meningkatkan kesadaran dan keterampilan, serta membangun kepercayaan diri dan jaringan dukungan, wanita dapat mencapai tujuan mereka dan menjadi <strong>wanita yang berdaya</strong>. <br> Kartika.id berkomitmen untuk mendukung pemberdayaan wanita dan menyediakan sumber daya dan platform untuk wanita untuk mencapai tujuan mereka."
    }
  },
  {
    "id": 4,
    "slug": "pentingnya-membangun-kepercayaan-diri",
    "title": "Pentingnya Membangun Kepercayaan Diri",
    "category": "Tips and Trick",
    "excerpt": "Membangun kepercayaan diri untuk mencapai kesuksesan",
    "image": "https://images.unsplash.com/photo-1593526613712-7b4b9a707330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU2ODd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGVtcG93ZXJtZW50fGVufDB8MHx8fDE3ODE3NTAxMjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "date": "2026-06-18 02:35",
    "author": "Tim Kartika.id",
    "status": "synced",
    "customContent": {
      "introduction": "Kepercayaan diri adalah kunci untuk mencapai kesuksesan dalam berbagai aspek kehidupan. <strong>Kartika.id</strong> memahami bahwa membangun kepercayaan diri tidaklah mudah, namun dengan tips dan trik yang tepat, Anda dapat meningkatkan kepercayaan diri dan mencapai tujuan Anda.",
      "keyPoints": [
        "Mengenal diri sendiri",
        "Mengembangkan kemampuan",
        "Mengatasi rasa takut"
      ],
      "language": "id",
      "sections": [
        {
          "heading": "Mengenal Diri Sendiri",
          "content": "Mengenal diri sendiri adalah langkah pertama untuk membangun kepercayaan diri. Anda perlu <em>mengenal kelebihan dan kekurangan</em> Anda, serta <em>mengetahui apa yang Anda inginkan</em> dari hidup. Dengan demikian, Anda dapat <strong>meningkatkan kepercayaan diri</strong> dan membuat keputusan yang tepat.",
          "imageSearchQuery": "self reflection",
          "image": "https://images.unsplash.com/photo-1515463626042-123ab67dcaa7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU2ODd8MHwxfHNlYXJjaHwxfHxzZWxmJTIwcmVmbGVjdGlvbnxlbnwwfDB8fHwxNzgxNzUwMTI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
          "imageAlt": "self reflection"
        },
        {
          "heading": "Mengembangkan Kemampuan",
          "content": "Mengembangkan kemampuan adalah langkah berikutnya untuk membangun kepercayaan diri. Anda perlu <em>belajar dan meningkatkan kemampuan</em> Anda, serta <em>menerima tantangan baru</em>. Dengan demikian, Anda dapat <strong>meningkatkan kepercayaan diri</strong> dan mencapai tujuan Anda."
        },
        {
          "heading": "Mengatasi Rasa Takut",
          "content": "Mengatasi rasa takut adalah langkah terakhir untuk membangun kepercayaan diri. Anda perlu <em>mengenal sumber rasa takut</em> Anda, serta <em>mengembangkan strategi untuk mengatasi rasa takut</em>. Dengan demikian, Anda dapat <strong>meningkatkan kepercayaan diri</strong> dan mencapai tujuan Anda."
        }
      ],
      "conclusion": "Membangun kepercayaan diri memerlukan waktu dan usaha, namun dengan tips dan trik yang tepat, Anda dapat <strong>meningkatkan kepercayaan diri</strong> dan mencapai tujuan Anda. <strong>Kartika.id</strong> berkomitmen untuk mendukung Anda dalam membangun kepercayaan diri dan mencapai kesuksesan."
    }
  },
  {
    "id": 5,
    "slug": "tips-mengembangkan-diri-dengan-kartika-id",
    "title": "Kartika.id: Tips Mengembangkan Diri",
    "category": "Tips and Trick",
    "excerpt": "Kartika.id membantu wanita mengembangkan diri dan mencapai tujuan",
    "image": "https://images.unsplash.com/photo-1646579217809-7dbcd8120402?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU2ODd8MHwxfHNlYXJjaHwxfHx3YW5pdGElMjBzdWtzZXN8ZW58MHwwfHx8MTc4MTc1MDE4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    "date": "2026-06-18 02:36",
    "author": "Tim Kartika.id",
    "status": "synced",
    "customContent": {
      "introduction": "Kartika.id adalah platform yang membantu wanita mengembangkan diri dan mencapai tujuan. Dengan berbagai sumber daya dan dukungan, Kartika.id membantu wanita meningkatkan kualitas hidup dan mencapai kesuksesan. <br> Dalam artikel ini, kita akan membahas beberapa tips dan trik untuk mengembangkan diri dengan Kartika.id.",
      "keyPoints": [
        "Mengembangkan keterampilan dan pengetahuan",
        "Meningkatkan kepercayaan diri",
        "Membangun jaringan dan komunitas"
      ],
      "language": "id",
      "sections": [
        {
          "heading": "Mengembangkan Keterampilan dan Pengetahuan",
          "content": "Kartika.id menyediakan berbagai sumber daya untuk mengembangkan keterampilan dan pengetahuan. Dengan mengikuti kursus dan pelatihan, wanita dapat meningkatkan kemampuan dan meningkatkan kesempatan untuk sukses. <em>Beberapa contoh keterampilan yang dapat dikembangkan</em> melalui Kartika.id adalah keterampilan leadership, keterampilan komunikasi, dan keterampilan manajemen waktu.",
          "imageSearchQuery": "kursus online",
          "image": "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU2ODd8MHwxfHNlYXJjaHwxfHxrdXJzdXMlMjBvbmxpbmV8ZW58MHwwfHx8MTc4MTc1MDE4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
          "imageAlt": "kursus online"
        },
        {
          "heading": "Meningkatkan Kepercayaan Diri",
          "content": "Kepercayaan diri adalah kunci untuk sukses. Kartika.id membantu wanita meningkatkan kepercayaan diri dengan menyediakan dukungan dan motivasi. <strong>Dengan berbagai program dan kegiatan</strong>, Kartika.id membantu wanita meningkatkan kesadaran diri dan meningkatkan kepercayaan diri."
        },
        {
          "heading": "Membangun Jaringan dan Komunitas",
          "content": "Jaringan dan komunitas adalah sangat penting untuk sukses. Kartika.id membantu wanita membangun jaringan dan komunitas dengan menyediakan platform untuk berbagi pengalaman dan pengetahuan. <em>Dengan bergabung dengan komunitas Kartika.id</em>, wanita dapat memperluas jaringan dan meningkatkan kesempatan untuk sukses."
        }
      ],
      "conclusion": "Dengan Kartika.id, wanita dapat mengembangkan diri dan mencapai tujuan. Dengan berbagai sumber daya dan dukungan, Kartika.id membantu wanita meningkatkan kualitas hidup dan mencapai kesuksesan. <br> Jadi, bergabunglah dengan Kartika.id hari ini dan mulailah mengembangkan diri Anda!"
    }
  },
  {
    "id": 6,
    "slug": "women-empowerment-in-indonesia",
    "title": "Empowering Women in Indonesia",
    "category": "Tips and Trick",
    "excerpt": "A comprehensive guide to women's empowerment in Indonesia",
    "image": "https://images.unsplash.com/photo-1586319826907-1ff4aadbaddc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU2ODd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwd29tZW4lMjBlbXBvd2VybWVudHxlbnwwfDB8fHwxNzgxNzUwMzIyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    "date": "2026-06-18 02:38",
    "author": "Tim Kartika.id",
    "status": "synced",
    "customContent": {
      "introduction": "In recent years, Indonesia has made significant strides in promoting women's empowerment, with various initiatives and programs aimed at bridging the gender gap. At Kartika.id, we believe that empowering women is crucial for the country's socio-economic development. In this article, we will delve into the world of women's empowerment in Indonesia, exploring the challenges, opportunities, and tips for women to reach their full potential.",
      "keyPoints": [
        "Understanding the challenges faced by Indonesian women",
        "Building a supportive community for women",
        "Developing skills and education for career advancement",
        "Promoting mental health and well-being",
        "Breaking down stereotypes and biases"
      ],
      "language": "en",
      "sections": [
        {
          "heading": "Introduction to Women's Empowerment in Indonesia",
          "content": "Indonesia has made significant progress in promoting women's rights and empowerment, with the government launching various initiatives to support women's education, health, and economic development. However, despite these efforts, many Indonesian women still face significant challenges, including limited access to education and job opportunities, as well as societal expectations that often restrict their choices. At Kartika.id, we believe that empowering women is essential for creating a more equitable and just society.",
          "imageSearchQuery": "indonesian women in workplace",
          "image": "https://images.unsplash.com/photo-1762341114881-669da93fef88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NzU2ODd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwd29tZW4lMjBpbiUyMHdvcmtwbGFjZXxlbnwwfDB8fHwxNzgxNzUwMzIzfDA&ixlib=rb-4.1.0&q=80&w=1080",
          "imageAlt": "indonesian women in workplace"
        },
        {
          "heading": "Breaking Down Barriers: Challenges Faced by Indonesian Women",
          "content": "One of the primary challenges faced by Indonesian women is the deeply ingrained patriarchal culture, which often limits their opportunities and choices. Many women are expected to prioritize their roles as wives and mothers, rather than pursuing their own careers and interests. Additionally, women in Indonesia often face discrimination and harassment in the workplace, which can make it difficult for them to advance in their careers. To overcome these challenges, it is essential for women to have a strong support system, including friends, family, and community networks."
        },
        {
          "heading": "Empowering Women through Education and Skills Development",
          "content": "Education and skills development are critical components of women's empowerment in Indonesia. By acquiring new skills and knowledge, women can increase their confidence and self-esteem, as well as enhance their career prospects. At Kartika.id, we offer a range of programs and resources to support women's education and skills development, including online courses, workshops, and mentoring programs. We believe that by investing in women's education and skills development, we can help create a more equitable and prosperous society."
        },
        {
          "heading": "Promoting Mental Health and Well-being",
          "content": "Mental health and well-being are essential aspects of women's empowerment in Indonesia. Many women in Indonesia face significant stress and pressure, particularly in their roles as caregivers and breadwinners. To promote mental health and well-being, it is essential for women to prioritize self-care and seek support when needed. At Kartika.id, we offer a range of resources and programs to support women's mental health and well-being, including counseling services, support groups, and online forums."
        },
        {
          "heading": "Building a Supportive Community for Women",
          "content": "A supportive community is critical for women's empowerment in Indonesia. By connecting with other women who share similar experiences and challenges, women can build strong networks and relationships that can help them navigate their personal and professional lives. At Kartika.id, we believe in the power of community and offer a range of programs and resources to support women's community building, including online forums, social media groups, and in-person events."
        }
      ],
      "conclusion": "Empowering women in Indonesia requires a multifaceted approach that addresses the various challenges and barriers that women face. By providing education and skills development, promoting mental health and well-being, and building supportive communities, we can help create a more equitable and prosperous society. At Kartika.id, we are committed to supporting women's empowerment in Indonesia and believe that together, we can create a brighter future for all."
    }
  },
  {
    "id": 7,
    "slug": "being-a-woman-engineer-in-indonesia",
    "title": "Being a woman engineer in Indonesia",
    "category": "Tips and Trick",
    "excerpt": "Menavigasi karir di bidang teknik bagi perempuan menghadirkan tantangan unik sekaligus peluang luar biasa. Artikel ini membahas strategi dan pengalaman inspiratif yang bisa menjadi referensi.",
    "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
    "date": "2026-06-18 02:39",
    "author": "Tim Kartika.id",
    "status": "draft",
    "customContent": {
      "introduction": "<p>Dunia keteknikan sering kali dianggap sebagai ranah yang didominasi oleh laki-laki. Namun, perlahan tapi pasti, batasan ini mulai ditembus oleh para perempuan tangguh yang membuktikan bahwa kompetensi tidak mengenal gender.</p>\n<p>Topik tentang <strong>Being a woman engineer in Indonesia</strong> menjadi semakin relevan saat kita berbicara tentang pembangunan inklusif. Di berbagai industri, mulai dari pertambangan, sipil, hingga teknologi informasi, kehadiran insinyur perempuan membawa perspektif baru yang lebih komprehensif dalam pemecahan masalah.</p>",
      "keyPoints": [
        "Pentingnya membangun jejaring (networking) dengan sesama insinyur perempuan.",
        "Mengatasi imposter syndrome di lingkungan kerja yang didominasi laki-laki.",
        "Peran mentorship dalam akselerasi karir profesional."
      ],
      "language": "en",
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
