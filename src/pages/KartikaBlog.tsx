import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import '../../public/style.css'
import './Home.css'
import './Blog.css'
import { KARTIKA_BLOG_POSTS, type KartikaBlogPost } from '../data/kartika-blog'
import { generateBreadcrumbSchema, generateWebPageSchema } from '../utils/seoEnhancements'

// ── Helper: Merge base data with localStorage drafts ─────────────────────────
function getMergedPosts(): KartikaBlogPost[] {
  const basePosts = [...KARTIKA_BLOG_POSTS]
  try {
    const raw = localStorage.getItem('kartika_blog_drafts')
    if (raw) {
      const drafts = JSON.parse(raw) as KartikaBlogPost[]
      const merged = [...basePosts]
      drafts.forEach(draft => {
        const index = merged.findIndex(p => p.id === draft.id)
        if (index !== -1) merged[index] = draft
        else merged.push(draft)
      })
      return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  } catch { /* ignore */ }
  return basePosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

const POSTS_PER_PAGE = 8

const KartikaBlog: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isArchiveExpanded, setIsArchiveExpanded] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const [searchParams] = useSearchParams()

  // Pagination with merged data
  const rawPage = Number.parseInt(searchParams.get('page') || '1', 10)
  const allPosts = getMergedPosts()
  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE))
  const currentPage = Number.isNaN(rawPage) ? 1 : Math.min(Math.max(rawPage, 1), totalPages)

  const start = (currentPage - 1) * POSTS_PER_PAGE
  const posts = allPosts.slice(start, start + POSTS_PER_PAGE)

  const buildPageUrl = (page: number) => (page <= 1 ? '/blog' : `/blog?page=${page}`)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Body class for Kartika styling
  useEffect(() => {
    document.body.classList.add('kartika-home-active')
    return () => {
      document.body.classList.remove('kartika-home-active')
    }
  }, [])

  // Scroll detection for header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const schemaBreadcrumb = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
  ])
  const schemaWebPage = generateWebPageSchema({
    title: 'Blog | Kartika.id — Kartini Teknik Berdaya',
    description: 'Artikel dan inspirasi seputar perempuan teknik, beasiswa, dan program pemberdayaan dari Indonesia Timur ke Nasional.',
    url: '/blog',
  })
  const schemaItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Artikel Blog Kartika.id',
    'description': 'Kumpulan artikel tentang perempuan di bidang teknik dan STEM Indonesia',
    'numberOfItems': allPosts.length,
    'itemListElement': allPosts.slice(0, 10).map((p, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': p.title,
      'url': `https://kartika.id/blog/${p.slug}`,
    })),
  }

  return (
    <div className="kartika-home">
      <Helmet>
        <title>Blog | Kartika.id — Kartini Teknik Berdaya</title>
        <meta name="description" content="Artikel dan inspirasi seputar perempuan teknik, beasiswa, dan program pemberdayaan dari Indonesia Timur ke Nasional." />
        <meta property="og:title" content="Blog | Kartika.id" />
        <meta property="og:description" content="Artikel dan inspirasi seputar perempuan teknik, beasiswa, dan program pemberdayaan." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kartika.id/blog" />
        <meta property="og:image" content="https://kartika.id/images/Kartika-logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | Kartika.id" />
        <meta name="twitter:description" content="Artikel inspirasi perempuan teknik Indonesia." />
        <meta name="keywords" content="blog perempuan teknik, kartika.id blog, women in engineering indonesia, STEM perempuan, artikel teknik" />
        <link rel="canonical" href="https://kartika.id/blog" />
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaWebPage)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaItemList)}</script>
        <link
          href="https://fonts.googleapis.com/css2?family=Gelasio:wght@600&family=Josefin+Sans:wght@600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </Helmet>

      {/* ── NAVIGATION (identical to Home.tsx) ────────────────────────────── */}
      <header
        ref={headerRef}
        className={`kartika-header ${isScrolled ? 'scrolled' : ''}`}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '10px 20px',
            width: '100%',
            boxSizing: 'border-box',
            flexDirection: 'row',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              width: '280px',
              flexShrink: 0,
            }}
          >
            <Link to="/">
              <img
                src="/images/Kartika-logo.png"
                alt="Kartika.id Logo"
                className="header-logo-img"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Link>
            <p
              style={{
                margin: '5px 0 0 0',
                color: '#FEFAE4',
                fontFamily: '"Josefin Sans", sans-serif',
                fontSize: '0.95em',
                fontWeight: 'normal',
              }}
            >
              Kartini Teknik Berdaya
            </p>
          </div>

          <div
            className="nav-links"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '15px',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/#about-us">About Us</Link>
            <Link to="/#our-programs">Our Programs</Link>
            <Link to="/#our-team">Our Team</Link>
            <Link to="/blog" style={{ fontWeight: 700, textDecoration: 'underline' }}>
              Blog
            </Link>
            <a
              href="https://bit.ly/KartikaID_3rdGen_Registration_Form"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              Join Now
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        style={{
          // background: '#ff8558',
          // background: '#D04A02',
          padding: '160px 20px 80px',
          textAlign: 'center',
          minHeight: '40vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: '"Gelasio", serif',
              color: '#FEFAE4',
              fontSize: '3em',
              fontWeight: 600,
              margin: '0 0 16px',
            }}
          >
            Blog & Artikel
          </h1>
          <p
            style={{
              fontFamily: '"Josefin Sans", sans-serif',
              color: '#FEFAE4',
              fontSize: '1.2em',
              maxWidth: '600px',
              margin: '0 auto',
              opacity: 0.9,
            }}
          >
            Cerita, inspirasi, dan panduan dari dan untuk perempuan teknik Indonesia Timur
          </p>
        </div>
      </section>

      {/* ── BLOG GRID (same structure as Mangala's Blog.tsx) ──────────────── */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

          {posts.length === 0 ? (
            /* Empty state */
            <div
              style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: '#666',
                fontFamily: '"Josefin Sans", sans-serif',
              }}
            >
              <h2 style={{ color: '#D04A02', fontFamily: '"Gelasio", serif', marginBottom: 12 }}>
                Artikel Segera Hadir
              </h2>
              <p>Tim Kartika.id sedang menyiapkan konten terbaik untuk kamu.</p>
            </div>
          ) : (
            /* Article grid — uses the same .blog-grid / .blog-card classes from Blog.css */
            <div className="blog-grid">
              {posts.map((post) => (
                <article key={post.id} className="blog-card">
                  <Link to={`/blog/${post.slug}`} className="blog-card-link">
                    <div className="blog-card-image">
                      <img
                        src={post.image}
                        alt={`${post.title} - Kartika.id`}
                        loading="lazy"
                        width="400"
                        height="250"
                      />
                      {/* Replace MANGALA badge with KARTIKA */}
                      <div
                        className="blog-card-badge"
                        style={{ background: '#ff8558' }}
                      >
                        KARTIKA
                      </div>
                    </div>
                    <div className="blog-card-content">
                      <span className="blog-card-category">
                        {post.category.toUpperCase()}
                      </span>
                      <h3 className="blog-card-title">{post.title}</h3>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* ── Pagination (same logic as Blog.tsx) ─────────────────────── */}
          {totalPages > 1 && (
            <nav className="blog-pagination" aria-label="Blog pagination">
              {currentPage > 1 && (
                <Link
                  to={buildPageUrl(currentPage - 1)}
                  className="pagination-btn pagination-prev"
                  aria-label="Previous page"
                >
                  Sebelumnya
                </Link>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  to={buildPageUrl(page)}
                  className={`pagination-btn pagination-number ${currentPage === page ? 'active' : ''}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </Link>
              ))}

              {currentPage < totalPages && (
                <Link
                  to={buildPageUrl(currentPage + 1)}
                  className="pagination-btn pagination-next"
                  aria-label="Next page"
                >
                  Selanjutnya
                </Link>
              )}
            </nav>
          )}

          {/* ── Archive list (collapsible, same as Blog.tsx) ─────────────── */}
          {allPosts.length > POSTS_PER_PAGE && (
            <div
              style={{
                marginTop: '4rem',
                paddingTop: '3rem',
                borderTop: '1px solid #e0e0e0',
              }}
            >
              <button
                onClick={() => setIsArchiveExpanded(!isArchiveExpanded)}
                aria-expanded={isArchiveExpanded}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '1rem 0',
                  cursor: 'pointer',
                  color: '#D04A02',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  fontFamily: '"Josefin Sans", sans-serif',
                }}
              >
                <span>Semua Artikel Kartika.id</span>
                <span>{isArchiveExpanded ? '▲' : '▼'}</span>
              </button>
              <nav
                aria-hidden={!isArchiveExpanded}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '10px 20px',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s ease, opacity 0.3s ease',
                  maxHeight: isArchiveExpanded ? '800px' : '0',
                  opacity: isArchiveExpanded ? 1 : 0,
                  paddingTop: isArchiveExpanded ? '1rem' : '0',
                  paddingBottom: isArchiveExpanded ? '1rem' : '0',
                }}
              >
                {allPosts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    style={{
                      color: '#555',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #f0f0f0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: '"Josefin Sans", sans-serif',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#D04A02')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                  >
                    {post.title}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* ── CTA Banner ───────────────────────────────────────────────── */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '64px',
              padding: '40px',
              // background: '#D04A02',
              borderRadius: '16px',
              color: '#FEFAE4',
            }}
          >
            <h3
              style={{
                fontFamily: '"Gelasio", serif',
                fontSize: '1.8em',
                margin: '0 0 12px',
              }}
            >
              Lebih Banyak Artikel Segera Hadir
            </h3>
            <p
              style={{
                fontFamily: '"Josefin Sans", sans-serif',
                opacity: 0.9,
                maxWidth: '480px',
                margin: '0 auto 24px',
              }}
            >
              Tim Kartika.id sedang menyiapkan konten inspiratif. Ikuti kami untuk update terbaru!
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <a
                href="https://www.instagram.com/kartikaidn/"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#FEFAE4',
                  // background: '#bfbfbfff',
                  color: '#D04A02',
                  padding: '10px 24px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontFamily: '"Josefin Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.9em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="fab fa-instagram" /> Instagram
              </a>
              <a
                href="https://www.linkedin.com/company/kartika-id"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'transparent',
                  color: '#FEFAE4',
                  padding: '10px 24px',
                  borderRadius: '25px',
                  textDecoration: 'none',
                  fontFamily: '"Josefin Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.9em',
                  border: '2px solid #FEFAE4',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="fab fa-linkedin" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER (identical to Home.tsx) ───────────────────────────────── */}
      <footer style={{ position: 'relative', zIndex: 1000 }}>
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Connect With Us</h3>
              <div className="footer-links-row">
                <a href="https://www.instagram.com/kartikaidn/" target="_blank" rel="noreferrer">
                  <i className="fab fa-instagram" /> Instagram
                </a>
                <a href="https://www.linkedin.com/company/kartika-id" target="_blank" rel="noreferrer">
                  <i className="fab fa-linkedin" /> LinkedIn
                </a>
                <a href="mailto:kartiniteknikberdaya@gmail.com">
                  <i className="fas fa-envelope" /> Email: kartiniteknikberdaya@gmail.com
                </a>
                <a href="https://wa.me/+6282314332942" target="_blank" rel="noreferrer">
                  <i className="fab fa-whatsapp"></i> Contact Center (Head of Partnership)
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default KartikaBlog
